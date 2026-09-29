class Reranker:
    def __init__(self, model_name="BAAI/bge-reranker-base"): self.model_name=model_name; self.model=None
    def _load(self):
        if self.model is None:
            try:
                from sentence_transformers import CrossEncoder
            except ImportError as e: raise RuntimeError("Install the [ml] extra for reranking") from e
            self.model=CrossEncoder(self.model_name)
    def rank(self, query, candidates, top_k=20):
        self._load(); pairs=[(query,c[1]["text"]) for c in candidates]; scores=self.model.predict(pairs)
        ranked=sorted(zip(scores,[c[1] for c in candidates]),key=lambda x:float(x[0]),reverse=True)[:top_k]
        return [{"score":float(s),"item":d} for s,d in ranked]
