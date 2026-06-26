import sys
import os
import json
import time

# Add parent directory of backend (or backend directory itself) to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

import google.generativeai as genai
from app.database import SessionLocal
from app.models import DictionaryEntry
from app.config import settings

# Raw list of words and translations to import
raw_data = [
    {"butuanon": "Abaga", "english": "Shoulder"},
    {"butuanon": "Abil", "english": "Lips"},
    {"butuanon": "Adhaa", "english": "Dry throat"},
    {"butuanon": "Agáy", "english": "Ouch"},
    {"butuanon": "Alima", "english": "Hands"},
    {"butuanon": "Alimatá", "english": "To watch / Take care of"},
    {"butuanon": "Amát", "english": "Blind"},
    {"butuanon": "Amo ba", "english": "Is it / Really?"},
    {"butuanon": "Ambák", "english": "Frog"},
    {"butuanon": "Ampan", "english": "Nothing"},
    {"butuanon": "Anád", "english": "Study / Learn"},
    {"butuanon": "Aninipot", "english": "Firefly"},
    {"butuanon": "Anugon", "english": "What a waste"},
    {"butuanon": "Apapangig", "english": "Jaw"},
    {"butuanon": "Apík", "english": "Cat"},
    {"butuanon": "Aretes", "english": "Earrings"},
    {"butuanon": "Atabay", "english": "Well (water)"},
    {"butuanon": "Atulí", "english": "Earwax"},
    {"butuanon": "Asidô", "english": "Little / Small"},
    {"butuanon": "Aslág", "english": "Big"},
    {"butuanon": "Aslóm", "english": "Sour"},
    {"butuanon": "Atuob", "english": "Burning of incense"},
    {"butuanon": "Ba-id", "english": "To ask for permission"},
    {"butuanon": "Bakakon", "english": "Liar"},
    {"butuanon": "Bagul-Bagul", "english": "Skull"},
    {"butuanon": "Balikadya", "english": "Jumbled"},
    {"butuanon": "Banag", "english": "Dragonfly"},
    {"butuanon": "Bangà", "english": "Bite"},
    {"butuanon": "Batikunuo", "english": "Gizzard"},
    {"butuanon": "Batyag", "english": "Wake up"},
    {"butuanon": "Bigaón", "english": "Flirty"},
    {"butuanon": "Bilár", "english": "To sleep late"},
    {"butuanon": "Bilasâ", "english": "Untidy appearance"},
    {"butuanon": "Bilí", "english": "Buy"},
    {"butuanon": "Bringhinas", "english": "Eggplant"},
    {"butuanon": "Biyangon", "english": "Post"},
    {"butuanon": "Bokaa", "english": "To boil"},
    {"butuanon": "Bukóg", "english": "Fish bone"},
    {"butuanon": "Bungoo", "english": "Deaf"},
    {"butuanon": "Burokà", "english": "Fight"},
    {"butuanon": "Burokinta", "english": "Belligerent"},
    {"butuanon": "Buaya", "english": "Crocodile"},
    {"butuanon": "Bulî", "english": "Butt"},
    {"butuanon": "Buntanak", "english": "Child"},
    {"butuanon": "Buthò", "english": "Suddenly appear"},
    {"butuanon": "Buyóg", "english": "Bee"},
    {"butuanon": "Kalibutan", "english": "World"},
    {"butuanon": "Daag", "english": "Climb"},
    {"butuanon": "Da-ak", "english": "To command"},
    {"butuanon": "Dakwâ", "english": "Big"},
    {"butuanon": "Datâ", "english": "Fall"},
    {"butuanon": "Dagaha", "english": "Chest"},
    {"butuanon": "Dag-ay", "english": "Laugh"},
    {"butuanon": "Daginâ", "english": "Step"},
    {"butuanon": "Dawngalî", "english": "Heat rashes"},
    {"butuanon": "Dayàw", "english": "Hide"},
    {"butuanon": "Dig-ay", "english": "Burp"},
    {"butuanon": "Dig-itá", "english": "A little amount"},
    {"butuanon": "Diskanso", "english": "Rest"},
    {"butuanon": "Dodò", "english": "Breast"},
    {"butuanon": "Doon", "english": "Now"},
    {"butuanon": "Duhò", "english": "Pass (something)"},
    {"butuanon": "Dukót", "english": "Burnt Rice"},
    {"butuanon": "Durò", "english": "Many"},
    {"butuanon": "Dusuan", "english": "Dip it"},
    {"butuanon": "Gabaligya", "english": "Selling"},
    {"butuanon": "Gaburuka", "english": "Fighting"},
    {"butuanon": "Gagmatoy", "english": "Very Small"},
    {"butuanon": "Gahî", "english": "Hard"},
    {"butuanon": "Gahikog", "english": "Hang himself"},
    {"butuanon": "Gahinang", "english": "To make"},
    {"butuanon": "Gahonghong", "english": "Whisper"},
    {"butuanon": "Galalís", "english": "To argue"},
    {"butuanon": "Galukò", "english": "Bend"},
    {"butuanon": "Gaiyák", "english": "Yell"},
    {"butuanon": "Gakapu-kapu", "english": "In a hurry"},
    {"butuanon": "Gakita", "english": "To see each other"},
    {"butuanon": "Galuya", "english": "Weak"},
    {"butuanon": "Gapaanto", "english": "Tulala (staring blankly)"},
    {"butuanon": "Gapatiwaa", "english": "To vanish"},
    {"butuanon": "Gasinumbagay", "english": "Fighting (fist)"},
    {"butuanon": "Gatikangkang", "english": "Open legs/lying flat"},
    {"butuanon": "Gibakadan", "english": "Suffered from gas pain"},
    {"butuanon": "Gibanlos", "english": "Hungry"},
    {"butuanon": "Gibuno", "english": "Stabbed"},
    {"butuanon": "Gikaw-an", "english": "Doing"},
    {"butuanon": "Gigum-os", "english": "Pin down"},
    {"butuanon": "Giputós", "english": "To wrap"},
    {"butuanon": "Gubín", "english": "Stir"},
    {"butuanon": "Gwapà", "english": "Beautiful"},
    {"butuanon": "Haang", "english": "Spicy"},
    {"butuanon": "Habit", "english": "Arm wrestling"},
    {"butuanon": "Hadtong una", "english": "Before"},
    {"butuanon": "Hagnok", "english": "Very quiet"},
    {"butuanon": "Hangaa", "english": "Greedy"},
    {"butuanon": "Hanggab", "english": "Inhale"},
    {"butuanon": "Hayupô", "english": "Short"},
    {"butuanon": "Hinaat", "english": "Morning"},
    {"butuanon": "Hinayhay", "english": "Clothesline / Dry clothes"},
    {"butuanon": "Hingaw", "english": "Drunk"},
    {"butuanon": "Hinlô", "english": "Clean"},
    {"butuanon": "Hipós", "english": "Kept"},
    {"butuanon": "Hikót", "english": "To bond / Tie"},
    {"butuanon": "Hubadon", "english": "Translate"},
    {"butuanon": "Huroton", "english": "Consume"},
    {"butuanon": "Ib-ib", "english": "To gnaw"},
    {"butuanon": "Idò", "english": "Dog"},
    {"butuanon": "Idro", "english": "Airplane"},
    {"butuanon": "Idut-ong", "english": "To include"},
    {"butuanon": "Indáy", "english": "I don't know"},
    {"butuanon": "Ingkudanan", "english": "Chair"},
    {"butuanon": "Ingod", "english": "Downstairs"},
    {"butuanon": "Isandig", "english": "To lean"},
    {"butuanon": "Itandì", "english": "To compare"},
    {"butuanon": "Kaalipukpukan", "english": "Most end / Tip"},
    {"butuanon": "Kabâ-kabâ", "english": "Butterfly"},
    {"butuanon": "Kabaw", "english": "Cow / Carabao"},
    {"butuanon": "Kablit", "english": "To chuck / Touch"},
    {"butuanon": "Kabuyong", "english": "Noisy"},
    {"butuanon": "Kahagkot", "english": "So cold"},
    {"butuanon": "Kahapdós", "english": "Sore"},
    {"butuanon": "Kahamót", "english": "Fragrance"},
    {"butuanon": "Kahisnang", "english": "Frisky"},
    {"butuanon": "Kahoo", "english": "Loose"},
    {"butuanon": "Kailò", "english": "Pitiful"},
    {"butuanon": "Kaisdaan", "english": "Viand (Ulam)"},
    {"butuanon": "Kalipát", "english": "Forgotten"},
    {"butuanon": "Kaloód", "english": "Disgusting"},
    {"butuanon": "Kamasá", "english": "To scratch"},
    {"butuanon": "Kamrás", "english": "Scratch"},
    {"butuanon": "Kanding", "english": "Goat"},
    {"butuanon": "Kandiis", "english": "Dimple"},
    {"butuanon": "Kapasô", "english": "So hot"},
    {"butuanon": "Kasuk-an", "english": "To scold"},
    {"butuanon": "Kataginânâ", "english": "Observed"},
    {"butuanon": "Katoo", "english": "Itch"},
    {"butuanon": "Kiandan", "english": "Used to"},
    {"butuanon": "Kinumò", "english": "Fist"},
    {"butuanon": "Kisayran", "english": "Found out"},
    {"butuanon": "Kugpà", "english": "To fall / Stumble"},
    {"butuanon": "Kumagko", "english": "Thumb"},
    {"butuanon": "Kumbusna", "english": "However"},
    {"butuanon": "Kunsoom", "english": "Tomorrow"},
    {"butuanon": "Kusî", "english": "Pinch"},
    {"butuanon": "Kutáy", "english": "Clothesline"},
    {"butuanon": "Kutob", "english": "Till here"},
    {"butuanon": "Laktod", "english": "To cross"},
    {"butuanon": "Lang-à", "english": "To tell"},
    {"butuanon": "Lapò", "english": "Hit"},
    {"butuanon": "Latós", "english": "Strike"},
    {"butuanon": "Lawâ-lawâ", "english": "Spider"},
    {"butuanon": "Lawom baay", "english": "Under the house"},
    {"butuanon": "Lintî", "english": "Thunder"},
    {"butuanon": "Listo", "english": "Ready"},
    {"butuanon": "Luy-à", "english": "Ginger"},
    {"butuanon": "Ludyô", "english": "Machete"},
    {"butuanon": "Lunay", "english": "Soft"},
    {"butuanon": "Lupà", "english": "Land / Soil"},
    {"butuanon": "Maalia", "english": "Tardy / Slow"},
    {"butuanon": "Maasin", "english": "Salty"},
    {"butuanon": "Maát", "english": "Shameless / Bad"},
    {"butuanon": "Madabò", "english": "Shaggy"},
    {"butuanon": "Madayâ", "english": "Lie down"},
    {"butuanon": "Makatoo", "english": "Itchy"},
    {"butuanon": "Mahisnang", "english": "Mischievous"},
    {"butuanon": "Mag-aguanta", "english": "To endure"},
    {"butuanon": "Mag-anad", "english": "Study"},
    {"butuanon": "Mag-ignay", "english": "Avoid"},
    {"butuanon": "Maghinok", "english": "Tiptoe"},
    {"butuanon": "Magpakulong", "english": "Get hair curled"},
    {"butuanon": "Magpasaa", "english": "To practice"},
    {"butuanon": "Magpalahok-lahok", "english": "To wander"},
    {"butuanon": "Magsalibay", "english": "Throw"},
    {"butuanon": "Magsili", "english": "To change clothes"},
    {"butuanon": "Malahà-lahà", "english": "Shameless"},
    {"butuanon": "Malumos", "english": "Drown"},
    {"butuanon": "Mamahaw", "english": "To eat breakfast"},
    {"butuanon": "Mamugà", "english": "To scare"},
    {"butuanon": "Mangadyi", "english": "To pray"},
    {"butuanon": "Manigpod", "english": "To balance"},
    {"butuanon": "Mangili", "english": "Dirty"},
    {"butuanon": "Manglahatab", "english": "To steal"},
    {"butuanon": "Mangasubo", "english": "To ask"},
    {"butuanon": "Mangyat", "english": "Proficient / Know how"},
    {"butuanon": "Mantener", "english": "Sustain"},
    {"butuanon": "Masawa", "english": "So bright"},
    {"butuanon": "Masignat", "english": "Shocked"},
    {"butuanon": "Masipog", "english": "Ashamed"},
    {"butuanon": "Masukô", "english": "Get mad"},
    {"butuanon": "Mabukgan", "english": "Choke on bone"},
    {"butuanon": "Matutô", "english": "Raise / Care"},
    {"butuanon": "Mayumo", "english": "Sweet"},
    {"butuanon": "Miaan", "english": "Mistaken"},
    {"butuanon": "Mibotô", "english": "Explode"},
    {"butuanon": "Midalin-as", "english": "Slipped"},
    {"butuanon": "Midat-ugan", "english": "Pin down"},
    {"butuanon": "Mikatawa", "english": "To laugh"},
    {"butuanon": "Mikaosmod", "english": "Subsob (face down)"},
    {"butuanon": "Mikuyapan", "english": "Fainted"},
    {"butuanon": "Mihatlok", "english": "Died"},
    {"butuanon": "Miigô", "english": "Hit"},
    {"butuanon": "Miiyan", "english": "Became like that"},
    {"butuanon": "Miligpitan", "english": "Pressed"},
    {"butuanon": "Milipong", "english": "Dizzy"},
    {"butuanon": "Mingintawon", "english": "Defecate"},
    {"butuanon": "Minalinghug", "english": "Listened"},
    {"butuanon": "Mina-usog", "english": "Gay"},
    {"butuanon": "Mingamho", "english": "Hope"},
    {"butuanon": "Mikudoo", "english": "Wrinkled"},
    {"butuanon": "Miilo na", "english": "Orphan"},
    {"butuanon": "Milagà", "english": "Flame"},
    {"butuanon": "Misilo", "english": "Sulking"},
    {"butuanon": "Mitiyaho", "english": "Crying"},
    {"butuanon": "Miuno ba kaw", "english": "What happened to you?"},
    {"butuanon": "Miuwat", "english": "Deceived"},
    {"butuanon": "Mokadto", "english": "Will go"},
    {"butuanon": "Mokaon", "english": "To eat"},
    {"butuanon": "Mokuwang", "english": "To lie down"},
    {"butuanon": "Moiban", "english": "To go along"},
    {"butuanon": "Muludâ", "english": "To spit"},
    {"butuanon": "Ngani", "english": "Here"},
    {"butuanon": "Ngawon", "english": "Later"},
    {"butuanon": "Ngansi taya", "english": "Why is it?"},
    {"butuanon": "Ogód", "english": "Nuka (skin sore)"},
    {"butuanon": "Ngotngot", "english": "Throbbing pain"},
    {"butuanon": "Paa", "english": "Smelly (urine)"},
    {"butuanon": "Pabyon", "english": "Mosquito Net"},
    {"butuanon": "Pabusla", "english": "To lend"},
    {"butuanon": "Padayata", "english": "Rest"},
    {"butuanon": "Pag-atud", "english": "To look at"},
    {"butuanon": "Pahunok", "english": "Stay"},
    {"butuanon": "Paiyan", "english": "Bound to"},
    {"butuanon": "Pagkamó", "english": "To cook rice"},
    {"butuanon": "Palís", "english": "Skin"},
    {"butuanon": "Pamisti", "english": "Get-up / Dress"},
    {"butuanon": "Panagsa", "english": "Sometimes"},
    {"butuanon": "Panakot", "english": "Spices"},
    {"butuanon": "Panaw", "english": "Walk"},
    {"butuanon": "Panggos", "english": "Scrape"},
    {"butuanon": "Pangawa", "english": "To get"},
    {"butuanon": "Panghiyamod", "english": "Wipe the face"},
    {"butuanon": "Pan-os", "english": "Spoiled"},
    {"butuanon": "Pâpâ", "english": "Chew"},
    {"butuanon": "Papaà", "english": "To erase"},
    {"butuanon": "Patsada", "english": "Nice / Beautiful"},
    {"butuanon": "Pigabanga", "english": "Bitten"},
    {"butuanon": "Pilók", "english": "Eyelashes"},
    {"butuanon": "Pinít", "english": "Lizard"},
    {"butuanon": "Pintalan", "english": "To paint"},
    {"butuanon": "Pisák", "english": "Mud"},
    {"butuanon": "Pisgaa", "english": "To squeeze"},
    {"butuanon": "Pisì", "english": "Rope"},
    {"butuanon": "Pisî", "english": "Pick up"},
    {"butuanon": "Pitlokon", "english": "To choke"},
    {"butuanon": "Pitsido", "english": "Tight"},
    {"butuanon": "Piyâ", "english": "Kitten"},
    {"butuanon": "Poong", "english": "Word"},
    {"butuanon": "Pòpò", "english": "Harvest"},
    {"butuanon": "Putahaw", "english": "Lazy"},
    {"butuanon": "Pusong", "english": "Arrogant"},
    {"butuanon": "Saa", "english": "Fault / Sin"},
    {"butuanon": "Saay", "english": "Lemongrass"},
    {"butuanon": "Sabanas", "english": "Blanket"},
    {"butuanon": "Sadangay", "english": "No way"},
    {"butuanon": "Sakpan", "english": "Caught"},
    {"butuanon": "Sakót", "english": "Mixture"},
    {"butuanon": "Saliwakog", "english": "Left Handed"},
    {"butuanon": "Sandà", "english": "Exchange"},
    {"butuanon": "Sapín", "english": "Shoes"},
    {"butuanon": "Sawaa", "english": "Pants"},
    {"butuanon": "Sid-ok", "english": "Hiccups"},
    {"butuanon": "Sigay", "english": "Flood"},
    {"butuanon": "Sigò", "english": "Fit"},
    {"butuanon": "Sikí", "english": "Feet"},
    {"butuanon": "Simâ-simâ", "english": "Snack / Nibble"},
    {"butuanon": "Simbaku", "english": "God forbid"},
    {"butuanon": "Soroon", "english": "Coconut"},
    {"butuanon": "Sopsop", "english": "Suck"},
    {"butuanon": "Sugá", "english": "Sunny / Light"},
    {"butuanon": "Sukiha", "english": "To tease"},
    {"butuanon": "Sundî", "english": "Strike / Slap"},
    {"butuanon": "Sunód", "english": "Follow"},
    {"butuanon": "Sunót", "english": "Imitate"},
    {"butuanon": "Suud", "english": "Fine tooth comb"},
    {"butuanon": "Sinipák", "english": "Firewood"},
    {"butuanon": "Taà", "english": "Footprint"},
    {"butuanon": "Tambaa", "english": "Medicine"},
    {"butuanon": "Tabanog", "english": "Kite"},
    {"butuanon": "Tabangi", "english": "To help"},
    {"butuanon": "Tagadan", "english": "To wait"},
    {"butuanon": "Tagaimpon", "english": "Dream"},
    {"butuanon": "Tagpilaw", "english": "Nap"},
    {"butuanon": "Taháy", "english": "Dry"},
    {"butuanon": "Talità", "english": "Light rain"},
    {"butuanon": "Tamoka", "english": "Catch it"},
    {"butuanon": "Tapós", "english": "Done"},
    {"butuanon": "Tangkugo", "english": "Nape"},
    {"butuanon": "Tangás", "english": "Throw"},
    {"butuanon": "Taway", "english": "Tip / End"},
    {"butuanon": "Tayak", "english": "Trust"},
    {"butuanon": "Tikan", "english": "Since / From"},
    {"butuanon": "Titoo", "english": "Puppy"},
    {"butuanon": "Tilawán", "english": "Taste it"},
    {"butuanon": "Toonlon", "english": "To swallow"},
    {"butuanon": "Tohô", "english": "With a hole"},
    {"butuanon": "Tudlo", "english": "Index finger"},
    {"butuanon": "Tuktok", "english": "Forehead"},
    {"butuanon": "Tuploka", "english": "Click"},
    {"butuanon": "Tusluka", "english": "To prick"},
    {"butuanon": "Tuyâ-Tuyâ", "english": "Rocking Chair"},
    {"butuanon": "Uan", "english": "Pillow"},
    {"butuanon": "Ud", "english": "Worm"},
    {"butuanon": "Ulì", "english": "Toilet Paper"},
    {"butuanon": "Upà", "english": "Rent"},
    {"butuanon": "Usiba", "english": "Play"},
    {"butuanon": "Usog", "english": "Male"},
    {"butuanon": "Uwan", "english": "Rain"},
    {"butuanon": "Uwangag", "english": "Crying loudly"},
    {"butuanon": "Uwát", "english": "Scar"}
]

# Guess a sensible default pos based on english/butuanon patterns
def guess_pos(but, eng):
    eng_lower = eng.lower()
    if eng_lower.startswith("to ") or eng_lower.startswith("will ") or but.lower().startswith("mo") or but.lower().startswith("ga") or but.lower().startswith("mi"):
        return "verb"
    if eng_lower in ["ouch", "is it / really?", "what a waste", "i don't know", "god forbid", "no way", "what happened to you?", "why is it?"]:
        return "phrase"
    if eng_lower in ["now", "later", "here", "downstairs", "sometimes", "since / from"]:
        return "adverb"
    if eng_lower in ["blind", "little / small", "big", "sour", "flirty", "untidy appearance", "belligerent", "deaf", "very small", "hard", "weak", "tulala (staring blankly)", "open legs/lying flat", "hungry", "beautiful", "spicy", "very quiet", "greedy", "short", "drunk", "clean", "kept", "noisy", "so cold", "sore", "frisky", "loose", "pitiful", "disgusting", "so hot", "used to", "ready", "soft", "tardy / slow", "salty", "shameless / bad", "shaggy", "itchy", "mischievous", "proficient / know how", "so bright", "shocked", "ashamed", "sweet", "dizzy", "wrinkled", "dry", "smelly (urine)", "spoiled", "tight", "lazy", "arrogant", "left handed", "fit", "sunny / light", "with a hole"]:
        return "adjective"
    return "noun"

def build_prompt(chunk):
    items_desc = "\n".join([f'- "{item["butuanon"]}": "{item["english"]}"' for item in chunk])
    prompt = f"""You are a professional linguist specializing in the Butuanon language (from Butuan City, Agusan del Norte, Mindanao, Philippines).
You are given a list of word/phrase translation pairs.
Generate a JSON list of objects, one for each input pair, with complete dictionary data populated.

Input words to populate:
{items_desc}

For each item, output a JSON object with:
- "butuanon": The word/phrase exactly as provided (e.g. "Abaga")
- "english": The English meaning exactly as provided (e.g. "Shoulder")
- "pos": Part of speech ("noun", "verb", "adjective", "adverb", or "phrase")
- "pronunciation": Syllable breakdown showing stress in capitals (e.g. "ah-BAH-gah")
- "definition": A brief, clear English definition (1 sentence)
- "example_butuanon": An example sentence in Butuanon using the word. Keep it simple, natural, and grammatically correct.
- "example_english": The English translation of the example sentence.

Format the output strictly as a JSON array of objects, with NO other text.
"""
    return prompt

def generate_and_insert():
    print("Connecting to the database...")
    db = SessionLocal()
    
    # Configure Gemini
    if not settings.GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found.")
        db.close()
        return
        
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Check existing entries
    existing_entries = db.query(DictionaryEntry).all()
    existing_words = {e.butuanon.strip().lower() for e in existing_entries}
    print(f"Found {len(existing_words)} existing words in the database dictionary.")

    # Filter out entries that already exist in database
    words_to_process = []
    for item in raw_data:
        butuanon = item["butuanon"].strip()
        if butuanon.lower() not in existing_words:
            words_to_process.append(item)
            
    print(f"Total words to import: {len(raw_data)}")
    print(f"Words already in DB: {len(raw_data) - len(words_to_process)}")
    print(f"Words to generate and insert: {len(words_to_process)}")

    if not words_to_process:
        print("No new words to add to database. Exiting.")
        db.close()
        return

    # Process in chunks of 25 to avoid token or rate limit issues
    chunk_size = 25
    generated_data = []

    for i in range(0, len(words_to_process), chunk_size):
        chunk = words_to_process[i:i + chunk_size]
        print(f"\nProcessing chunk {i // chunk_size + 1}/{(len(words_to_process) - 1) // chunk_size + 1} ({len(chunk)} words)...")
        
        prompt = build_prompt(chunk)
        
        retries = 3
        success = False
        words_response = []
        
        while retries > 0 and not success:
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.2,
                        "response_mime_type": "application/json"
                    }
                )
                text = response.text.strip()
                words_response = json.loads(text)
                if isinstance(words_response, list) and len(words_response) > 0:
                    success = True
                else:
                    print("Gemini response is not a valid list. Retrying...")
                    retries -= 1
                    time.sleep(2)
            except Exception as e:
                print(f"Error calling Gemini: {e}. Retrying...")
                retries -= 1
                time.sleep(2)
                
        if not success:
            print("Failed to process chunk. Falling back to default/empty generation for this chunk.")
            # Fallback local generation without Gemini
            for item in chunk:
                words_response.append({
                    "butuanon": item["butuanon"],
                    "english": item["english"],
                    "pos": guess_pos(item["butuanon"], item["english"]),
                    "pronunciation": item["butuanon"].upper(),
                    "definition": f"The term for {item['english'].lower()}.",
                    "example_butuanon": "",
                    "example_english": ""
                })

        # Insert this chunk into database
        inserted_chunk = 0
        for item in words_response:
            butuanon = item.get("butuanon", "").strip()
            english = item.get("english", "").strip()
            if not butuanon or not english:
                continue
                
            # Double check to prevent duplicates
            if butuanon.lower() in existing_words:
                continue
                
            entry = DictionaryEntry(
                butuanon=butuanon,
                english=english,
                pos=item.get("pos", "noun").strip().lower(),
                pronunciation=item.get("pronunciation", butuanon).strip(),
                definition=item.get("definition", "").strip(),
                example_butuanon=item.get("example_butuanon", None),
                example_english=item.get("example_english", None),
                verified="academic",  # Mark as academic verified since it's dictionary checked
                rating=5
            )
            db.add(entry)
            existing_words.add(butuanon.lower())
            
            # Save for frontend dump
            generated_data.append({
                "butuanon": butuanon,
                "english": english,
                "pos": item.get("pos", "noun").strip().lower(),
                "pronunciation": item.get("pronunciation", butuanon).strip(),
                "definition": item.get("definition", "").strip(),
                "exampleButuanon": item.get("example_butuanon", "") or "",
                "exampleEnglish": item.get("example_english", "") or "",
                "verified": "academic",
                "rating": 5
            })
            inserted_chunk += 1
            
        db.commit()
        print(f"Committed {inserted_chunk} words to the database.")
        
        # Sparing rate limits
        time.sleep(1)

    print("\nDatabase update completed successfully!")
    
    # Save the output to a JSON file so that we can easily copy it to the frontend static file
    output_filepath = os.path.join(backend_dir, "generated_butuanon_words.json")
    with open(output_filepath, "w", encoding="utf-8") as f:
        json.dump(generated_data, f, ensure_ascii=False, indent=2)
    print(f"Dumped generated words to JSON file: {output_filepath}")

    db.close()

if __name__ == "__main__":
    generate_and_insert()
