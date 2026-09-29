# Training Decisions

## Decision 001 — stock-first
**Decision:** do not fine-tune the embedding model, reranker, OCR or LLM at this stage.

**Reason:** the governing workflow requires real OAU data, measured failures and evaluation evidence before training/calibration is justified.

**Next trigger:** collect representative failures and human labels. Train only when a candidate model demonstrates improvement against the stock baseline on a held-out real-data evaluation set.
