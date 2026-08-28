import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY.")
    sys.exit(1)

client = create_client(url, key)

json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
with open(json_path, "r", encoding="utf-8") as f:
    words = json.load(f)

# Sort strictly A to Z
words.sort(key=lambda x: x["butuanon"].lower())

print(f"Loaded {len(words)} sorted entries from generated_butuanon_words.json.")
print(f"First word to insert: {words[0]['butuanon']}")

try:
    print("Deleting old rows in Supabase dictionary table...")
    client.table("dictionary").delete().neq("id", -1).execute()
    print("Old rows cleared successfully.")
except Exception as e:
    print(f"Warning during delete: {e}")

# Insert in chunks of 50
chunk_size = 50
total_inserted = 0

for i in range(0, len(words), chunk_size):
    chunk = words[i:i+chunk_size]
    payload = []
    for idx, item in enumerate(chunk, start=i+1):
        ex_but = item.get("exampleButuanon") or item.get("example_butuanon")
        ex_eng = item.get("exampleEnglish") or item.get("example_english")
        payload.append({
            "id": idx,
            "butuanon": item["butuanon"],
            "english": item["english"],
            "pos": item["pos"],
            "pronunciation": item["pronunciation"],
            "definition": item["definition"],
            "example_butuanon": ex_but if ex_but else f"{item['butuanon']} sa Butuan.",
            "example_english": ex_eng if ex_eng else f"Example for {item['butuanon']}.",
            "verified": item.get("verified", "academic"),
            "rating": item.get("rating", 5)
        })
    try:
        res = client.table("dictionary").insert(payload).execute()
        total_inserted += len(payload)
        print(f"Inserted chunk {i//chunk_size + 1}: {total_inserted}/{len(words)} rows inserted into Supabase...")
    except Exception as e:
        print(f"Error inserting chunk {i}: {e}")

print(f"\nSUCCESS! Fully reseeded Supabase dictionary table with {total_inserted} A-Z entries starting at '{words[0]['butuanon']}'!")
