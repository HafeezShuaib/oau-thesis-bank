class ProposalChecker:
    def __init__(self,retriever,reranker=None): self.retriever=retriever; self.reranker=reranker
    def check(self,proposal,top_k=10):
        candidates=self.retriever.search(proposal,50)
        ranked=self.reranker.rank(proposal,candidates,top_k) if self.reranker else [{"score":s,"item":d} for s,d in candidates[:top_k]]
        return {"status":"SIMILARITY_REVIEW","matches":ranked,"warning":"Similarity is evidence for review, not a plagiarism verdict."}
