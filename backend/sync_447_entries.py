import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry
import update_frontend_fallback

# Essential phrases & contributions to ensure complete alignment
additional_phrases = [
    {
        "butuanon": "Kumusta ka",
        "english": "How are you?",
        "pos": "phrase",
        "pronunciation": "koo-MOOS-tah kah",
        "definition": "A common greeting asking about someone's well-being.",
        "exampleButuanon": "Kumusta ka, amigo?",
        "exampleEnglish": "How are you, friend?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Salamat",
        "english": "Thank you",
        "pos": "phrase",
        "pronunciation": "sah-LAH-mat",
        "definition": "An expression of gratitude or appreciation.",
        "exampleButuanon": "Dako nga salamat sa imong tabang.",
        "exampleEnglish": "Big thank you for your help.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Palihug",
        "english": "Please",
        "pos": "phrase",
        "pronunciation": "pah-LEE-hoog",
        "definition": "Used as a polite request.",
        "exampleButuanon": "Palihug ihatag ang tubig.",
        "exampleEnglish": "Please give the water.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Amping",
        "english": "Take care",
        "pos": "phrase",
        "pronunciation": "AM-ping",
        "definition": "An expression used when parting, wishing someone safety.",
        "exampleButuanon": "Amping sa imong biyahe.",
        "exampleEnglish": "Take care on your trip.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Madiyaw nga hapon",
        "english": "Good afternoon",
        "pos": "phrase",
        "pronunciation": "mah-dee-YAWNG hah-PON",
        "definition": "A greeting used during afternoon hours.",
        "exampleButuanon": "Madiyaw nga hapon sa inyong tanan.",
        "exampleEnglish": "Good afternoon to all of you.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Madiyaw nga gabi-i",
        "english": "Good evening / Good night",
        "pos": "phrase",
        "pronunciation": "mah-dee-YAWNG gah-bee-EE",
        "definition": "A greeting used during evening or night hours.",
        "exampleButuanon": "Madiyaw nga gabi-i, pamilya.",
        "exampleEnglish": "Good evening, family.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Oo",
        "english": "Yes",
        "pos": "phrase",
        "pronunciation": "oh-OH",
        "definition": "An affirmative response.",
        "exampleButuanon": "Oo, mo-anhi ako.",
        "exampleEnglish": "Yes, I will come.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Dili",
        "english": "No / Not",
        "pos": "phrase",
        "pronunciation": "dee-LEE",
        "definition": "A negative response.",
        "exampleButuanon": "Dili ako mag-reklamo.",
        "exampleEnglish": "I will not complain.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Pila",
        "english": "How much / How many",
        "pos": "phrase",
        "pronunciation": "pee-LAH",
        "definition": "Used to ask about quantity or price.",
        "exampleButuanon": "Pila ini?",
        "exampleEnglish": "How much is this?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Hain",
        "english": "Where",
        "pos": "phrase",
        "pronunciation": "hah-IN",
        "definition": "Used to ask about location.",
        "exampleButuanon": "Hain ang balay?",
        "exampleEnglish": "Where is the house?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kinsa",
        "english": "Who",
        "pos": "phrase",
        "pronunciation": "keen-SAH",
        "definition": "Used to ask about a person's identity.",
        "exampleButuanon": "Kinsa ka?",
        "exampleEnglish": "Who are you?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Unsa",
        "english": "What",
        "pos": "phrase",
        "pronunciation": "oon-SAH",
        "definition": "Used to ask for information about something.",
        "exampleButuanon": "Unsa ini?",
        "exampleEnglish": "What is this?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kano",
        "english": "When",
        "pos": "phrase",
        "pronunciation": "kah-NOH",
        "definition": "Used to ask about time.",
        "exampleButuanon": "Kano ka mabuhi?",
        "exampleEnglish": "When will you arrive?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Ngano",
        "english": "Why",
        "pos": "phrase",
        "pronunciation": "ngah-NOH",
        "definition": "Used to ask for a reason or explanation.",
        "exampleButuanon": "Ngano man?",
        "exampleEnglish": "Why is that?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Unsaon",
        "english": "How",
        "pos": "phrase",
        "pronunciation": "oon-sah-ON",
        "definition": "Used to ask about the way or manner of doing something.",
        "exampleButuanon": "Unsaon pagbuhat ini?",
        "exampleEnglish": "How to do this?",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kaiban",
        "english": "Companion / Friend",
        "pos": "noun",
        "pronunciation": "kah-ee-BAN",
        "definition": "A companion, buddy, or fellow member.",
        "exampleButuanon": "Kaiban nako si Juan.",
        "exampleEnglish": "Juan is my companion.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Suba",
        "english": "River",
        "pos": "noun",
        "pronunciation": "soo-BAH",
        "definition": "A large natural stream of water flowing in a channel to the sea or a lake.",
        "exampleButuanon": "Agusan suba sa Butuan.",
        "exampleEnglish": "Agusan river in Butuan.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kuman",
        "english": "Now / Today",
        "pos": "adverb",
        "pronunciation": "koo-MAN",
        "definition": "At the present time or date.",
        "exampleButuanon": "Kuman na kita moki-an.",
        "exampleEnglish": "Let us go now.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Disani",
        "english": "Here",
        "pos": "adverb",
        "pronunciation": "dee-sah-NEE",
        "definition": "In or at this place.",
        "exampleButuanon": "Disani ang among balay.",
        "exampleEnglish": "Our house is here.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Sa-a",
        "english": "Taro / Gabi",
        "pos": "noun",
        "pronunciation": "sah-AH",
        "definition": "A tropical root crop widely grown for edible starchy corms.",
        "exampleButuanon": "Lami ang sa-a.",
        "exampleEnglish": "The taro is delicious.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Ba-o",
        "english": "Turtle",
        "pos": "noun",
        "pronunciation": "bah-OH",
        "definition": "A slow-moving reptile enclosed in a scaly or leathery shell.",
        "exampleButuanon": "Hinay maglakaw ang ba-o.",
        "exampleEnglish": "The turtle walks slowly.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Bati-is",
        "english": "Lower leg / Calf",
        "pos": "noun",
        "pronunciation": "bah-tee-IS",
        "definition": "The part of the human leg between the knee and ankle.",
        "exampleButuanon": "Sakit akong bati-is.",
        "exampleEnglish": "My lower leg hurts.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Gabi-i",
        "english": "Night / Evening",
        "pos": "noun",
        "pronunciation": "gah-bee-EE",
        "definition": "The period of darkness between sunset and sunrise.",
        "exampleButuanon": "Mainit ang gabi-i.",
        "exampleEnglish": "The night is warm.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kagabi-i",
        "english": "Last night",
        "pos": "adverb",
        "pronunciation": "kah-gah-bee-EE",
        "definition": "During the previous night.",
        "exampleButuanon": "Miyulan kagabi-i.",
        "exampleEnglish": "It rained last night.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kis-a",
        "english": "Sometimes",
        "pos": "adverb",
        "pronunciation": "kees-AH",
        "definition": "On some occasions; occasionally.",
        "exampleButuanon": "Kis-a mamiya ako.",
        "exampleEnglish": "Sometimes I leave.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Sigi",
        "english": "Okay / Go ahead",
        "pos": "phrase",
        "pronunciation": "see-GEE",
        "definition": "An expression of agreement or permission.",
        "exampleButuanon": "Sigi, lakaw na.",
        "exampleEnglish": "Okay, go ahead.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Tana",
        "english": "Let's go",
        "pos": "phrase",
        "pronunciation": "tah-NAH",
        "definition": "An invitation to leave or proceed together.",
        "exampleButuanon": "Tana sa balay.",
        "exampleEnglish": "Let's go to the house.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Ayaw",
        "english": "Don't / Do not",
        "pos": "phrase",
        "pronunciation": "ah-YAW",
        "definition": "Used to express prohibition.",
        "exampleButuanon": "Ayaw kabalaka.",
        "exampleEnglish": "Don't worry.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Bahaqu",
        "english": "New",
        "pos": "adjective",
        "pronunciation": "bah-hah-KOO",
        "definition": "Not existing before; recently made or discovered.",
        "exampleButuanon": "Bahaqu ang akong libro.",
        "exampleEnglish": "My book is new.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Daan",
        "english": "Old / Previous",
        "pos": "adjective",
        "pronunciation": "dah-AN",
        "definition": "Having lived or existed for a long time.",
        "exampleButuanon": "Daan na ini nga sasakyan.",
        "exampleEnglish": "This vehicle is already old.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Taas",
        "english": "Tall / High",
        "pos": "adjective",
        "pronunciation": "tah-AS",
        "definition": "Measuring a great distance from top to bottom.",
        "exampleButuanon": "Taas ang kahoy.",
        "exampleEnglish": "The tree is tall.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Mubo",
        "english": "Short / Low",
        "pos": "adjective",
        "pronunciation": "moo-BOH",
        "definition": "Measuring a small distance from end to end.",
        "exampleButuanon": "Mubo ang silya.",
        "exampleEnglish": "The chair is short.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Gamay",
        "english": "Small / Little",
        "pos": "adjective",
        "pronunciation": "gah-MAY",
        "definition": "Of small size or amount.",
        "exampleButuanon": "Gamay ang balay.",
        "exampleEnglish": "The house is small.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Dako",
        "english": "Big / Large",
        "pos": "adjective",
        "pronunciation": "dah-KOH",
        "definition": "Of considerable size, extent, or intensity.",
        "exampleButuanon": "Dako ang suba.",
        "exampleEnglish": "The river is big.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Bata",
        "english": "Child / Young person",
        "pos": "noun",
        "pronunciation": "bah-TAH",
        "definition": "A young human being below the age of full physical development.",
        "exampleButuanon": "Kulaag ang bata.",
        "exampleEnglish": "The child is happy.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Tigulang",
        "english": "Elderly / Old person",
        "pos": "noun",
        "pronunciation": "tee-goo-LANG",
        "definition": "An elderly person.",
        "exampleButuanon": "Respetohi ang tigulang.",
        "exampleEnglish": "Respect the elderly.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Lalaki",
        "english": "Male / Man",
        "pos": "noun",
        "pronunciation": "lah-lah-KEE",
        "definition": "An adult human male.",
        "exampleButuanon": "Madiyaw nga lalaki.",
        "exampleEnglish": "Good man.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Babaye",
        "english": "Female / Woman",
        "pos": "noun",
        "pronunciation": "bah-bah-YEE",
        "definition": "An adult human female.",
        "exampleButuanon": "Madiyaw nga babaye.",
        "exampleEnglish": "Good woman.",
        "verified": "academic",
        "rating": 5
    },
    {
        "butuanon": "Kamingaw",
        "english": "Loneliness / Solitude",
        "pos": "noun",
        "pronunciation": "kah-meeng-AW",
        "definition": "Sadness because one has no friends or company.",
        "exampleButuanon": "Gibatyag nako ang kamingaw.",
        "exampleEnglish": "I feel the loneliness.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kalisud",
        "english": "Hardship / Difficulty",
        "pos": "noun",
        "pronunciation": "kah-lee-SOOD",
        "definition": "Severe suffering or privation.",
        "exampleButuanon": "Adunay kalisud sa kinabuhi.",
        "exampleEnglish": "There is hardship in life.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kalinaw",
        "english": "Peace / Serenity",
        "pos": "noun",
        "pronunciation": "kah-lee-NAW",
        "definition": "Freedom from disturbance; tranquility.",
        "exampleButuanon": "Hinaot nga maginaray ug kalinaw.",
        "exampleEnglish": "May there be peace.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Paglaum",
        "english": "Hope",
        "pos": "noun",
        "pronunciation": "pahg-lah-UM",
        "definition": "A feeling of expectation and desire for a certain thing to happen.",
        "exampleButuanon": "Naay paglaum kanunay.",
        "exampleEnglish": "There is always hope.",
        "verified": "native-speaker",
        "rating": 5
    },
    {
        "butuanon": "Kaisog",
        "english": "Courage / Bravery",
        "pos": "noun",
        "pronunciation": "kah-ee-SOG",
        "definition": "The ability to do something that frightens one; bravery.",
        "exampleButuanon": "Dako ang iyang kaisog.",
        "exampleEnglish": "His courage is great.",
        "verified": "native-speaker",
        "rating": 5
    }
]

def sync_all():
    json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
    existing_words = []
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            existing_words = json.load(f)
            
    existing_map = {(w["butuanon"].lower().strip(), w.get("pos", "noun").lower().strip()): w for w in existing_words}
    
    added = 0
    for item in additional_phrases:
        key = (item["butuanon"].lower().strip(), item["pos"].lower().strip())
        if key not in existing_map:
            existing_words.append(item)
            existing_map[key] = item
            added += 1
            
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(existing_words, f, indent=2, ensure_ascii=False)
    print(f"1. Saved {len(existing_words)} entries to generated_butuanon_words.json (Added {added} missing phrases).")

    # Seed to local SQLite DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    inserted = 0
    updated = 0
    try:
        for item in existing_words:
            butuanon = item["butuanon"]
            pos = item.get("pos", "noun").lower()
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
                existing.verified = item.get("verified", "academic")
                existing.rating = item.get("rating", 5)
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
                    verified=item.get("verified", "academic"),
                    rating=item.get("rating", 5)
                )
                db.add(new_entry)
                inserted += 1
        db.commit()
        total_in_db = db.query(DictionaryEntry).count()
        print(f"2. SQLite Database synced: {total_in_db} total records.")
    except Exception as e:
        db.rollback()
        print(f"DB Sync error: {e}")
    finally:
        db.close()

    # Sync Frontend file
    print("3. Syncing DictionaryPage.tsx...")
    update_frontend_fallback.main() if hasattr(update_frontend_fallback, 'main') else None
    print("=== Complete Sync Done ===")

if __name__ == "__main__":
    sync_all()
