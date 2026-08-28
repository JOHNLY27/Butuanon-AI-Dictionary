import sys
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry
import update_frontend_fallback

def sanitize_word(word_str):
    if not word_str:
        return ""
    # Strip leading/trailing quotation marks, apostrophes, spaces
    cleaned = word_str.strip(" '`“\"‘")
    if not cleaned:
        return word_str.strip()
    # Capitalize first letter of each word (Title Case) while preserving hyphenated words
    parts = cleaned.split("-")
    cleaned_parts = [p.capitalize() for p in parts]
    result = "-".join(cleaned_parts)
    return result

def clean_and_sort():
    json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        words = json.load(f)
        
    print(f"Loaded {len(words)} entries from generated_butuanon_words.json.")
    
    cleaned_entries = []
    seen = set()
    
    for item in words:
        raw_word = item.get("butuanon", "")
        cleaned_word = sanitize_word(raw_word)
        if not cleaned_word:
            continue
            
        pos = item.get("pos", "noun").strip().lower()
        key = (cleaned_word.lower(), pos)
        
        if key in seen:
            continue
        seen.add(key)
        
        # Clean english meaning and definition
        english = item.get("english", "").strip()
        definition = item.get("definition", "").strip()
        pronunciation = item.get("pronunciation", cleaned_word.lower()).strip()
        ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
        ex_eng = item.get("exampleEnglish") or item.get("example_english")
        
        cleaned_entries.append({
            "butuanon": cleaned_word,
            "english": english,
            "pos": pos,
            "pronunciation": pronunciation,
            "definition": definition,
            "exampleButuanon": ex_but,
            "exampleEnglish": ex_eng,
            "verified": item.get("verified", "academic"),
            "rating": item.get("rating", 5)
        })
        
    # Sort alphabetically by Butuanon word (case-insensitive A to Z)
    cleaned_entries.sort(key=lambda x: x["butuanon"].lower())
    
    print(f"Cleaned & Deduplicated: {len(cleaned_entries)} total sorted entries.")
    
    # Save back to JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_entries, f, indent=2, ensure_ascii=False)
    print("1. Saved cleaned & A-Z sorted list to generated_butuanon_words.json.")

    # Reset & repopulate SQLite database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing dictionary table for fresh clean A-Z import
        db.query(DictionaryEntry).delete()
        db.commit()
        
        for item in cleaned_entries:
            ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
            ex_eng = item.get("exampleEnglish") or item.get("example_english")
            entry = DictionaryEntry(
                butuanon=item["butuanon"],
                english=item["english"],
                pos=item["pos"],
                pronunciation=item["pronunciation"],
                definition=item["definition"],
                example_butuanon=ex_but,
                example_english=ex_eng,
                verified=item["verified"],
                rating=item["rating"]
            )
            db.add(entry)
        db.commit()
        db_count = db.query(DictionaryEntry).count()
        print(f"2. SQLite Database repopulated with {db_count} clean A-Z sorted records.")
    except Exception as e:
        db.rollback()
        print(f"Error resetting database: {e}")
    finally:
        db.close()

    # Sync frontend DictionaryPage.tsx
    print("3. Syncing DictionaryPage.tsx...")
    if hasattr(update_frontend_fallback, 'main'):
        update_frontend_fallback.main()
    print("=== Clean and Sort Complete ===")

if __name__ == "__main__":
    clean_and_sort()
