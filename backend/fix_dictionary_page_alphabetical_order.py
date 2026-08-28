import sys
import os
import json
import re

backend_dir = os.path.dirname(os.path.abspath(__file__))
json_filepath = os.path.join(backend_dir, "generated_butuanon_words.json")
frontend_filepath = os.path.join(backend_dir, "..", "src", "app", "components", "DictionaryPage.tsx")

# Add backend to sys.path
sys.path.append(backend_dir)
from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry

def sanitize_word(word_str):
    if not word_str:
        return ""
    cleaned = word_str.strip(" '`“\"‘")
    if not cleaned:
        return word_str.strip()
    return cleaned

def fix_order():
    with open(json_filepath, "r", encoding="utf-8") as f:
        words = json.load(f)

    # Clean up words and deduplicate
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

        ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
        ex_eng = item.get("exampleEnglish") or item.get("example_english")

        cleaned_entries.append({
            "butuanon": cleaned_word,
            "english": item.get("english", "").strip(),
            "pos": pos,
            "pronunciation": item.get("pronunciation", cleaned_word.lower()).strip(),
            "definition": item.get("definition", "").strip(),
            "exampleButuanon": ex_but if ex_but else f"{cleaned_word} sa Butuan.",
            "exampleEnglish": ex_eng if ex_eng else f"Example sentence for {cleaned_word}.",
            "verified": item.get("verified", "academic"),
            "rating": item.get("rating", 5)
        })

    # Sort strictly alphabetically (A to Z) by lowercased Butuanon word
    cleaned_entries.sort(key=lambda x: x["butuanon"].lower())

    print(f"Total clean entries to format: {len(cleaned_entries)}")
    print(f"First entry in sorted list: {cleaned_entries[0]['butuanon']}")
    print(f"Second entry in sorted list: {cleaned_entries[1]['butuanon']}")

    # Save sorted JSON
    with open(json_filepath, "w", encoding="utf-8") as f:
        json.dump(cleaned_entries, f, indent=2, ensure_ascii=False)

    # Re-build TS dictionaryEntries array
    array_lines = ["export const dictionaryEntries = ["]
    for idx, entry in enumerate(cleaned_entries, start=1):
        verified_val = f'"{entry["verified"]}" as VerifiedTag' if entry["verified"] else "null as VerifiedTag"
        formatted_str = f"""  {{
    id: {idx},
    butuanon: {json.dumps(entry["butuanon"])},
    english: {json.dumps(entry["english"])},
    pos: "{entry["pos"]}",
    pronunciation: {json.dumps(entry["pronunciation"])},
    definition: {json.dumps(entry["definition"])},
    exampleButuanon: {json.dumps(entry["exampleButuanon"])},
    exampleEnglish: {json.dumps(entry["exampleEnglish"])},
    verified: {verified_val},
    rating: {entry["rating"]},
  }},"""
        array_lines.append(formatted_str)
    array_lines.append("];")

    new_array_str = "\n".join(array_lines)

    # Read DictionaryPage.tsx
    with open(frontend_filepath, "r", encoding="utf-8") as f:
        content = f.read()

    start_marker = "export const dictionaryEntries = ["
    end_marker = "];"

    start_idx = content.find(start_marker)
    if start_idx != -1:
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            updated_content = content[:start_idx] + new_array_str + content[end_idx + len(end_marker):]
            with open(frontend_filepath, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print("Successfully updated DictionaryPage.tsx source code with exact A-Z order starting at Ab-ab!")

    # Repopulate SQLite database with IDs 1..N matching A-Z order
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(DictionaryEntry).delete()
        db.commit()

        for idx, item in enumerate(cleaned_entries, start=1):
            entry = DictionaryEntry(
                id=idx,
                butuanon=item["butuanon"],
                english=item["english"],
                pos=item["pos"],
                pronunciation=item["pronunciation"],
                definition=item["definition"],
                example_butuanon=item["exampleButuanon"],
                example_english=item["exampleEnglish"],
                verified=item["verified"],
                rating=item["rating"]
            )
            db.add(entry)
        db.commit()
        db_count = db.query(DictionaryEntry).count()
        print(f"SQLite DB repopulated with {db_count} records starting with ID 1: {cleaned_entries[0]['butuanon']}")
    except Exception as e:
        db.rollback()
        print(f"Error resetting database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_order()
