from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field("postgresql://postgres:postgres@localhost:5432/postgres", env="DATABASE_URL")
    SUPABASE_URL: str = Field("", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field("", env="SUPABASE_KEY")
    GEMINI_API_KEY: str = Field("", env="GEMINI_API_KEY")
    GOOGLE_CLIENT_ID: str = Field("", env="GOOGLE_CLIENT_ID")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
