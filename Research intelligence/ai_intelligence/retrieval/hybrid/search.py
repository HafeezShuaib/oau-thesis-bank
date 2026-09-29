import math, re
from collections import Counter, defaultdict

def tokenize(s): return re.findall(r"\b\w+\b", s.lower())

class BM25:
    def __init__(self, docs=None,k1=1.5,b=0.75):
        self.k1=k1; self.b=b; self.docs=[]; self.df=Counter(); self.avgdl=0
        if docs: self.fit(docs)
    def fit(self, docs):
        self.docs=docs; lengths=[]
        for d in docs:
            t=tokenize(d["text"]); lengths.append(len(t)); self.df.update(set(t))
        self.avgdl=sum(lengths)/len(lengths) if lengths else 0
    def search(self,q,k=50):
        qt=tokenize(q); N=len(self.docs); out=[]
        for d in self.docs:
            t=tokenize(d["text"]); tf=Counter(t); score=0
            for term in qt:
                if term not in tf: continue
                idf=math.log(1+(N-self.df[term]+0.5)/(self.df[term]+0.5)); denom=tf[term]+self.k1*(1-self.b+self.b*len(t)/(self.avgdl or 1)); score+=idf*(tf[term]*(self.k1+1)/denom)
            out.append((score,d))
        return sorted(out,key=lambda x:x[0],reverse=True)[:k]

def rrf(*ranked_lists,k=60):
    scores=defaultdict(float); docs={}
    for results in ranked_lists:
        for rank,(score,d) in enumerate(results,1):
            key=d.get("chunk_id") or id(d); docs[key]=d; scores[key]+=1/(k+rank)
    return sorted(((s,docs[key]) for key,s in scores.items()),reverse=True,key=lambda x:x[0])
