import json
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
frontend_filepath = os.path.join(backend_dir, "..", "src", "app", "components", "DictionaryPage.tsx")
json_filepath = os.path.join(backend_dir, "generated_butuanon_words.json")

print(f"Reading generated words from: {json_filepath}")
with open(json_filepath, "r", encoding="utf-8") as f:
    generated_words = json.load(f)

print(f"Loaded {len(generated_words)} generated words.")

# Build the new TS array string
array_lines = ["export const dictionaryEntries = ["]

# 1. Original 12 entries
original_entries = [
    {
        "id": 1,
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
        "id": 2,
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
        "id": 3,
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
        "id": 4,
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
        "id": 5,
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
        "id": 6,
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
        "id": 7,
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
        "id": 8,
        "butuanon": "Lungsod",
        "english": "City; Town",
        "pos": "noun",
        "pronunciation": "LOONG-sod",
        "definition": "A large and important town; an urban center.",
        "exampleButuanon": "Butuan ang among lungsod.",
        "exampleEnglish": "Butuan is our city.",
        "verified": None,
        "rating": 3
    },
    {
        "id": 9,
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
        "id": 10,
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
        "id": 11,
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
        "id": 12,
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

def format_entry(entry):
    verified_val = f'"{entry["verified"]}" as VerifiedTag' if entry["verified"] else "null as VerifiedTag"
    return f"""  {{
    id: {entry["id"]},
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

for entry in original_entries:
    array_lines.append(format_entry(entry))

# 2. Append generated words with incremental IDs starting from 13
current_id = 13
for entry in generated_words:
    # Filter out entries matching our original 12 keys if any, to avoid duplicate rendering
    # (though generated_words shouldn't duplicate original_entries, let's be safe)
    if entry["butuanon"].lower() in [o["butuanon"].lower() for o in original_entries]:
        continue
    
    formatted = {
        "id": current_id,
        "butuanon": entry["butuanon"],
        "english": entry["english"],
        "pos": entry["pos"],
        "pronunciation": entry["pronunciation"],
        "definition": entry["definition"],
        "exampleButuanon": entry["exampleButuanon"],
        "exampleEnglish": entry["exampleEnglish"],
        "verified": entry["verified"],
        "rating": entry["rating"]
    }
    array_lines.append(format_entry(formatted))
    current_id += 1

array_lines.append("];")
new_array_str = "\n".join(array_lines)

# Read the file
print(f"Reading frontend file: {frontend_filepath}")
with open(frontend_filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the export const dictionaryEntries block safely using standard string indexing
start_marker = "export const dictionaryEntries = ["
end_marker = "];"

start_idx = content.find(start_marker)
if start_idx != -1:
    end_idx = content.find(end_marker, start_idx)
    if end_idx != -1:
        updated_content = content[:start_idx] + new_array_str + content[end_idx + len(end_marker):]
        with open(frontend_filepath, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print("Frontend file saved successfully using safe string substitution.")
    else:
        print("ERROR: Could not find the end marker '];' in the frontend file.")
else:
    print("ERROR: Could not find the start marker 'export const dictionaryEntries = [' in the frontend file.")
