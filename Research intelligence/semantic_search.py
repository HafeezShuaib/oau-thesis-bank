import psycopg
from sentence_transformers import SentenceTransformer
import sys

print("Loading BAAI/bge-large-en-v1.5...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

raw_query = sys.argv[1] if len(sys.argv) > 1 else "What is the main focus of this research paper?"
print(f"\n🔍 Searching for: '{raw_query}'\n")

# BGE models require an explicit instruction prefix for queries
instruction = "Represent this sentence for searching relevant passages: "
query_embedding = model.encode([instruction + raw_query], normalize_embeddings=True)[0]
vector_str = f"[{','.join(map(str, query_embedding.tolist()))}]"

conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
cursor = conn.cursor()

cursor.execute("""
    SELECT page, chunk_index, LEFT(text, 150) as text_preview, 
           1 - (embedding <=> %s::vector) as similarity
    FROM document_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> %s::vector
    LIMIT 3;
""", (vector_str, vector_str))

results = cursor.fetchall()

if not results:
    print("No results found. Run generate_embeddings.py first.")
else:
    for i, (page, idx, preview, sim) in enumerate(results, 1):
        print(f"--- Result {i} (Similarity: {sim:.4f}) ---")
        print(f"Page {page}, Chunk {idx}")
        print(f"Preview: {preview}...\n")

cursor.close()
conn.close()