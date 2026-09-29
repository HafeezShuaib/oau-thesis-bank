from .hybrid.search import BM25, rrf

class HybridRetriever:
    def __init__(self, docs, vector_index=None, embedder=None):
        self.docs=docs; self.bm25=BM25(docs); self.vector_index=vector_index; self.embedder=embedder
    def search(self, query, top_k=20):
        lexical=self.bm25.search(query,50)
        semantic=[]
        if self.vector_index and self.embedder:
            semantic=self.vector_index.search(self.embedder.encode([query])[0],50)
        fused=rrf(lexical,semantic) if semantic else lexical
        return fused[:top_k]
