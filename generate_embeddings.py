import psycopg
from sentence_transformers import SentenceTransformer
import time

print("Loading BAAI/bge-large-en-v1.5 (1024 dimensions)...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
cursor = conn.cursor()

print("Fetching un-embedded chunks...")
cursor.execute("SELECT chunk_id, text FROM document_chunks WHERE embedding IS NULL LIMIT 100;")
chunks = cursor.fetchall()
print(f"Found {len(chunks)} chunks to process.")

if not chunks:
    print("All chunks already have embeddings!")
    exit()

batch_size = 8
for i in range(0, len(chunks), batch_size):
    batch = chunks[i:i+batch_size]
    texts = [chunk[1] for chunk in batch]
    chunk_ids = [chunk[0] for chunk in batch]
    
    print(f"Processing batch {i//batch_size + 1}...")
    # normalize_embeddings=True is critical for accurate cosine similarity
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    
    for chunk_id, embedding in zip(chunk_ids, embeddings):
        vector_str = f"[{','.join(map(str, embedding.tolist()))}]"
        cursor.execute(
            "UPDATE document_chunks SET embedding = %s::vector WHERE chunk_id = %s",
            (vector_str, chunk_id)
        )
    
    conn.commit()
    time.sleep(0.2)

print("✅ 1024d Embeddings generated and saved successfully!")
cursor.close()
conn.close()