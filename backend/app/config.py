from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union, Optional
from pydantic import field_validator

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # Firebase
    CODETAPASYA_SERVICE_ACCOUNT_PATH: str 
    RESUME_MAKER_SERVICE_ACCOUNT_PATH: str
    STORAGE_BUCKET_NAME: str = "resume-maker-ct.firebasestorage.app"
    
    # Gemini API
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173"
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE: int = 60
    MAX_GEMINI_CALLS_PER_USER_PER_DAY: int = 50
    
    # LaTeX
    LATEX_COMPILE_TIMEOUT: int = 30
    LATEX_TEMP_DIR: str = "/tmp/latex"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

settings = Settings()
