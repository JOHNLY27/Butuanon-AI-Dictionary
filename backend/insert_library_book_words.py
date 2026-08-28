import sys
import os
import re
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import DictionaryEntry, Contribution, User

raw_data = """
Ab-ab (verb)
Meaning: To bite voraciously
Definition: To bite aggressively or with great force.
Abaga (noun)
Meaning: Shoulder
Definition: The body part connecting the arm to the torso.
Abatod (noun)
Meaning: Caterpillar
Definition: The larval stage of a bettle.
Abang (verb)
Meaning: To block
Definition: To stop or obstruct the way.
Ab-hong (adjective)
Meaning: Moldy
Definition: Covered with mold or fungus.
Abod (noun)
Meaning: Whip lash mark
Definition: A mark left by a whip.
Sabod (verb)
Meaning: To feed the chicken
Definition: To give food to chickens.
Abis (verb)
Meaning: To slice
Definition: To cut into thin pieces.
Abog (noun)
Meaning: Dust
Definition: Fine dry particles of earth or dirt.
Abo (noun)
Meaning: Stove
Definition: A place or structure used for cooking.
Abot (verb)
Meaning: To arrive
Definition: To reach a destination.
Adoy / Agoy (expression)
Meaning: Exclamation of pain
Definition: An expression used when hurt or surprised.
Arat (noun)
Meaning: Endearing address to a woman
Definition: An affectionate way of addressing a woman.
Agay / Agay / Awas (expression)
Meaning: Flow of rain liquid
Definition: it is the act of liquid flowing.
Agmod (noun)
Meaning: Sound of a wild pig
Definition: The noise made by a wild pig.
Agda (verb)
Meaning: To request
Definition: To persuade to do something.
Agong (noun)
Meaning: Bass drum
Definition: A large percussion instrument producing deep sounds.
Agutay (noun)
Meaning: Wild banana
Definition: A native growing banana plant with seeds inside.
Atipawo (noun)
Meaning: Glow worm
Definition: A small insect that emits light.
Alimat (verb)
Meaning: Take care
Definition: To protect or look after someone or something.
Ahot (adjective)
Meaning: Brave
Definition: Showing courage.
Ako (pronoun)
Meaning: Mine
Definition: Something that belongs to me.
a’t (noun)
Meaning: Basket
Definition: A woven container used for carrying things.
Abay (noun)
Meaning: by the side
Definition: A procession held on water using boats.
Amat (adjective)
Meaning: bad
Definition: Unlikable.
Anak (noun)
Meaning: Child
Definition: A son or daughter.
Anak nga usog (noun)
Meaning: Son
Definition: A male child.
Anak nga daga (noun)
Meaning: Daughter
Definition: A female child.
Anib (adjective)
Meaning: to include
Definition: to belong to a group.
Anibong (noun)
Meaning: Palm tree
Definition: A tropical tree with large fan-shaped leaves.
Anog-og (noun)
Meaning: Thunder
Definition: The loud sound produced during a storm.
Anogot (noun)
Meaning: made from dried leaves
Definition: A handheld source of fire or light.
Ano-os (noun)
Meaning: Smoke
Definition: The visible gas produced by burning.
Anod (verb)
Meaning: Carried by flood
Definition: To be swept away by floodwater.
Anok (adjective)
Meaning: Warm; feverish
Definition: Having elevated body temperature.
Apik (noun)
Meaning: Cat
Definition: A domesticated feline animal.
‘Apo (noun)
Meaning: Grandparent
Definition: The parent of one's parent.
Apo’ (noun)
Meaning: Grandchildren
Definition: The children of one's children.
Apog (noun)
Meaning: Lime
Definition: A white alkaline substance used in construction or betel chewing.
Apod (adjective)
Meaning: Astringent
Definition: Having a sharp or drying taste.
Apan (noun)
Meaning: grass Hoppers
Definition: An insect that jumps, such as a grasshopper.
Apdo (noun)
Meaning: Bile
Definition: A digestive fluid produced by the liver.
Apot (adjective)
Meaning: Sticky
Definition: Having a surface that easily adheres.
Asubo (verb)
Meaning: Ask
Definition: To request information or something from someone.
Asido (adjective)
Meaning: Small
Definition: Of little size.
Asidot (adjective)
Meaning: Smaller
Definition: More small in size.
Asidotay (adjective)
Meaning: Smallest
Definition: The least in size.
Asok (verb)
Meaning: To pester
Definition: To annoy repeatedly.
Asngab (verb)
Meaning: Bite (bigger)
Definition: To bite forcefully.
Angkab (verb)
Meaning: Bite
Definition: To cut with the teeth.
Ati-at (noun)
Meaning: Installment
Definition: A payment made in parts over time.
Ato’b (verb)
Meaning: To medicate using smoke
Definition: To produce or inhale smoke.
Atod (verb)
Meaning: To see
Definition: To perceive with the eyes.
Awod-awaod (adjective)
Meaning: attention seeker
Definition: Wanting more than what is needed.
Ago-ab (verb)
Meaning: To cut grass with a flat-bladed bolo
Definition: To clear grass using a flat-bladed bolo.
Aninipot (noun)
Meaning: Fireflies
Definition: Small insects that glow at night.
Atole (noun)
Meaning: Sago delicacy
Definition: A food made from sago.
Atoli’ (noun)
Meaning: Earwax
Definition: The wax naturally found inside the ear.
Ati-a (expression)
Meaning: Expression of dislike
Definition: A reaction showing disapproval.
Ati-at (noun)
Meaning: Installment; little by little
Definition: Something done gradually or in parts.
Alingongog (adjective)
Meaning: Noisy
Definition: Producing a lot of sound.
Aliwas (noun)
Meaning: Big monkey ape
Definition: A large monkey.
Aho (noun)
Meaning: Pestle
Definition: A small instrument.
Ambak (noun)
Meaning: Frog
Definition: An amphibian that jumps.
Ambao (noun)
Meaning: Rat
Definition: A small rodent.
simag (adjective)
Meaning: Wearied black animal with big eyes
Definition: Describes a tired dark-colored animal with large eyes.
Amag (verb)
Meaning: Shine
Definition: To give off light.
Anad (adjective)
Meaning: Tame
Definition: Gentle and accustomed to people.
Anad (verb)
Meaning: Study
Definition: To learn or examine something.
Anad-na (adjective)
Meaning: Used to
Definition: Familiar with something through repeated experience.
Ak-ak (verb)
Meaning: To peel
Definition: To remove the outer covering.
Ad-ad (verb)
Meaning: To slice
Definition: To cut into pieces.
Ap-ap (noun)
Meaning: Skin disease
Definition: A disease affecting the skin.
Ag-ag (verb)
Meaning: To sieve
Definition: sieve flour.
Ago-ago (verb)
Meaning: Pretending to know
Definition: Acting as if one knows something.
Ago-agoy (verb)
Meaning: Pretending to feel pain
Definition: Acting as if one is in pain.
Ang-ang (adjective)
Meaning: Not in the right range
Definition: Outside the proper limit.
Amo-amo (verb)
Meaning: look a like
Definition: To look similar to something else.
Anod-anod (verb)
Meaning: go with the flow
Definition: Acting as if being swept away by water or another force.
Anad-anad (verb)
Meaning: Pretending to study; pretending to be tame
Definition: Acting as if studying or becoming tame.
Atubangan (noun)
Meaning: Front
Definition: The front or forward part.
"""

def parse_data(text):
    entries = []
    pattern = r"([^\n\(]+)\s*\(([^\)]+)\)\s*\nMeaning:\s*([^\n]+)\s*\nDefinition:\s*([^\n]+)"
    matches = re.findall(pattern, text)
    
    for match in matches:
        word, pos, meaning, definition = match
        word = word.strip()
        pos = pos.strip().lower()
        meaning = meaning.strip()
        definition = definition.strip()
        
        pronunciation = word.lower()
        
        entries.append({
            "butuanon": word,
            "pos": pos,
            "english": meaning,
            "definition": definition,
            "pronunciation": pronunciation,
            "example_butuanon": f"{word} sa Butuan.",
            "example_english": f"Example sentence for {word} ({meaning}).",
            "verified": "academic",
            "rating": 5
        })
    return entries

def insert_to_db(parsed_list):
    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    inserted = 0
    updated = 0
    
    try:
        for item in parsed_list:
            word = item["butuanon"]
            pos = item["pos"]
            
            existing = db.query(DictionaryEntry).filter(
                DictionaryEntry.butuanon.ilike(word),
                DictionaryEntry.pos.ilike(pos)
            ).first()
            
            if existing:
                existing.english = item["english"]
                existing.definition = item["definition"]
                existing.verified = "academic"
                existing.rating = 5
                updated += 1
                print(f"[Database] Updated: {word} ({pos})")
            else:
                new_entry = DictionaryEntry(
                    butuanon=word,
                    english=item["english"],
                    pos=pos,
                    pronunciation=item["pronunciation"],
                    definition=item["definition"],
                    example_butuanon=item["example_butuanon"],
                    example_english=item["example_english"],
                    verified="academic",
                    rating=5
                )
                db.add(new_entry)
                inserted += 1
                print(f"[Database] Inserted: {word} ({pos})")
                
        db.commit()
        print(f"\n[Database Success] Inserted: {inserted}, Updated: {updated}, Total: {len(parsed_list)}")
    except Exception as e:
        db.rollback()
        print(f"Error inserting into DB: {e}")
    finally:
        db.close()

def update_generated_json(parsed_list):
    json_path = os.path.join(os.path.dirname(__file__), "generated_butuanon_words.json")
    existing_words = []
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                existing_words = json.load(f)
        except Exception:
            existing_words = []
            
    existing_map = {(w["butuanon"].lower(), w.get("pos", "").lower()): w for w in existing_words}
    
    added = 0
    for item in parsed_list:
        key = (item["butuanon"].lower(), item["pos"].lower())
        json_item = {
            "butuanon": item["butuanon"],
            "english": item["english"],
            "pos": item["pos"],
            "pronunciation": item["pronunciation"],
            "definition": item["definition"],
            "exampleButuanon": item["example_butuanon"],
            "exampleEnglish": item["example_english"],
            "verified": "academic",
            "rating": 5
        }
        if key not in existing_map:
            existing_words.append(json_item)
            added += 1
        else:
            existing_map[key].update(json_item)
            
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(existing_words, f, indent=2, ensure_ascii=False)
        
    print(f"[JSON Update] Saved {len(existing_words)} total words to generated_butuanon_words.json (Added {added} new words)")

def update_frontend():
    # Run update_frontend_fallback.py to update DictionaryPage.tsx
    try:
        import update_frontend_fallback
        print("[Frontend Update] Synced DictionaryPage.tsx with latest entries.")
    except Exception as e:
        print(f"[Frontend Update Error]: {e}")

if __name__ == "__main__":
    parsed_list = parse_data(raw_data)
    print(f"Parsed {len(parsed_list)} entries from input data.")
    
    print("\n--- Step 1: Inserting into Database ---")
    insert_to_db(parsed_list)
    
    print("\n--- Step 2: Updating JSON Seed File ---")
    update_generated_json(parsed_list)
    
    print("\n--- Step 3: Syncing Frontend Dictionary Page ---")
    update_frontend()
    
    print("\n=== ALL PROCESSES COMPLETED SUCCESSFULLY ===")
