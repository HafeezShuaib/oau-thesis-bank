from pathlib import Path
import fitz
from .chunking.chunker import normalize_text, chunk_text

SECTION_ALIASES = {
 "title":["title"], "abstract":["abstract"], "introduction":["introduction"],
 "literature_review":["literature review","review of literature"], "methodology":["methodology","research methodology"],
 "results":["results","findings"], "discussion":["discussion"], "conclusion":["conclusion","conclusions"],
 "references":["references","bibliography"], "limitations":["limitations","study limitations"], "future_work":["future work","recommendations","future research"]}

def extract_pdf(path: str):
    doc=fitz.open(path); pages=[]; ocr_pages=[]
    for i,page in enumerate(doc,1):
        text=normalize_text(page.get_text("text"))
        if not text or len(text)<30:
            ocr_pages.append(i)
        pages.append({"page":i,"text":text,"source":"digital" if text else "ocr_required"})
    return pages, ocr_pages

def detect_sections(pages):
    hits={}
    for p in pages:
        for line in p["text"].splitlines():
            candidate=line.strip().lower().rstrip(":")
            for section,aliases in SECTION_ALIASES.items():
                if candidate in aliases:
                    hits.setdefault(section, p["page"])
    return hits

def process_pdf(path: str, document_id: str):
    pages,ocr_pages=extract_pdf(path)
    sections=detect_sections(pages)
    full="\n".join(p["text"] for p in pages if p["text"])
    chunks=chunk_text(full)
    return {"document_id":document_id,"pages":pages,"ocr_pages":ocr_pages,"sections":sections,"chunks":[{"document_id":document_id,"page":None,"section":None,"chunk_id":f"{document_id}:{c.index}","chunk_index":c.index,"source":"pdf","processing_version":"3.1.0","text":c.text} for c in chunks]}
