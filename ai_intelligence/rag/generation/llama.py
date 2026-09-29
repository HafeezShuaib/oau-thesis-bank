import httpx

class LlamaClient:
    def __init__(self, base_url="", model="meta-llama/Llama-3.1-8B-Instruct", api_key=""):
        self.base_url=base_url.rstrip("/"); self.model=model; self.api_key=api_key
    async def generate(self, system, user):
        if not self.base_url:
            return {"text":"LLM inference is not configured. The evidence set was retrieved successfully; configure LLM_BASE_URL for generation.","model":self.model,"usage":{}}
        headers={"Authorization":f"Bearer {self.api_key}"} if self.api_key else {}
        payload={"model":self.model,"messages":[{"role":"system","content":system},{"role":"user","content":user}],"temperature":0.1}
        async with httpx.AsyncClient(timeout=90) as c:
            r=await c.post(f"{self.base_url}/v1/chat/completions",json=payload,headers=headers); r.raise_for_status(); data=r.json()
        return {"text":data["choices"][0]["message"]["content"],"model":self.model,"usage":data.get("usage",{})}
