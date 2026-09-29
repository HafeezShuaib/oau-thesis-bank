# Phase 3 — AI Intelligence

Production AI layer for the OAU Thesis Bank, integrating with the existing
Phase 1 frontend and Phase 2 backend/API/auth/database as fixed integration
points.

**Status:** Scaffolding only. No phase has been implemented yet.

## Governing principle

Every model in this system starts stock/pretrained. Training or calibration
is only introduced after the stock component has been deployed, evaluated
against real OAU data, and a documented, measured failure justifies it. See
`TRAINING_DECISIONS.md`.

Local development hardware (e.g. a single consumer GPU) is a development
convenience only. It never defines production architecture, model size, or
deployment limits.

## Architecture

```text
OAU THESIS BANK
│
├── frontend/                     ← Phase 1 (existing)
├── backend/                      ← Phase 2 (existing)
└── AI Intelligence/               ← Phase 3 (this directory)
```

```text
Frontend
   │
   ▼
Existing Backend/API
   │
   ▼
AI Intelligence API
   │
   ├── Security / Guardrails
   ├── Retrieval
   ├── RAG
   ├── Document Intelligence
   ├── Research Intelligence
   ├── Recommendations
   └── Research Network
        │
        ├── PostgreSQL + pgvector
        ├── Redis
        ├── Object Storage
        ├── Model Services
        └── Observability
```

## Modules

| Module | Purpose | Phase |
|---|---|---|
| `document_processing/` | PDF ingestion, layout parsing, OCR, normalization, chunking | 3.1 |
| `embeddings/` | Domain embeddings + pgvector storage | 3.2 |
| `retrieval/` | BM25 + vector hybrid retrieval, reranking | 3.3 |
| `rag/` | Guardrails, generation, grounding | 3.4 |
| `research_intelligence/` | Research gap engine (3.5), similarity/plagiarism (3.5B) | 3.5, 3.5B |
| `proposal_checker/` | Proposal-vs-repository evidence report | 3.6 |
| `research_network/` | Researcher matching, lineage, collaboration graph | 3.7, 3.8, 3.8B |
| `recommendation/` | Baseline and (eventually) learned recommendations | 3.9 |
| `security/` | Access control, rate limiting, watermarking | 3.10 |
| `evaluation/` | Cross-cutting evaluation harnesses | — |
| `telemetry/` | OpenTelemetry + Langfuse instrumentation | 3.12 |
| `scripts/` | Service entrypoints, one-off tooling | — |
| `models/` | Local model cache / registry references (not committed) | — |
| `data/` | Training/evaluation data (not committed; see `.gitignore`) | — |

## Local development

```bash
cp .env.example .env    # fill in real values — do not guess
pip install -e ".[dev]"
docker compose up -d postgres redis object-storage
pytest
```

See `docker-compose.yml` for the full local service graph, and
`pyproject.toml` for dependency groups (only install the extras a given
service actually needs).

## Implementation order

3.1 Document processing → 3.2 Embeddings + pgvector → 3.3 Hybrid retrieval +
reranking → 3.4 RAG + guardrails → 3.5 Research gap engine → 3.5B
Similarity/plagiarism → 3.6 Proposal checker → 3.7 Researcher matching →
3.8 Lineage → 3.8B Collaboration graph → 3.9 Recommendation → 3.10 Security
→ 3.11 Analytics → 3.12 Telemetry → 3.13 Evaluation/integration.

Each phase requires: implementation, tests, evaluation, telemetry,
documentation, and a manual DONE checklist before the next phase begins.

## Related documents

- `PHASE_3_PROGRESS.md` — phase-by-phase status
- `MODEL_REGISTRY.md` — every model in the system, stock or trained
- `EVALUATION_LOG.md` — evaluation runs and results
- `TRAINING_DECISIONS.md` — record of every stock-vs-train decision and why
