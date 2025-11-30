from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union, Optional
from pydantic import field_validator

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # Firebase - Required in production
    CODETAPASYA_SERVICE_ACCOUNT_PATH: Optional[str] = None
    RESUME_MAKER_SERVICE_ACCOUNT_PATH: Optional[str] = None
    STORAGE_BUCKET_NAME: str = "resume-maker-ct.firebasestorage.app"
    
    # Gemini API - Required for AI features
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    
    # Redis - Optional, falls back to no caching if unavailable
    REDIS_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"
  
    CORS_ORIGINS: Union[str, List[str]]
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE: int = 60
    MAX_GEMINI_CALLS_PER_USER_PER_DAY: int = 50
    
    # LaTeX
    LATEX_COMPILE_TIMEOUT: int = 30
    LATEX_TEMP_DIR: str = "/tmp/latex"
    
    # Security
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".pdf", ".doc", ".docx"]
    MAX_UPLOAD_SIZE_MB: int = 10
    SESSION_TIMEOUT_MINUTES: int = 60
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list"""
        if isinstance(v, str):
            origins = [origin.strip() for origin in v.split(",")]
            # Validate that origins are not empty
            if not origins or all(not o for o in origins):
                raise ValueError("CORS_ORIGINS cannot be empty")
            return origins
        return v
    
    @field_validator('GEMINI_API_KEY')
    @classmethod
    def validate_gemini_key(cls, v, info):
        """Warn if Gemini API key is not set in production"""
        if info.data.get('ENVIRONMENT') == 'production' and not v:
            print("⚠️  WARNING: GEMINI_API_KEY not set. AI features will be disabled.")
        return v
    
    @field_validator('CODETAPASYA_SERVICE_ACCOUNT_PATH', 'RESUME_MAKER_SERVICE_ACCOUNT_PATH')
    @classmethod
    def validate_firebase_paths(cls, v, info):
        """Warn if Firebase service accounts are not configured in production"""
        if info.data.get('ENVIRONMENT') == 'production' and not v:
            field_name = info.field_name
            print(f"⚠️  WARNING: {field_name} not set. Firebase features may not work.")
        return v

settings = Settings()
