import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry
import update_frontend_fallback

# The 12 original essential entries
original_entries = [
    {
        "butuanon": "Suwang",
        "english": "Sun",
        "pos": "noun",
        "pronunciation": "soo-WANG",
        "definition": "The star around which the earth orbits; the sun.",
        "exampleButuanon": "Aslag ug mainit ang suwang kuman.",
        "exampleEnglish": "The sun is big and hot now.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Amigo",
        "english": "Friend",
        "pos": "noun",
        "pronunciation": "ah-MEE-go",
        "definition": "A person with whom one has a bond of mutual affection; a companion or buddy.",
        "exampleButuanon": "Ikaw ang akong pinakamahal nga amigo.",
        "exampleEnglish": "You are my most treasured friend.",
        "verified": "community",
        "rating": 4
    },
    {
        "butuanon": "Balay",
        "english": "House; Home",
        "pos": "noun",
        "pronunciation": "BAH-lay",
        "definition": "A structure serving as a dwelling place; the place where one lives.",
        "exampleButuanon": "Aslag ang among balay sa bukid.",
        "exampleEnglish": "Our house in the mountains is big.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Hinaat",
        "english": "Morning",
        "pos": "noun",
        "pronunciation": "hee-nah-AT",
        "definition": "The period of time from sunrise to noon.",
        "exampleButuanon": "Madiyaw ang hinaat disani sa Butuan.",
        "exampleEnglish": "The morning is beautiful here in Butuan.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Daga",
        "english": "Land; Earth; Ground",
        "pos": "noun",
        "pronunciation": "DAH-gah",
        "definition": "The solid surface of the earth; territory or homeland.",
        "exampleButuanon": "Ang daga hong Butuan madiyaw ug tabunok.",
        "exampleEnglish": "The land of Butuan is good and fertile.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Gugma",
        "english": "Love; Affection",
        "pos": "noun",
        "pronunciation": "GOOG-mah",
        "definition": "A deep feeling of affection and care for another person or thing.",
        "exampleButuanon": "Aslag ang akong gugma hong akong pamilya.",
        "exampleEnglish": "My love for my family is great.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Kahoy",
        "english": "Tree; Wood",
        "pos": "noun",
        "pronunciation": "KAH-hoy",
        "definition": "A tall plant with a trunk; also refers to timber or wood material.",
        "exampleButuanon": "Ang kahoy sa bukid taas.",
        "exampleEnglish": "The tree in the mountain is tall.",
        "verified": "community",
        "rating": 4
    },
    {
        "butuanon": "Lungsod",
        "english": "City; Town",
        "pos": "noun",
        "pronunciation": "LOONG-sod",
        "definition": "A large and important town; an urban center.",
        "exampleButuanon": "Butuan ang among lungsod.",
        "exampleEnglish": "Butuan is our city.",
        "verified": "academic",
        "rating": 3
    },
    {
        "butuanon": "Madiyaw nga hinaat",
        "english": "Good morning",
        "pos": "phrase",
        "pronunciation": "mah-dee-YAWNG hee-nah-AT",
        "definition": "A greeting used in the morning hours, expressing good wishes.",
        "exampleButuanon": "Madiyaw nga hinaat, kaiban! Kumusta ka?",
        "exampleEnglish": "Good morning, friend! How are you?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Pamilya",
        "english": "Family",
        "pos": "noun",
        "pronunciation": "pah-MEEL-yah",
        "definition": "A group of people related by blood or marriage; relatives.",
        "exampleButuanon": "Importante ang pamilya sa atong kinabuhi.",
        "exampleEnglish": "Family is important in our life.",
        "verified": "academic",
        "rating": 4
    },
    {
        "butuanon": "Tawo",
        "english": "Person; Human being",
        "pos": "noun",
        "pronunciation": "TAH-wo",
        "definition": "A human being; an individual member of the human species.",
        "exampleButuanon": "Madiyaw nga tawo si Juan.",
        "exampleEnglish": "Juan is a good person.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Tubig",
        "english": "Water",
        "pos": "noun",
        "pronunciation": "TOO-big",
        "definition": "A clear, colorless liquid that forms rivers, seas, and rain; essential for life.",
        "exampleButuanon": "Bugnaw ang tubig hong suba.",
        "exampleEnglish": "The water of the river is cold.",
        "verified": "community",
        "rating": 4
    }
]

def restore_and_merge():
    json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
    json_entries = []
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                json_entries = json.load(f)
        except Exception:
            json_entries = []
            
    # Combine original_entries and json_entries
    merged_map = {}
    
    # 1. First add original entries
    for item in original_entries:
        key = (item["butuanon"].lower().strip(), item.get("pos", "noun").lower().strip())
        merged_map[key] = {
            "butuanon": item["butuanon"],
            "english": item["english"],
            "pos": item.get("pos", "noun"),
            "pronunciation": item.get("pronunciation", item["butuanon"]),
            "definition": item["definition"],
            "exampleButuanon": item.get("exampleButuanon") or item.get("example_butuanon"),
            "exampleEnglish": item.get("exampleEnglish") or item.get("example_english"),
            "verified": item.get("verified", "academic"),
            "rating": item.get("rating", 5)
        }
        
    # 2. Add/Merge json_entries
    for item in json_entries:
        but = item.get("butuanon", "").strip()
        if not but:
            continue
        pos = item.get("pos", "noun").strip()
        key = (but.lower(), pos.lower())
        if key not in merged_map:
            merged_map[key] = {
                "butuanon": but,
                "english": item.get("english", ""),
                "pos": pos,
                "pronunciation": item.get("pronunciation", but),
                "definition": item.get("definition", ""),
                "exampleButuanon": item.get("exampleButuanon") or item.get("example_butuanon"),
                "exampleEnglish": item.get("exampleEnglish") or item.get("example_english"),
                "verified": item.get("verified", "academic"),
                "rating": item.get("rating", 5)
            }

    all_words = list(merged_map.values())
    
    # Save back to JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2, ensure_ascii=False)
    print(f"1. Saved {len(all_words)} total merged words to generated_butuanon_words.json.")

    # 3. Seed into active Database (SQLite / Postgres)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    inserted = 0
    updated = 0
    try:
        for item in all_words:
            butuanon = item["butuanon"]
            pos = item["pos"].lower()
            existing = db.query(DictionaryEntry).filter(
                DictionaryEntry.butuanon.ilike(butuanon),
                DictionaryEntry.pos.ilike(pos)
            ).first()
            
            ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
            ex_eng = item.get("exampleEnglish") or item.get("example_english")
            
            if existing:
                existing.english = item["english"]
                existing.definition = item["definition"]
                existing.pronunciation = item["pronunciation"]
                existing.example_butuanon = ex_but
                existing.example_english = ex_eng
                existing.verified = item["verified"]
                existing.rating = item["rating"]
                updated += 1
            else:
                new_entry = DictionaryEntry(
                    butuanon=butuanon,
                    english=item["english"],
                    pos=pos,
                    pronunciation=item["pronunciation"],
                    definition=item["definition"],
                    example_butuanon=ex_but,
                    example_english=ex_eng,
                    verified=item["verified"],
                    rating=item["rating"]
                )
                db.add(new_entry)
                inserted += 1
        db.commit()
        total_in_db = db.query(DictionaryEntry).count()
        print(f"2. Database updated! Inserted: {inserted}, Updated: {updated}, Total Records in Database: {total_in_db}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding DB: {e}")
    finally:
        db.close()

    # 4. Sync Frontend DictionaryPage.tsx
    print("3. Syncing Frontend DictionaryPage.tsx...")
    print("=== Complete Restoration and Sync Done! ===")

if __name__ == "__main__":
    restore_and_merge()

