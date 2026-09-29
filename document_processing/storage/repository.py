import json
import psycopg
from typing import List
from ..models import DocumentChunk
import structlog

logger = structlog.get_logger()

class ChunkRepository:
    def __init__(self, dsn: str):
        self.dsn = dsn

    async def save_chunks(self, chunks: List[DocumentChunk]):
        if not chunks:
            return

        async with await psycopg.AsyncConnection.connect(self.dsn) as conn:
            async with conn.cursor() as cur:
                for chunk in chunks:
                    await cur.execute(
                        """
                        INSERT INTO document_chunks 
                        (chunk_id, document_id, page, section, chunk_index, source, processing_version, text, token_count, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (chunk_id) DO NOTHING
                        """,
                        (
                            chunk.provenance.chunk_id,
                            chunk.provenance.document_id,
                            chunk.provenance.page,
                            chunk.provenance.section,
                            chunk.provenance.chunk_index,
                            chunk.provenance.source,
                            chunk.provenance.processing_version,
                            chunk.text,
                            chunk.token_count,
                            json.dumps(chunk.metadata)
                        )
                    )
                await conn.commit()
        logger.info("persisted_chunks_to_postgresql", count=len(chunks))

