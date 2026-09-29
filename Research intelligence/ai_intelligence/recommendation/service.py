from collections import Counter
from datetime import datetime,timezone
class RecommendationEngine:
    def __init__(self,docs): self.docs=docs; self.events=[]
    def record(self,user_id,item_id,event_type,session_id=None): self.events.append({"user_id":user_id,"item_id":item_id,"event_type":event_type,"timestamp":datetime.now(timezone.utc).isoformat(),"session_id":session_id})
    def recommend(self,query=None,k=10):
        counts=Counter(e["item_id"] for e in self.events if e["event_type"] in {"view","open","save","download","search_click"})
        popular=sorted(self.docs,key=lambda d:(counts[d.get("document_id",d.get("chunk_id",""))],d.get("year",0) or 0),reverse=True)
        return popular[:k]
