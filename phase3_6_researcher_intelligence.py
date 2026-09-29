import sys
import json
import re
import psycopg
import fitz
import networkx as nx
from inference_router import generate_with_fallback

def extract_metadata_from_pdf(pdf_path: str):
    """Use local LLM to extract full academic metadata."""
    doc = fitz.open(pdf_path)
    # Read first 4 pages for authors/abstract, and last 2 pages for references/conclusion
    text_start = "".join([doc[page_num].get_text() for page_num in range(min(4, len(doc)))])
    text_end = "".join([doc[page_num].get_text() for page_num in range(max(0, len(doc)-2), len(doc))])
    doc.close()

    prompt = f"""Analyze the following academic text. Extract the requested information.
Return ONLY valid JSON in this exact format, no markdown, no extra text:
{{
  "authors": ["Author Name 1", "Author Name 2"],
  "sections": ["Introduction", "Methodology", "Results", "Conclusion"],
  "methods": ["Method 1 used", "Method 2 used"],
  "limitations": "Brief summary of limitations mentioned",
  "future_work": "Brief summary of future work suggested",
  "citations": [{{"title": "Paper Title", "author": "Cited Author", "year": "Year"}}]
}}

Text (Start):
{text_start[:2000]}

Text (End - References/Conclusion):
{text_end[:2000]}"""

    print("🧠 Extracting full metadata using Local LLM...")
    response = generate_with_fallback("You are a strict JSON extractor.", prompt)
    
    json_match = re.search(r'\{.*\}', response, re.DOTALL)
    if json_match:
        return json.loads(json_match.group(0))
    return {"authors": [], "sections": [], "methods": [], "limitations": "", "future_work": "", "citations": []}

def save_metadata(doc_id: str, metadata: dict):
    conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO document_metadata (doc_id, authors, citations, sections, methods, limitations, future_work)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (doc_id) DO UPDATE SET 
            authors = EXCLUDED.authors, citations = EXCLUDED.citations,
            sections = EXCLUDED.sections, methods = EXCLUDED.methods,
            limitations = EXCLUDED.limitations, future_work = EXCLUDED.future_work;
    """, (doc_id, json.dumps(metadata["authors"]), json.dumps(metadata["citations"]), 
          json.dumps(metadata["sections"]), json.dumps(metadata["methods"]), 
          metadata["limitations"], metadata["future_work"]))
    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ Full metadata saved for {doc_id}")

def build_and_print_graphs():
    conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
    cursor = conn.cursor()
    cursor.execute("SELECT doc_id, authors, citations FROM document_metadata;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        print("❌ No metadata found in database.")
        return

    G_collab = nx.Graph()
    G_lineage = nx.DiGraph()

    for doc_id, authors, citations in rows:
        for author in authors: G_collab.add_node(author)
        for i in range(len(authors)):
            for j in range(i + 1, len(authors)):
                G_collab.add_edge(authors[i], authors[j])

        G_lineage.add_node(doc_id)
        for cite in citations:
            cite_title = f"{cite.get('author', 'Unknown')} ({cite.get('year', 'N/A')}) - {cite.get('title', 'Unknown')[:30]}"
            G_lineage.add_node(cite_title)
            G_lineage.add_edge(doc_id, cite_title)

    print("\n" + "="*60)
    print(" COLLABORATION GRAPH (Co-Authorship)")
    print("="*60)
    for edge in G_collab.edges(): print(f"🤝 {edge[0]} <--> {edge[1]}")

    print("\n" + "="*60)
    print("📜 LINEAGE GRAPH (Citations)")
    print("="*60)
    for edge in G_lineage.edges(): print(f" {edge[0]} ── cites ──> {edge[1]}")
    print("="*60 + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "extract":
        pdf_path = sys.argv[2] if len(sys.argv) > 2 else "C:/Users/Administrator/Downloads/10.2478_jagi-2020-0003.pdf"
        doc_id = "doc-final"
        metadata = extract_metadata_from_pdf(pdf_path)
        print("Extracted:", json.dumps(metadata, indent=2))
        save_metadata(doc_id, metadata)
    else:
        build_and_print_graphs()