from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://oau_user:password@localhost:5432/oau_thesis_bank"
    DATABASE_DSN: str = "postgresql://oau_user:password@localhost:5432/oau_thesis_bank"
    REDIS_URL: str = "redis://localhost:6379/0"
    OBJECT_STORAGE_ENDPOINT: str = "http://localhost:9000"
    OBJECT_STORAGE_ACCESS_KEY: str = "minioadmin"
    OBJECT_STORAGE_SECRET_KEY: str = "minioadmin"
    OBJECT_STORAGE_BUCKET: str = "oau-theses"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    OCR_DPI: int = 300
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()
