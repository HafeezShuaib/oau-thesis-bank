import json
import time
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential
from .parsers.digital import DigitalParser
from .ocr.engine import OCREngine
from .layout.engine import LayoutEngine
from .normalization.cleaner import TextCleaner
from .chunking.chunker import TokenChunker
from .storage.repository import ChunkRepository
from .models import DocumentChunk, ChunkProvenance, ProcessingResult

logger = structlog.get_logger()

class DocumentProcessingPipeline:
    def __init__(self, db_dsn: str):
        self.parser = DigitalParser()
        self.ocr = OCREngine()
        self.layout = LayoutEngine()
        self.cleaner = TextCleaner()
        self.chunker = TokenChunker()
        self.repo = ChunkRepository(db_dsn)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def process(self, job_id: str, document_id: str, pdf_path: str) -> ProcessingResult:
        start_time = time.time()
        errors = []
        
        try:
            page_texts, failed_pages = self.parser.extract(pdf_path)
            
            if failed_pages:
                ocr_results = self.ocr.process_pages(pdf_path, failed_pages)
                for idx, text in ocr_results.items():
                    page_texts[idx] = text

            section_map = self.layout.detect_sections(page_texts)
            all_chunks = []
            
            for page_idx, text in enumerate(page_texts):
                current_section = section_map.get(page_idx, "unknown")
                cleaned_text = self.cleaner.clean(text)
                if not cleaned_text:
                    continue

                raw_chunks = self.chunker.chunk_text(cleaned_text)
                for chunk_idx, (chunk_text, token_count) in enumerate(raw_chunks):
                    provenance = ChunkProvenance(
                        document_id=document_id,
                        page=page_idx + 1,
                        section=current_section,
                        chunk_index=chunk_idx,
                        source="pdf_digital_ocr"
                    )
                    all_chunks.append(DocumentChunk(
                        provenance=provenance,
                        text=chunk_text,
                        token_count=token_count
                    ))

            await self.repo.save_chunks(all_chunks)

            elapsed = int((time.time() - start_time) * 1000)
            return ProcessingResult(
                document_id=document_id,
                job_id=job_id,
                total_pages=len(page_texts),
                ocr_pages=len(failed_pages),
                chunks_generated=len(all_chunks),
                processing_time_ms=elapsed,
                status="success",
                errors=errors
            )

        except Exception as e:
            logger.error("pipeline_failed", document_id=document_id, error=str(e))
            errors.append(str(e))
            raise
