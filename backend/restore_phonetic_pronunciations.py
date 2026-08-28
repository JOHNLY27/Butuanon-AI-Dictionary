import sys
import os
import json
import re

backend_dir = os.path.dirname(os.path.abspath(__file__))
json_filepath = os.path.join(backend_dir, "generated_butuanon_words.json")

# Known phonetic pronunciations map
phonetic_map = {
    "madiyaw nga hinaat": "mah-DEE-yow ngah hee-NAH-at",
    "madiyaw nga hapon": "mah-dee-YAWNG hah-PON",
    "madiyaw nga gabi-i": "mah-dee-YAWNG gah-bee-EE",
    "suwang": "soo-WANG",
    "amigo": "ah-MEE-go",
    "balay": "BAH-lay",
    "hinaat": "hee-nah-AT",
    "daga": "DAH-gah",
    "gugma": "GOOG-mah",
    "kahoy": "KAH-hoy",
    "lungsod": "LOONG-sod",
    "pamilya": "pah-MEEL-yah",
    "tawo": "TAH-wo",
    "tubig": "TOO-big",
    "abaga": "ah-BAH-gah",
    "abil": "AH-bil",
    "adhaa": "ad-HA-a",
    "agáy": "ah-GAY",
    "agay": "ah-GAY",
    "alimatá": "ah-lee-mah-TA",
    "alima": "ah-lee-MAH",
    "amát": "ah-MAT",
    "amat": "ah-MAT",
    "ambák": "ahm-BAK",
    "ambak": "ahm-BAK",
    "ambao": "ahm-BA-o",
    "ampan": "ahm-PAN",
    "anád": "ah-NAD",
    "anad": "ah-NAD",
    "aninipot": "ah-nee-nee-POT",
    "anugon": "ah-noo-GON",
    "apapangig": "ah-pah-PANG-eeg",
    "apík": "ah-PEEK",
    "apik": "ah-PEEK",
    "aretes": "ah-REH-tes",
    "atabay": "ah-tah-BAY",
    "atulí": "ah-too-LEE",
    "atoli'": "ah-too-LEE",
    "asidô": "ah-see-DOH",
    "asido": "ah-see-DOH",
    "aslág": "ahs-LAG",
    "aslag": "ahs-LAG",
    "aslóm": "ahs-LOM",
    "atuob": "ah-too-OB",
    "salamat": "sah-LAH-mat",
    "kumusta ka": "koo-MOOS-tah kah",
    "palihug": "pah-LEE-hoog",
    "amping": "AM-ping"
}

def generate_phonetic(word_str, current_pron):
    key = word_str.lower().strip()
    if key in phonetic_map:
        return phonetic_map[key]
    if current_pron and "-" in current_pron and any(c.isupper() for c in current_pron):
        return current_pron
    # Format hyphens to stressed uppercase syllable
    parts = word_str.split()
    formatted_parts = []
    for part in parts:
        subparts = part.split("-")
        if len(subparts) > 1:
            formatted_subparts = [sp.lower() if i < len(subparts)-1 else sp.upper() for i, sp in enumerate(subparts)]
            formatted_parts.append("-".join(formatted_subparts))
        else:
            if len(part) <= 4:
                formatted_parts.append(part.upper())
            else:
                formatted_parts.append(part[:len(part)//2].lower() + "-" + part[len(part)//2:].upper())
    return " ".join(formatted_parts)

def update_phonetics():
    with open(json_filepath, "r", encoding="utf-8") as f:
        words = json.load(f)

    for item in words:
        but = item.get("butuanon", "")
        curr_pron = item.get("pronunciation", "")
        item["pronunciation"] = generate_phonetic(but, curr_pron)

    with open(json_filepath, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    print(f"Updated phonetics for {len(words)} entries in generated_butuanon_words.json.")
    
    # Run fix order script to sync DictionaryPage.tsx and SQLite
    import fix_dictionary_page_alphabetical_order
    fix_dictionary_page_alphabetical_order.fix_order()

if __name__ == "__main__":
    update_phonetics()
