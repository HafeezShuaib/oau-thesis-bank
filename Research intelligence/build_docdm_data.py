"""
Step 1: download arXiv PDFs with a provenance + license manifest.

    python download.py --out_dir pdfs --total 50

By default only papers whose license page says CC-BY, CC-BY-SA or CC0 are kept
(--license_mode permissive). Most arXiv papers use arXiv's own non-exclusive
license, so the script has to scan many candidates; expect it to take a while
(it waits between requests to be polite to arXiv).

--license_mode any   downloads everything but marks non-permissive papers
                     usage_status="internal-only" in the manifest.

The license is read from each paper's arXiv abstract page. Treat it as a
best-effort record and double-check before publishing anything.
"""
import argparse
import datetime
import json
import re
import time
import xml.etree.ElementTree as ET
from pathlib import Path

import requests

API = "http://export.arxiv.org/api/query"
NS = {"a": "http://www.w3.org/2005/Atom"}
HEADERS = {"User-Agent": "docdm-dataset-builder/0.1 (research use)"}
DEFAULT_CATEGORIES = ["cs.CL", "cs.IR", "cs.CY", "stat.AP", "q-bio.QM", "econ.GN", "physics.soc-ph"]
PERMISSIVE = {"cc-by", "cc-by-sa", "cc0"}


def classify_license(url):
    if not url:
        return "unknown"
    u = url.lower()
    if "publicdomain/zero" in u:
        return "cc0"
    if "/licenses/by-sa/" in u:
        return "cc-by-sa"
    if "/licenses/by/" in u:
        return "cc-by"
    if "arxiv.org/licenses/nonexclusive-distrib" in u:
        return "arxiv-nonexclusive"
    return "other-restricted"


def license_from_abs(arxiv_id):
    r = requests.get(f"https://arxiv.org/abs/{arxiv_id}", headers=HEADERS, timeout=60)
    if r.status_code != 200:
        return None
    urls = re.findall(r'href="(https?://(?:creativecommons\.org|arxiv\.org)/(?:licenses|publicdomain)/[^"]+)"', r.text)
    return urls[0] if urls else None


def arxiv_search(cat, n, start):
    params = {"search_query": f"cat:{cat}", "start": start, "max_results": n,
              "sortBy": "submittedDate", "sortOrder": "descending"}
    r = requests.get(API, params=params, headers=HEADERS, timeout=60)
    r.raise_for_status()
    out = []
    for e in ET.fromstring(r.text).findall("a:entry", NS):
        aid = e.find("a:id", NS).text.strip().split("/abs/")[-1]
        title = re.sub(r"\s+", " ", e.find("a:title", NS).text).strip()
        out.append({"arxiv_id": re.sub(r"v\d+$", "", aid), "title": title, "category": cat})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out_dir", default="pdfs")
    ap.add_argument("--total", type=int, default=50)
    ap.add_argument("--categories", nargs="+", default=DEFAULT_CATEGORIES)
    ap.add_argument("--license_mode", choices=["permissive", "any"], default="permissive")
    ap.add_argument("--max_scan", type=int, default=300, help="max candidates to check per category")
    ap.add_argument("--delay", type=float, default=3.0)
    args = ap.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.jsonl"
    seen = set()
    if manifest_path.exists():
        seen = {json.loads(l)["doc_id"] for l in open(manifest_path) if l.strip()}
    manifest = open(manifest_path, "a")

    per_cat = -(-args.total // len(args.categories))
    saved = len(seen)
    print(f"{saved} documents already in manifest")

    for cat in args.categories:
        got, scanned, start = 0, 0, 0
        print(f"[{cat}] target {per_cat}")
        while got < per_cat and scanned < args.max_scan and saved < args.total:
            try:
                entries = arxiv_search(cat, 50, start)
            except Exception as e:
                print("  search failed:", e)
                break
            time.sleep(args.delay)
            if not entries:
                break
            start += 50
            for en in entries:
                if got >= per_cat or scanned >= args.max_scan or saved >= args.total:
                    break
                scanned += 1
                doc_id = re.sub(r"[^A-Za-z0-9._-]", "_", en["arxiv_id"])
                if doc_id in seen:
                    continue
                try:
                    lic_url = license_from_abs(en["arxiv_id"])
                except Exception as e:
                    print("  license lookup failed:", e)
                    lic_url = None
                time.sleep(args.delay)
                lic = classify_license(lic_url)
                permissive = lic in PERMISSIVE
                if args.license_mode == "permissive" and not permissive:
                    continue
                try:
                    r = requests.get(f"https://arxiv.org/pdf/{en['arxiv_id']}", headers=HEADERS, timeout=120)
                except Exception as e:
                    print("  download failed:", e)
                    continue
                time.sleep(args.delay)
                if r.status_code != 200 or not r.content.startswith(b"%PDF"):
                    continue
                (out_dir / f"{doc_id}.pdf").write_bytes(r.content)
                entry = {"doc_id": doc_id, "source": "arxiv", "title": en["title"], "category": cat,
                         "url": f"https://arxiv.org/abs/{en['arxiv_id']}", "license_url": lic_url,
                         "license": lic, "download_date": datetime.date.today().isoformat(),
                         "usage_status": "public-permissive" if permissive else "internal-only"}
                manifest.write(json.dumps(entry) + "\n")
                manifest.flush()
                seen.add(doc_id)
                got += 1
                saved += 1
                print(f"  [{saved}/{args.total}] {doc_id} ({lic}) {en['title'][:55]}")
        print(f"  [{cat}] kept {got} after scanning {scanned}")

    manifest.close()
    print(f"\nDone: {saved} documents in {out_dir.resolve()}")
    if saved < args.total:
        print("Fewer than requested. Permissive licenses are rare on arXiv: raise --max_scan, "
              "add categories, or use --license_mode any (internal-only).")


if __name__ == "__main__":
    main()