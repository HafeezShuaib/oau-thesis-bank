import os
import json
import hashlib
import structlog
import redis
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import tempfile
import asyncio

# --- TELEMETRY SETUP: Pure JSON Structured Logging ---
structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)
logger = structlog.get_logger()

# --- SEMANTIC CACHE SETUP (Redis) ---
cache = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Import our AI modules
from inference_router import evaluate_decision, generate_with_fallback
from rag_pipeline import retrieve_context
from similarity_checker import check_similarity
from phase3_6_researcher_intelligence import extract_metadata_from_pdf, save_metadata, build_and_print_graphs

app = FastAPI(title="OAU Thesis Bank - AI Intelligence Layer", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    stream: bool = False

def get_cache_key(query: str) -> str:
    return f"rag_cache:{hashlib.md5(query.lower().strip().encode()).hexdigest()}"

async def generate_stream(query: str, context: str, system_prompt: str):
    """Async generator for token-by-token streaming simulation"""
    answer = generate_with_fallback(system_prompt, f"Context:\n{context}\n\nQuestion: {query}")
    for i in range(0, len(answer), 50):
        yield json.dumps({"token": answer[i:i+50]}) + "\n"
        await asyncio.sleep(0.05)

@app.post("/api/v1/ai/rag-query")
async def rag_query(request: QueryRequest):
    cache_key = get_cache_key(request.query)
    
    # 1. SEMANTIC CACHE CHECK
    cached_answer = cache.get(cache_key)
    if cached_answer:
        logger.info("cache_hit", query=request.query)
        if request.stream:
            return StreamingResponse(iter([json.dumps({"token": cached_answer, "cached": True}) + "\n"]), media_type="application/x-ndjson")
        return {"status": "success", "answer": cached_answer, "cached": True}

    logger.info("rag_query_started", query=request.query)
    
    # 2. Input Guardrail
    decision = evaluate_decision({"text": request.query})
    logger.info("guardrail_evaluated", jailbreak_prob=decision["answers"]["is_jailbreak"]["noul"])
    
    if decision["answers"]["is_jailbreak"]["noul"] > 0.8:
        logger.warning("request_blocked", reason="jailbreak_detected")
        return {"status": "blocked", "message": "Request flagged as malicious."}
    
    # 3. Retrieval
    context = retrieve_context(request.query, top_k=3)
    if not context:
        logger.info("no_context_found", query=request.query)
        return {"status": "no_context", "answer": "No relevant documents found."}
    
    # 4. Generation
    system_prompt = "You are an expert academic research assistant. Answer based ONLY on the context. Cite Page numbers."
    
    if request.stream:
        logger.info("streaming_response_started")
        return StreamingResponse(generate_stream(request.query, context, system_prompt), media_type="application/x-ndjson")
    
    answer = generate_with_fallback(system_prompt, f"Context:\n{context}\n\nQuestion: {request.query}")
    
    # 5. SAVE TO CACHE (Fixed deprecation warning: using set with ex= instead of setex)
    cache.set(cache_key, answer, ex=86400)
    
    logger.info("rag_query_success", routing=decision["answers"]["routing_category"]["choice"], answer_length=len(answer))
    return {"status": "success", "answer": answer, "routing": decision["answers"]["routing_category"]["choice"], "cached": False}

@app.post("/api/v1/ai/check-similarity")
async def check_similarity_endpoint(file: UploadFile = File(...)):
    try:
        logger.info("similarity_check_started", filename=file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        check_similarity(tmp_path, threshold=0.85)
        os.unlink(tmp_path)
        logger.info("similarity_check_completed")
        return {"status": "success", "message": "Similarity check completed."}
    except Exception as e:
        logger.error("similarity_check_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/extract-metadata")
async def extract_metadata_endpoint(file: UploadFile = File(...), doc_id: str = "unknown"):
    try:
        logger.info("metadata_extraction_started", doc_id=doc_id, filename=file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        metadata = extract_metadata_from_pdf(tmp_path)
        save_metadata(doc_id, metadata)
        os.unlink(tmp_path)
        logger.info("metadata_extraction_completed", doc_id=doc_id)
        return {"status": "success", "metadata": metadata}
    except Exception as e:
        logger.error("metadata_extraction_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ai/graphs")
async def get_graphs():
    logger.info("graphs_build_requested")
    build_and_print_graphs()
    return {"status": "success", "message": "Graphs built."}

if __name__ == "__main__":
    logger.info("server_starting", port=8000)
    uvicorn.run(app, host="0.0.0.0", port=8000)