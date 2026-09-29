import sys
import psycopg
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF for reading PDFs

print("Loading embedding model...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

def check_similarity(pdf_path: str, threshold: float = 0.85):
    """Check a new PDF against the database for high similarity."""
    print(f"Reading {pdf_path}...")
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    # Simple chunking for the new document (500 chars)
    chunk_size = 500
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    print(f"Split new document into {len(chunks)} chunks.")

    # Embed the new chunks
    print("Embedding new chunks...")
    embeddings = model.encode(chunks, normalize_embeddings=True)

    # Connect to DB
    conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
    cursor = conn.cursor()

    flagged_count = 0
    print(f"\nScanning database for similarities above {threshold}...\n")

    for i, emb in enumerate(embeddings):
        vector_str = f"[{','.join(map(str, emb.tolist()))}]"
        
        # Find the closest match in the DB
        cursor.execute("""
            SELECT document_id, page, LEFT(text, 100) as preview, 
                   1 - (embedding <=> %s::vector) as similarity
            FROM document_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT 1;
        """, (vector_str, vector_str))
        
        result = cursor.fetchone()
        if result:
            doc_id, page, preview, sim = result
            if sim > threshold:
                flagged_count += 1
                print(f"⚠️ FLAGGED: New Chunk {i} is {sim:.2%} similar to {doc_id} (Page {page})")
                print(f"   Preview: {preview}...\n")

    cursor.close()
    conn.close()
    print(f"Scan complete. Total flagged chunks: {flagged_count}/{len(chunks)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_similarity(sys.argv[1])
    else:
        print("Usage: python similarity_checker.py <path_to_pdf>")