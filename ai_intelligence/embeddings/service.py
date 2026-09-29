import numpy as np

class EmbeddingService:
    def __init__(self, model_name="BAAI/bge-large-en-v1.5"):
        self.model_name=model_name; self.model=None
    def _load(self):
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as e: raise RuntimeError("Install the [ml] extra for embeddings") from e
            self.model=SentenceTransformer(self.model_name)
    def encode(self, texts):
        self._load(); arr=self.model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
        return arr.tolist()

class InMemoryVectorIndex:
    def __init__(self): self.items=[]
    def add(self, item, vector): self.items.append((item,np.asarray(vector,dtype=float)))
    def search(self, vector, k=10, filters=None):
        q=np.asarray(vector,dtype=float); out=[]
        for item,v in self.items:
            if filters and any(item.get(a)!=b for a,b in filters.items()): continue
            score=float(np.dot(q,v)/(np.linalg.norm(q)*np.linalg.norm(v)+1e-12)); out.append((score,item))
        return sorted(out,key=lambda x:x[0],reverse=True)[:k]
