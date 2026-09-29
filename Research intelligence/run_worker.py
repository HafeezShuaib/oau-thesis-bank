import asyncio
import sys
from document_processing.worker import DocumentWorker
from config import get_settings

async def main():
    settings = get_settings()
    worker = DocumentWorker(redis_url=settings.REDIS_URL, db_dsn=settings.DATABASE_DSN)
    await worker.run()

if __name__ == "__main__":
    # Fix for Windows: psycopg requires SelectorEventLoop for async operations
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())