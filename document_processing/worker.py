import redis
import json
import asyncio
import structlog
from .pipeline import DocumentProcessingPipeline

logger = structlog.get_logger()

class DocumentWorker:
    def __init__(self, redis_url: str, db_dsn: str):
        # Added health_check_interval and socket_timeout to prevent Windows/Docker socket hangs
        self.redis_client = redis.from_url(
            redis_url, 
            decode_responses=True,
            health_check_interval=30,
            socket_timeout=10,
            socket_connect_timeout=5
        )
        self.pipeline = DocumentProcessingPipeline(db_dsn)
        self.queue_name = "oau:document_processing:queue"

    async def run(self):
        logger.info("starting_document_processing_worker")
        while True:
            try:
                # Reduced timeout to 2 seconds to fail fast and retry if socket drops
                result = self.redis_client.brpop(self.queue_name, timeout=2)
                if not result:
                    continue
                
                _, message = result
                job = json.loads(message)
                job_id = job.get("job_id")
                
                # Idempotency check
                if self.redis_client.sismember("oau:processed_jobs", job_id):
                    logger.info("duplicate_job_skipped", job_id=job_id)
                    continue

                await self.pipeline.process(
                    job_id=job_id,
                    document_id=job["document_id"],
                    pdf_path=job["storage_path"]
                )
                
                # Mark as processed
                self.redis_client.sadd("oau:processed_jobs", job_id)
                logger.info("job_completed_successfully", job_id=job_id)
                
            except redis.exceptions.ConnectionError:
                logger.error("redis_connection_lost", retry_in=2)
                await asyncio.sleep(2)
            except redis.exceptions.TimeoutError:
                # Expected occasionally on Windows Docker, just loop again
                continue
            except Exception as e:
                logger.error("worker_loop_error", error=str(e))
                await asyncio.sleep(2)