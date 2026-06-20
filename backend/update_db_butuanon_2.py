import sys
import os

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import DictionaryEntry

updates2 = [
    {
        "old_butuanon": "MAAYO",
        "new_butuanon": "Madiyaw",
        "english": "Good; Well",
        "pos": "adjective",
        "pronunciation": "mah-dee-YAW",
        "definition": "Indicates high quality, suitability, or goodness; good; well.",
        "example_butuanon": "Madiyaw ang iyang trabaho.",
        "example_english": "His work is good."
    },
    {
        "old_butuanon": "DAUTAN",
        "new_butuanon": "Laat",
        "english": "Bad; Evil",
        "pos": "adjective",
        "pronunciation": "lah-AT",
        "definition": "Indicates badness, poor quality, or evil; bad.",
        "example_butuanon": "Laat ang iyang gibuhat.",
        "example_english": "What he did was bad."
    },
    {
        "old_butuanon": "KINI",
        "new_butuanon": "Ini",
        "english": "This",
        "pos": "adverb",
        "pronunciation": "ee-NEE",
        "definition": "Demonstrative pronoun indicating something close to the speaker; this.",
        "example_butuanon": "Ini ang akong libro.",
        "example_english": "This is my book."
    },
    {
        "old_butuanon": "KANA",
        "new_butuanon": "Iyan",
        "english": "That (near listener)",
        "pos": "adverb",
        "pronunciation": "ee-YAN",
        "definition": "Demonstrative pronoun indicating something close to the listener; that.",
        "example_butuanon": "Iyan ang imong silya.",
        "example_english": "That is your chair."
    },
    {
        "old_butuanon": "KADTO",
        "new_butuanon": "Yadto",
        "english": "That (far)",
        "pos": "adverb",
        "pronunciation": "yad-TOH",
        "definition": "Demonstrative pronoun indicating something far from both speaker and listener; that over there.",
        "example_butuanon": "Yadto ang among balay.",
        "example_english": "That over there is our house."
    },
    {
        "old_butuanon": "SAKYANAN",
        "new_butuanon": "Sasakyan",
        "english": "Vehicle; Car",
        "pos": "noun",
        "pronunciation": "sah-sahk-YAN",
        "definition": "A thing used for transporting people or goods, especially on land.",
        "example_butuanon": "Bahaqu ang iyang sasakyan.",
        "example_english": "His vehicle is new."
    },
    {
        "old_butuanon": "PULTAHAN",
        "new_butuanon": "Lawang",
        "english": "Door",
        "pos": "noun",
        "pronunciation": "lah-WANG",
        "definition": "A hinged, sliding, or revolving barrier for entry to or exit from a room or building.",
        "example_butuanon": "Ablihi ang lawang.",
        "example_english": "Open the door."
    },
    {
        "old_butuanon": "KALIGOANAN",
        "new_butuanon": "Kabil",
        "english": "Bathroom",
        "pos": "noun",
        "pronunciation": "kah-BEEL",
        "definition": "A room containing a bathtub or shower and usually a washbasin and toilet.",
        "example_butuanon": "Hari ang kabil?",
        "example_english": "Where is the bathroom?"
    },
    {
        "old_butuanon": "MALIPAYON",
        "new_butuanon": "Kulaag",
        "english": "Happy; Joyful",
        "pos": "adjective",
        "pronunciation": "koo-LAH-ag",
        "definition": "Feeling or showing pleasure or contentment; happy.",
        "example_butuanon": "Kulaag kadyaw ako kuman.",
        "example_english": "I am very happy now."
    },
    {
        "old_butuanon": "MASULUB-ON",
        "new_butuanon": "Susah",
        "english": "Sad; Worried",
        "pos": "adjective",
        "pronunciation": "soo-SAH",
        "definition": "Feeling or showing sorrow; unhappy or worried.",
        "example_butuanon": "Ngano kay susah ka?",
        "example_english": "Why are you sad?"
    }
]

def run_updates():
    db = SessionLocal()
    try:
        updated_count = 0
        deleted_duplicates = 0
        for item in updates2:
            old_name = item["old_butuanon"]
            new_name = item["new_butuanon"]
            
            # Find entry by old_butuanon (case-insensitive)
            entries = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(old_name)).all()
            
            # Find any existing entry with the new name to prevent duplicates
            existing = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(new_name)).all()
            
            if entries:
                for idx, entry in enumerate(entries):
                    if idx == 0 and not existing:
                        entry.butuanon = new_name
                        entry.english = item["english"]
                        entry.pos = item["pos"]
                        entry.pronunciation = item["pronunciation"]
                        entry.definition = item["definition"]
                        entry.example_butuanon = item["example_butuanon"]
                        entry.example_english = item["example_english"]
                        updated_count += 1
                        print(f"Updated: {old_name} -> {new_name}")
                    else:
                        db.delete(entry)
                        deleted_duplicates += 1
                        print(f"Deleted duplicate of {old_name}")
            else:
                if not existing:
                    new_entry = DictionaryEntry(
                        butuanon=new_name,
                        english=item["english"],
                        pos=item["pos"],
                        pronunciation=item["pronunciation"],
                        definition=item["definition"],
                        example_butuanon=item["example_butuanon"],
                        example_english=item["example_english"],
                        verified="academic",
                        rating=5
                    )
                    db.add(new_entry)
                    updated_count += 1
                    print(f"Inserted missing: {new_name}")
                    
        db.commit()
        print(f"Completed! Updated/Inserted: {updated_count}, Deleted Duplicates: {deleted_duplicates}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_updates()
