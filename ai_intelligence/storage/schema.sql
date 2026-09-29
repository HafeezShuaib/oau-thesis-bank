CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS ai_document_chunks (
 id BIGSERIAL PRIMARY KEY,
 document_id TEXT NOT NULL,
 page INTEGER,
 section TEXT,
 chunk_id TEXT UNIQUE NOT NULL,
 chunk_index INTEGER NOT NULL,
 source TEXT NOT NULL,
 processing_version TEXT NOT NULL,
 text TEXT NOT NULL,
 embedding vector(1024),
 embedding_model TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_document_chunks_embedding_hnsw ON ai_document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS ai_document_chunks_document_idx ON ai_document_chunks(document_id);
CREATE TABLE IF NOT EXISTS ai_events (
 id BIGSERIAL PRIMARY KEY,
 user_id TEXT,
 item_id TEXT NOT NULL,
 event_type TEXT NOT NULL,
 session_id TEXT,
 timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ai_similarity_reviews (
 id BIGSERIAL PRIMARY KEY,
 document_a TEXT NOT NULL,
 document_b TEXT NOT NULL,
 lexical_score DOUBLE PRECISION NOT NULL,
 semantic_score DOUBLE PRECISION NOT NULL,
 combined_score DOUBLE PRECISION NOT NULL,
 human_label TEXT,
 reviewed_at TIMESTAMPTZ
);
