class GapEngine:
    def __init__(self): self.model=None
    def fit(self,documents):
        if len(documents)<5: return {"status":"INSUFFICIENT_CORPUS","documents":len(documents),"topics":[]}
        try:
            from bertopic import BERTopic
        except ImportError as e: raise RuntimeError("Install the [gap] extra for BERTopic") from e
        texts=[d.get("text","") for d in documents]
        self.model=BERTopic(verbose=False); topics,_=self.model.fit_transform(texts)
        return {"status":"FITTED_ON_REAL_CORPUS","documents":len(documents),"topics":topics}
