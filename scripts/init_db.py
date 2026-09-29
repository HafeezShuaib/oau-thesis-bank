from ai_intelligence.config.settings import settings
from ai_intelligence.storage.repository import Repository
Repository(settings.postgres_dsn).execute_schema("ai_intelligence/storage/schema.sql")
print("AI database schema initialized")
