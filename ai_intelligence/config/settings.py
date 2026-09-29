from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "OAU Thesis Bank AI Intelligence"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    postgres_dsn: str = "postgresql+psycopg://oau:oau@localhost:5432/oau_thesis"
    redis_url: str = "redis://localhost:6379/0"
    object_storage_endpoint: str = "http://localhost:9000"
    object_storage_bucket: str = "oau-theses"
    embedding_model: str = "BAAI/bge-large-en-v1.5"
    reranker_model: str = "BAAI/bge-reranker-base"
    llm_base_url: str = ""
    llm_model: str = "meta-llama/Llama-3.1-8B-Instruct"
    llm_api_key: str = ""
    max_upload_mb: int = 100
    rate_limit_per_minute: int = 60
    log_level: str = "INFO"
    model_cache_dir: str = ".cache/models"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
