from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import uuid4

class ChunkProvenance(BaseModel):
    document_id: str
    page: int
    section: Optional[str] = None
    chunk_id: str = Field(default_factory=lambda: str(uuid4()))
    chunk_index: int
    source: str
    processing_version: str = "1.0.0"

class DocumentChunk(BaseModel):
    provenance: ChunkProvenance
    text: str
    token_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ProcessingResult(BaseModel):
    document_id: str
    job_id: str
    total_pages: int
    ocr_pages: int
    chunks_generated: int
    processing_time_ms: int
    status: str
    errors: List[str] = Field(default_factory=list)
