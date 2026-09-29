# OAU Thesis Bank — AI Intelligence

Production-oriented Phase 3 implementation baseline. It is designed as an independent AI service so the existing frontend/backend remain integration points rather than being rewritten.

## Implemented now
- PDF digital-text extraction with selective OCR-required page detection
- section detection and provenance-aware 512/50 chunking
- optional PaddleOCR adapter for failed/scanned pages
- BGE-large embedding adapter and pgvector/HNSW schema
- BM25 + vector fusion and BGE reranker adapters
- RAG orchestration with input/retrieved-content guardrails and grounding checks
- BERTopic gap-engine adapter (fit only on real corpus)
- lexical + semantic similarity/plagiarism review engine
- evidence-based proposal checker adapter
- recommendation event collection + popularity/recent baseline
- provenance-required research/collaboration graph
- FastAPI health, document, security and similarity endpoints
- SQL schema, structured logging, tests, model registry and training decision records

## Important
This package does **not** claim completed production validation. Real OAU theses, relevance labels, human-reviewed similarity pairs, load tests, security tests, and deployment credentials must be supplied before a production readiness claim.

## Run
`pip install -e .`

`uvicorn ai_intelligence.api.main:app --host 0.0.0.0 --port 8080`

Optional ML/OCR/gap capabilities are dependency extras in `pyproject.toml`.
