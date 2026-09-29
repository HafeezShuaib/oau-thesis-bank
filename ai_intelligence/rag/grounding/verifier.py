import re

def verify_answer(answer, sources):
    source_text=" ".join(s.get("text","") for s in sources).lower()
    sentences=[s.strip() for s in re.split(r"(?<=[.!?])\s+",answer) if s.strip()]
    unsupported=[]
    for s in sentences:
        words=[w for w in re.findall(r"\w+",s.lower()) if len(w)>4]
        if words and sum(w in source_text for w in words)/len(words)<0.25: unsupported.append(s)
    return {"grounded":not unsupported,"unsupported_claims":unsupported}
