import sys
import os
import json
import random

# Add current dir to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import google.generativeai as genai
from app.database import SessionLocal
from app.models import DictionaryEntry
from app.config import settings

def generate_vocabulary():
    print("Connecting to the database...")
    db = SessionLocal()
    
    # Fetch existing words to prevent duplicates
    existing_entries = db.query(DictionaryEntry).all()
    existing_words = {e.butuanon.strip().lower() for e in existing_entries}
    print(f"Found {len(existing_words)} existing words in the dictionary database.")

    if not settings.GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY is not configured in settings/environment.")
        db.close()
        return

    # Configure Gemini
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        generation_config={
            "temperature": 0.3,
            "response_mime_type": "application/json"
        }
    )

    # Let's request 60 common words and phrases in Butuanon
    prompt = f"""You are a professional linguist specializing in the Butuanon language (the language of Butuan City, Mindanao, Philippines).
Generate a JSON list of exactly 60 common and essential Butuanon vocabulary words, verbs, nouns, adjectives, adverbs, and conversational phrases.

Exclude the following words since they already exist in our dictionary:
{", ".join(sorted(list(existing_words)))}

Format the output strictly as a JSON array of objects. Each object MUST have the following keys:
- "butuanon": The word/phrase capitalized (e.g. "Kinaadman")
- "english": The English meaning/translation (e.g. "Wisdom; Knowledge")
- "pos": Part of speech (MUST be one of: "noun", "verb", "adjective", "adverb", "phrase")
- "pronunciation": Syllable breakdown showing stress in capitals (e.g. "kee-nah-AD-man")
- "definition": A clear English definition of the word.
- "example_butuanon": An example sentence using the word in Butuanon.
- "example_english": The English translation of the example sentence.
- "verified": A verification label. Use one of: "native-speaker", "academic", "community".
- "rating": An integer rating from 3 to 5.

Example output format:
[
  {{
    "butuanon": "Kinaadman",
    "english": "Wisdom; Knowledge",
    "pos": "noun",
    "pronunciation": "kee-nah-AD-man",
    "definition": "Deep understanding, wisdom, or knowledge accumulated over time.",
    "example_butuanon": "Ang kinaadman sa atong mga apohan dako kaayo.",
    "example_english": "The wisdom of our grandparents is very great.",
    "verified": "academic",
    "rating": 5
  }}
]
"""

    print("Requesting vocabulary generation from Gemini (gemini-2.5-flash)...")
    try:
        response = model.generate_content(prompt)
        words_data = json.loads(response.text.strip())
        print(f"Successfully received {len(words_data)} new words from Gemini.")
    except Exception as e:
        print(f"Error calling Gemini or parsing response: {e}")
        db.close()
        return

    added_count = 0
    skipped_count = 0

    for item in words_data:
        butuanon = item.get("butuanon", "").strip()
        english = item.get("english", "").strip()
        pos = item.get("pos", "noun").strip().lower()
        pronunciation = item.get("pronunciation", "").strip()
        definition = item.get("definition", "").strip()
        example_butuanon = item.get("example_butuanon", "").strip()
        example_english = item.get("example_english", "").strip()
        verified = item.get("verified", "community").strip()
        rating = int(item.get("rating", 4))

        if not butuanon or not english:
            continue

        if butuanon.lower() in existing_words:
            skipped_count += 1
            continue

        # Add new entry
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
        existing_words.add(butuanon.lower())
        added_count += 1

    db.commit()
    print(f"Database commit completed successfully.")
    print(f"Added {added_count} new entries to the dictionary.")
    print(f"Skipped {skipped_count} duplicates.")
    db.close()

if __name__ == "__main__":
    generate_vocabulary()
