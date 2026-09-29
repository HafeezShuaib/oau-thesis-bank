import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimilarityEngine:
    def __init__(self, lexical_weight=.35, semantic_weight=.65): self.lexical_weight=lexical_weight; self.semantic_weight=semantic_weight
    def compare(self,a,b,embeddings=None):
        tf=TfidfVectorizer(ngram_range=(1,2),min_df=1).fit_transform([a,b]); lexical=float(cosine_similarity(tf[0],tf[1])[0,0])
        semantic=lexical if embeddings is None else float(np.dot(embeddings[0],embeddings[1])/(np.linalg.norm(embeddings[0])*np.linalg.norm(embeddings[1])+1e-12))
        return {"lexical":lexical,"semantic":semantic,"combined":self.lexical_weight*lexical+self.semantic_weight*semantic,"decision":"HUMAN_REVIEW_REQUIRED"}
