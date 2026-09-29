# Evaluation Log

No fabricated scores are recorded.

## Automated validation
- Chunking: tested 512-token window / 50-token overlap contract.
- Guardrails: tested known prompt-injection patterns and retrieved-content sanitization.
- Similarity: tested human-review-only outcome.

## Required real-data validation
1. 5–10 real OAU theses: digital/scanned/mixed PDF processing.
2. Real OAU queries with manual relevance labels: Recall@1/5/10, MRR, nDCG@10.
3. Vector-only vs BM25-only vs hybrid vs hybrid+rereanker.
4. ~20 human spot checks for research-gap clusters.
5. Human-reviewed similarity pairs for precision/recall/F1 and threshold calibration.
6. End-to-end RAG grounding and prompt-injection tests.
