from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.endpoints import router as api_router
from .routers.auth_router import router as auth_router
from .routers.admin_router import router as admin_router
from .database import engine, Base

# Attempt to create SQL tables on application startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database Table Auto-creation Warning: {e}")

app = FastAPI(
    title="Butuanon-English AI Dictionary API",
    description="Backend middleware for dictionary queries, audio pronunciation uploads, and RAG translations.",
    version="1.0.0"
)

# Configure CORS so Vite frontend (port 5173) can access endpoints
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(auth_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Butuanon-English AI Dictionary API",
        "version": "1.0.0"
    }
