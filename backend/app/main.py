from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.endpoints import router as api_router
from .routers.auth_router import router as auth_router
from .routers.admin_router import router as admin_router
from .database import engine, Base

import os
import json
from .database import engine, Base, SessionLocal
from .models import DictionaryEntry

# Attempt to create SQL tables and seed database on application startup
try:
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database from generated_butuanon_words.json if DB has fewer records
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "generated_butuanon_words.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            words_data = json.load(f)
            
        db = SessionLocal()
        try:
            db_count = db.query(DictionaryEntry).count()
            if db_count < len(words_data):
                print(f"Auto-seeding database: {db_count} existing -> seeding {len(words_data)} words...")
                for item in words_data:
                    butuanon = item.get("butuanon", "").strip()
                    pos = item.get("pos", "noun").strip().lower()
                    if not butuanon:
                        continue
                    existing = db.query(DictionaryEntry).filter(
                        DictionaryEntry.butuanon.ilike(butuanon),
                        DictionaryEntry.pos.ilike(pos)
                    ).first()
                    
                    if not existing:
                        ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
                        ex_eng = item.get("exampleEnglish") or item.get("example_english")
                        entry = DictionaryEntry(
                            butuanon=butuanon,
                            english=item.get("english", ""),
                            pos=pos,
                            pronunciation=item.get("pronunciation", butuanon),
                            definition=item.get("definition", ""),
                            example_butuanon=ex_but,
                            example_english=ex_eng,
                            verified=item.get("verified", "academic"),
                            rating=item.get("rating", 5)
                        )
                        db.add(entry)
                db.commit()
                print("Auto-seeding on application startup completed successfully!")
        except Exception as err:
            db.rollback()
            print(f"Auto-seeding database warning: {err}")
        finally:
            db.close()
except Exception as e:
    print(f"Database Table Auto-creation Warning: {e}")

app = FastAPI(
    title="Butuanon-English AI Dictionary API",
    description="Backend middleware for dictionary queries, audio pronunciation uploads, and RAG translations.",
    version="1.0.0"
)

# Configure CORS so Vite frontend can access endpoints
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

import os
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins.extend([o.strip() for o in allowed_origins_env.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Matches all Vercel deployment URLs
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
