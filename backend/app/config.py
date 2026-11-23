import os
from pydantic_settings import BaseSettings
from pydantic import Field

backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        "postgresql://postgres:%40Johnlyd2727@db.dfxiwarvtwdpppjahlhv.supabase.co:5432/postgres", 
        env="DATABASE_URL"
    )
    SUPABASE_URL: str = Field("https://dfxiwarvtwdpppjahlhv.supabase.co", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGl3YXJ2dHdkcHBwamFobGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTk4NjQsImV4cCI6MjA5NjgzNTg2NH0.7s9PaSkY2HEvIROcWmsfuvo1-kBGnBOhTiQ9fwCEO2g",
        env="SUPABASE_KEY"
    )
    GEMINI_API_KEY: str = Field("", env="GEMINI_API_KEY")
    GOOGLE_CLIENT_ID: str = Field("876081507840-dioud14s3i7koic9jvk2iv3gn0gmolcs.apps.googleusercontent.com", env="GOOGLE_CLIENT_ID")
    ADMIN_EMAILS: str = Field("remitarjohnlydrick@gmail.com,johnlydrick@gmail.com,johnlydrick27@gmail.com,jemimahtortola27@gmail.com", env="ADMIN_EMAILS")
    
    class Config:
        env_file = backend_env if os.path.exists(backend_env) else ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
