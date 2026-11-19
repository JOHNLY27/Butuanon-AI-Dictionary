import os
from pydantic_settings import BaseSettings
from pydantic import Field

backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    DATABASE_URL: str = Field("postgresql://postgres:postgres@localhost:5432/postgres", env="DATABASE_URL")
    SUPABASE_URL: str = Field("", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field("", env="SUPABASE_KEY")
    GEMINI_API_KEY: str = Field("", env="GEMINI_API_KEY")
    GOOGLE_CLIENT_ID: str = Field("", env="GOOGLE_CLIENT_ID")
    ADMIN_EMAILS: str = Field("remitarjohnlydrick@gmail.com,johnlydrick@gmail.com,johnlydrick27@gmail.com", env="ADMIN_EMAILS")
    
    class Config:
        env_file = backend_env if os.path.exists(backend_env) else ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
