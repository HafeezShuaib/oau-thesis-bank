from pathlib import Path
import tempfile, uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from ..config.settings import settings
from ..telemetry.logging import configure_logging,get_logger
from ..document_processing.parser import process_pdf
from ..security.guardrails import inspect_text
from ..research_intelligence.plagiarism.service import SimilarityEngine
from ..research_network.graph import ResearchGraph

configure_logging(settings.log_level); log=get_logger("api")
app=FastAPI(title=settings.app_name,version="0.1.0")

class SimilarityRequest(BaseModel):
    document_a: str=Field(min_length=1); document_b: str=Field(min_length=1)
class GuardrailRequest(BaseModel): text: str=Field(min_length=1)

@app.get("/health")
def health(): return {"status":"ok","service":settings.app_name}

@app.post(f"{settings.api_prefix}/documents/process")
async def process_document(file: UploadFile=File(...)):
    if file.content_type!="application/pdf": raise HTTPException(415,"Only PDF files are supported")
    data=await file.read()
    if len(data)>settings.max_upload_mb*1024*1024: raise HTTPException(413,"File exceeds configured upload limit")
    doc_id=str(uuid.uuid4())
    with tempfile.NamedTemporaryFile(suffix=".pdf",delete=False) as tmp:
        tmp.write(data); path=tmp.name
    try: result=process_pdf(path,doc_id); log.info("document_processed",document_id=doc_id,pages=len(result["pages"]),ocr_pages=result["ocr_pages"],chunks=len(result["chunks"])); return result
    finally: Path(path).unlink(missing_ok=True)

@app.post(f"{settings.api_prefix}/security/guardrail")
def guardrail(req:GuardrailRequest): return inspect_text(req.text).__dict__

@app.post(f"{settings.api_prefix}/similarity")
def similarity(req:SimilarityRequest): return SimilarityEngine().compare(req.document_a,req.document_b)

@app.get(f"{settings.api_prefix}/model-registry")
def registry():
    return {"embedding":settings.embedding_model,"reranker":settings.reranker_model,"llm":settings.llm_model,"policy":"stock-first; train only after measured real-data failure"}
