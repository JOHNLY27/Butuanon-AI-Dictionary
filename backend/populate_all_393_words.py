import sys
import os
import json
from dotenv import load_dotenv

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry

def seed_all_393_words():
    # Ensure database tables are created
    Base.metadata.create_all(bind=engine)
    
    json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        words_data = json.load(f)
        
    print(f"Loaded {len(words_data)} total dictionary entries from JSON.")
    
    db = SessionLocal()
    inserted = 0
    updated = 0
    
    try:
        for item in words_data:
            butuanon = item.get("butuanon", "").strip()
            english = item.get("english", "").strip()
            pos = item.get("pos", "noun").strip().lower()
            pronunciation = item.get("pronunciation", butuanon).strip()
            definition = item.get("definition", "").strip()
            example_butuanon = item.get("exampleButuanon") or item.get("example_butuanon")
            example_english = item.get("exampleEnglish") or item.get("example_english")
            verified = item.get("verified", "academic")
            rating = item.get("rating", 5)
            
            existing = db.query(DictionaryEntry).filter(
                DictionaryEntry.butuanon.ilike(butuanon),
                DictionaryEntry.pos.ilike(pos)
            ).first()
            
            if existing:
                existing.english = english
                existing.definition = definition
                existing.pronunciation = pronunciation
                existing.example_butuanon = example_butuanon
                existing.example_english = example_english
                existing.verified = verified
                existing.rating = rating
                updated += 1
            else:
                new_entry = DictionaryEntry(
                    butuanon=butuanon,
                    english=english,
                    pos=pos,
                    pronunciation=pronunciation,
                    definition=definition,
                    example_butuanon=example_butuanon,
                    example_english=example_english,
                    verified=verified,
                    rating=rating
                )
                db.add(new_entry)
                inserted += 1
                
        db.commit()
        
        # Verify total count in database
        total_in_db = db.query(DictionaryEntry).count()
        print(f"\n[Database Seed Complete] Inserted: {inserted}, Updated: {updated}, Total Records in Database: {total_in_db}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_393_words()
