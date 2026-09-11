import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)
    
    PROJECT_NAME: str = "CYBERSENTINEL AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "cybersentinel-enterprise-production-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Database (Supabase / SQLite Fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./cybersentinel.db")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # ML & MLflow
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "models")
    DATA_DIR: str = os.getenv("DATA_DIR", "data")
    
    # Environment Mode
    IS_DEMO_MODE: bool = False
    ENVIRONMENT: str = "PRODUCTION"

settings = Settings()

