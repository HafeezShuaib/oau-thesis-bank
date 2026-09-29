import pytest
from unittest.mock import MagicMock, AsyncMock
from document_processing.chunking.chunker import TokenChunker
from document_processing.models import DocumentChunk, ChunkProvenance

def test_token_chunker_overlap():
    chunker = TokenChunker(chunk_size=10, overlap=2)
    text = "word " * 25
    chunks = chunker.chunk_text(text)
    
    assert len(chunks) > 1
    assert chunks[0][1] == 10
    
def test_chunk_provenance_defaults():
    prov = ChunkProvenance(
        document_id="doc_1",
        page=1,
        chunk_index=0,
        source="test"
    )
    assert prov.processing_version == "1.0.0"
    assert prov.chunk_id is not None

@pytest.mark.asyncio
async def test_pipeline_mocked_storage():
    from document_processing.pipeline import DocumentProcessingPipeline
    
    pipeline = DocumentProcessingPipeline(db_dsn="postgresql://fake")
    pipeline.repo.save_chunks = AsyncMock()
    pipeline.parser.extract = MagicMock(return_value=(["This is a test abstract. " * 50], []))
    
    result = await pipeline.process("job_1", "doc_1", "/fake/path.pdf")
    
    assert result.status == "success"
    assert result.chunks_generated > 0
    pipeline.repo.save_chunks.assert_awaited_once()
