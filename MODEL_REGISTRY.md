# Model Registry

| Component | Model/Method | Status | Training policy |
|---|---|---|---|
| Layout | LayoutLMv3-base integration point | baseline | no fine-tuning yet |
| OCR | PaddleOCR | adapter | no training |
| Embeddings | BAAI/bge-large-en-v1.5 | stock adapter | evaluate first |
| Reranker | BAAI/bge-reranker-base | stock adapter | evaluate first |
| LLM | Llama-family via OpenAI-compatible inference endpoint | configurable | no local training assumed |
| Gap engine | BERTopic + HDBSCAN + UMAP | adapter | fit on real OAU corpus only |
| Similarity | TF-IDF + semantic cosine | implemented | calibrate only with human labels |
| Recommendation | popularity/recent/event baseline | implemented | LightFM/Implicit only after real interactions |

Every promoted model must record version, configuration, data version, evaluation results and limitations.
