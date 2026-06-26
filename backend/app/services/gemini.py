from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from ..config import settings
from ..models import DictionaryEntry
import re

# Configure Gemini SDK client
genai_client = None
if settings.GEMINI_API_KEY:
    genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

def get_translation_context(db: Session, text: str, direction: str) -> str:
    # Clean and split text to find candidate words
    words = re.findall(r'\b\w+\b', text.lower())
    
    related_entries = []
    if words:
        # Search dictionary database for matching words
        # Check both Butuanon and English dictionary fields
        from sqlalchemy import or_
        clauses = []
        for w in words:
            if len(w) > 2:
                clauses.append(DictionaryEntry.butuanon.ilike(f"%{w}%"))
                clauses.append(DictionaryEntry.english.ilike(f"%{w}%"))
        
        if clauses:
            try:
                related_entries = db.query(DictionaryEntry).filter(or_(*clauses)).limit(10).all()
            except Exception as e:
                print(f"Database query error during translation context lookup: {e}")
                related_entries = []
        
    # If query matched few words, fallback to general entries for formatting context
    if len(related_entries) < 3:
        try:
            fallbacks = db.query(DictionaryEntry).limit(6).all()
            for f in fallbacks:
                if f not in related_entries:
                    related_entries.append(f)
        except Exception as e:
            print(f"Database query error during fallback context lookup: {e}")
                
    context_lines = []
    for entry in related_entries:
        context_lines.append(
            f"Butuanon Word: {entry.butuanon} ({entry.pos}) | English Meaning: {entry.english}\n"
            f"Definition: {entry.definition}\n"
            f"Example (Butuanon): {entry.example_butuanon or 'None'}\n"
            f"Example (English): {entry.example_english or 'None'}\n"
            f"------------------------------------------------"
        )
    return "\n".join(context_lines)


def db_dictionary_lookup(db: Session, text: str, direction: str) -> str:
    cleaned = text.strip().lower()
    if not cleaned:
        return ""
    
    # Try exact matches first
    if direction == "but-en":
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(cleaned)).first()
        if entry:
            return entry.english
    else:
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.english.ilike(cleaned)).first()
        if entry:
            return entry.butuanon

    # Multi-word phrase replacements
    if direction == "en-but":
        # Phrase level mappings
        cleaned = re.sub(r'\bgood\s+morning\b', 'madiyaw nga hinaat', cleaned)
        cleaned = re.sub(r'\bgood\s+evening\b', 'madiyaw nga duum', cleaned)
        cleaned = re.sub(r'\bgood\s+night\b', 'madiyaw nga duum', cleaned)
        cleaned = re.sub(r'\bgood\s+afternoon\b', 'madiyaw nga hapun', cleaned)
        cleaned = re.sub(r'\bgood\s+noon\b', 'madiyaw nga udto', cleaned)
        cleaned = re.sub(r'\bto\s+the\b', 'hong', cleaned)
        cleaned = re.sub(r'\bof\s+the\b', 'hong', cleaned)
        cleaned = re.sub(r'\bin\s+the\b', 'hong', cleaned)
        cleaned = re.sub(r'\bby\s+the\b', 'hong', cleaned)
        cleaned = re.sub(r'\bto\b', 'hong', cleaned)
        cleaned = re.sub(r'\bof\b', 'hong', cleaned)
        cleaned = re.sub(r'\bin\b', 'hong', cleaned)
        cleaned = re.sub(r'\bby\b', 'hong', cleaned)
    else:
        # Phrase level mappings for but-en
        cleaned = re.sub(r'\bmadiyaw\s+nga\s+hinaat\b', 'good morning', cleaned)
        cleaned = re.sub(r'\bmadiyaw\s+nga\s+duum\b', 'good evening', cleaned)
        cleaned = re.sub(r'\bmadiyaw\s+nga\s+hapun\b', 'good afternoon', cleaned)
        cleaned = re.sub(r'\bmadiyaw\s+nga\s+udto\b', 'good noon', cleaned)
        cleaned = re.sub(r'\bhong\b', 'to', cleaned)
        cleaned = re.sub(r'\bsinda\b', 'they', cleaned)

    # Split into words/tokens
    words = re.findall(r'\b\w+\b', cleaned)
    if not words:
        return text

    # Read all entries from database once for speed
    try:
        all_entries = db.query(DictionaryEntry).all()
    except Exception as e:
        print(f"Database query error during fallback dictionary lookup: {e}")
        all_entries = []

    
    EN_TO_BUT_MAP = {
        "friend": "kaiban", "friends": "kaiban",
        "hand": "alima", "hands": "alima",
        "child": "buntanak", "children": "buntanak",
        "has": "yaoy", "have": "yaoy", "had": "yaoy",
        "the": "ang", "no": "dii", "not": "dii",
        "tomorrow": "kunum", "yesterday": "kabi-i", "now": "kuman",
        "where": "hari", "who": "sin-o", "what": "uno",
        "how": "in-uno", "why": "ngano", "when": "kun-o",
        "many": "maday-a", "much": "maday-a",
        "big": "aslag", "large": "aslag",
        "small": "ti-ad", "little": "ti-ad",
        "good": "madiyaw", "nice": "madiyaw", "beautiful": "madiyaw",
        "bad": "laat", "evil": "laat",
        "sad": "susah", "happy": "kulaag", "joyful": "kulaag",
        "water": "tubig", "give": "hatag",
        "house": "balay", "home": "balay",
        "tree": "kahoy", "wood": "kahoy",
        "city": "lungsod", "town": "lungsod",
        "family": "pamilya", "person": "tawo", "people": "tawo",
        "sun": "suwang", "he": "siya", "she": "siya", "it": "siya",
        "we": "kita", "they": "sila", "you": "ikaw",
        "go": "kadto", "going": "kadto", "went": "kadto",
        "walk": "panaw", "walking": "panaw", "walked": "panaw",
        "sleep": "tuyog", "sleeping": "tuyog", "slept": "tuyog",
        "new": "bahaqu", "road": "daan", "path": "daan", "street": "daan",
        "earth": "daga", "soil": "daga", "land": "daga",
        "buy": "bili", "buying": "bili", "bought": "bili",
        "climb": "daag", "climbing": "daag", "climbed": "daag",
        "here": "disani", "study": "anad", "studying": "anad", "studied": "anad",
        "this": "ini", "that": "iyan", "vehicle": "sasakyan", "car": "sasakyan",
        "door": "lawang", "bathroom": "kabil", "i": "ako", "me": "ako"
    }

    BUT_TO_EN_MAP = {
        "kaiban": "friend", "alima": "hand", "buntanak": "child",
        "yaoy": "has", "ang": "the", "dii": "no",
        "kunum": "tomorrow", "kabi-i": "yesterday", "kuman": "now",
        "hari": "where", "sin-o": "who", "uno": "what",
        "in-uno": "how", "ngano": "why", "kun-o": "when",
        "maday-a": "many", "aslag": "big", "ti-ad": "small",
        "madiyaw": "good", "laat": "bad", "susah": "sad",
        "kulaag": "happy", "tubig": "water", "hatag": "give",
        "balay": "house", "kahoy": "tree", "lungsod": "city",
        "pamilya": "family", "tawo": "person", "suwang": "sun",
        "siya": "he/she/it", "kita": "we", "sila": "they", "ikaw": "you",
        "kadto": "go", "panaw": "walk", "tuyog": "sleep",
        "bahaqu": "new", "daan": "road/old", "daga": "land/earth/ground",
        "bili": "buy", "daag": "climb", "disani": "here", "anad": "study",
        "ini": "this", "iyan": "that", "sasakyan": "vehicle/car",
        "lawang": "door", "kabil": "bathroom", "ako": "I/me"
    }

    ENGLISH_STOP_WORDS = {
        "a", "an", "and", "is", "are", "am", "was", "were", 
        "been", "be", "at", "for", "with", "as", "do", "does", "did",
        "will", "shall", "should", "would", "could", "can", "may", "might", "must",
        "to", "of", "in", "by", "on", "at", "from"
    }

    def get_candidates(w: str) -> list[str]:
        candidates = [w]
        if w.endswith("ies"):
            candidates.append(w[:-3] + "y")
        if w.endswith("es"):
            candidates.append(w[:-2])
        if w.endswith("s") and len(w) > 1:
            candidates.append(w[:-1])
        if w.endswith("ing"):
            candidates.append(w[:-3])
            candidates.append(w[:-3] + "e")
        if w.endswith("ed"):
            candidates.append(w[:-2])
            candidates.append(w[:-1])
        seen = set()
        res = []
        for c in candidates:
            if c and c not in seen:
                seen.add(c)
                res.append(c)
        return res

    translated = []
    for w in words:
        if direction == "but-en":
            # Check BUT_TO_EN_MAP first
            if w in BUT_TO_EN_MAP:
                translated.append(BUT_TO_EN_MAP[w])
                continue
            
            # Try to match word in DB
            match = next((e for e in all_entries if e.butuanon.strip().lower() == w), None)
            if match:
                meanings = re.split(r'[;,\/]', match.english)
                translated.append(meanings[0].strip())
            else:
                translated.append(w)
        else:
            # Skip English stop words
            if w in ENGLISH_STOP_WORDS:
                continue
                
            # Check EN_TO_BUT_MAP (and try candidates)
            candidates = get_candidates(w)
            found = False
            for cand in candidates:
                if cand in EN_TO_BUT_MAP:
                    translated.append(EN_TO_BUT_MAP[cand])
                    found = True
                    break
            if found:
                continue
                
            # Match in database
            match = None
            # Try each candidate base word
            for cand in candidates:
                for e in all_entries:
                    meanings = [m.strip().lower() for m in re.split(r'[;,\/]', e.english)]
                    if cand in meanings:
                        match = e
                        break
                if match:
                    break
                    
            if match:
                translated.append(match.butuanon)
            else:
                # Try boundary match fallback on cand
                for cand in candidates:
                    for e in all_entries:
                        if re.search(rf'\b{cand}\b', e.english.lower()):
                            match = e
                            break
                    if match:
                        break
                if match:
                    translated.append(match.butuanon)
                else:
                    translated.append(w)
                    
    # capitalize first letter of the result for nice output
    if translated:
        res_str = " ".join(translated)
        if len(res_str) > 0:
            return res_str[0].upper() + res_str[1:]
        return res_str
    return text

def translate_text(db: Session, text: str, direction: str) -> str:
    cleaned = text.strip()
    if cleaned:
        # Check if the text matches exactly in the dictionary database (highest priority)
        try:
            if direction == "but-en":
                exact = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(cleaned)).first()
                if exact:
                    return exact.english
            else:
                exact = db.query(DictionaryEntry).filter(DictionaryEntry.english.ilike(cleaned)).first()
                if exact:
                    return exact.butuanon
                
                # Check if it matches any split meanings (e.g. if database is "Carabao / Cow" and input is "carabao")
                all_entries = db.query(DictionaryEntry).all()
                for entry in all_entries:
                    meanings = [m.strip().lower() for m in re.split(r'[;,\/]', entry.english)]
                    if cleaned.lower() in meanings:
                        return entry.butuanon
        except Exception as e:
            print(f"Database query error during early exact match lookup: {e}")

    # Try using Gemini first if client is available
    if genai_client:
        try:
            context = get_translation_context(db, text, direction)
            
            src = "Butuanon" if direction == "but-en" else "English"
            dest = "English" if direction == "but-en" else "Butuanon"
            
            prompt = f"""You are a professional linguist specializing in Butuanon, an Austronesian language spoken in Butuan City, Agusan del Norte, Mindanao, Philippines.
Your task is to translate sentences between Butuanon and English.

CRITICAL INSTRUCTION FOR BUTUANON TRANSLATION:
Butuanon is NOT Cebuano (Bisaya). It is a Southern Bisayan language closely related to Tausug. You must strictly avoid Cebuano words and markers.

Contrast Guidelines (MUST use Butuanon instead of Cebuano):
- DO NOT use "buntag" (morning). Use "hinaat" or "hinaqat".
- DO NOT use "gabii" (night/evening). Use "duum".
- DO NOT use "dako" (big). Use "aslag".
- DO NOT use "kamot" (hand). Use "alima".
- DO NOT use "bata" (child). Use "buntanak".
- DO NOT use "dili" (no/not). Use "dii".
- DO NOT use "karon" (now). Use "kuman".
- DO NOT use "ugma" (tomorrow). Use "kunum".
- DO NOT use "kagahapon" (yesterday). Use "kabi-i".
- DO NOT use "yuta" (earth/land). Use "daga".
- DO NOT use "asa" (where). Use "hari" (present/future) or "diin" (past).
- DO NOT use "unsa" (what). Use "uno".
- DO NOT use "kinsa" (who). Use "sin-o" or "hino".
- DO NOT use "kanus-a" (when). Use "kun-o".
- DO NOT use "giunsa" (how). Use "in-uno".
- DO NOT use "daghan" (many). Use "maday-a".
- DO NOT use "gamay" (small/little). Use "ti-ad".
- DO NOT use "palit" (buy). Use "bili".
- DO NOT use "saka" (climb). Use "daag".
- DO NOT use "lakaw" (walk/go). Use "panaw" or "kadto".
- DO NOT use "tulog" (sleep). Use "tuyog".
- DO NOT use "bag-o" (new). Use "bahaqu".
- DO NOT use "dalan" (road). Use "daan".
- DO NOT use "higala" (friend). Use "kaiban" or "amigo".
- DO NOT use "nindot" (beautiful/good). Use "madiyaw".
- DO NOT use "wala" / "wa" (none/not/negation). Use "waay" or "kone".
- DO NOT use "naa" / "aduna" (have/exists). Use "yaoy".
- DO NOT use "dinhi" (here). Use "disani".
- DO NOT use "tuon" (study). Use "anad".

Grammatical Marker Guidelines:
- DO NOT use Cebuano marker "sa" to indicate non-topic agents, genitive/oblique linkages (of, to, by, in). You MUST use the Butuanon non-topic marker "hong" (or "ong") instead.
  * Cebuano: "balay sa akong ginikanan" -> Butuanon: "balay hong akong ginikanan"
  * Cebuano: "kaon sa isda" -> Butuanon: "kaon hong isda"
  * Cebuano: "sa buntag" -> Butuanon: "hong hinaat"
  * Cebuano: "sa duum" -> Butuanon: "hong duum"
- DO NOT use Cebuano topic marker "sila" or "sila si" for plural personal names. Use Butuanon plural personal marker "sinda".

Here is a verified dictionary context containing words and examples that appear in or relate to the text. Use these exact definitions and example syntaxes to form your translation:
================================================
{context}
================================================

Text to translate from {src} to {dest}:
"{text}"

Translation Guidelines:
1. Translate accurately. Return ONLY the final translated sentence string.
2. DO NOT include any introductions ("Here is your translation:"), explanations, formatting, markdown bold/quotes, or warnings. Return the raw string only.
"""
            response = genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                )
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error during Gemini Translation: {e}. Falling back to database dictionary lookup.")
            
    # Fallback: DB Dictionary lookup
    return db_dictionary_lookup(db, text, direction)


from pydantic import BaseModel

class PronunciationResult(BaseModel):
    score: int
    isCorrect: bool
    feedback: str
    transcript: str

def evaluate_pronunciation(audio_bytes: bytes, mime_type: str, word: str) -> dict:
    """
    Evaluates the pronunciation of a Butuanon word from user audio bytes using Gemini.
    """
    if not genai_client:
        return {
            "score": 0,
            "isCorrect": False,
            "feedback": "Gemini API client is not configured on this server.",
            "transcript": ""
        }
    
    try:
        prompt = f"""You are a professional linguist and native speaker of Butuanon (a Southern Bisayan language spoken in Butuan City, Mindanao, Philippines).
Analyze the user's recorded audio pronunciation of the target Butuanon word: "{word}".

Instructions:
1. Listen carefully to the recorded audio.
2. Transcribe what you heard the user say as `transcript`.
3. Evaluate the correctness of their pronunciation compared to the correct Butuanon pronunciation of "{word}".
4. Assign a `score` from 0 to 100 based on phonological accuracy (correct vowels, consonant sounds, and syllable stress).
5. Set `isCorrect` to true if the score is 75 or higher; otherwise set it to false.
6. Provide concise, friendly, and constructive feedback in English (max 2-3 sentences) detailing what they pronounced well and how they can improve. If the audio is silent or unintelligible, give a score of 0 and note this in the feedback.
"""
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type=mime_type
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PronunciationResult,
                temperature=0.2
            )
        )
        
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"Error during Gemini pronunciation check: {e}")
        return {
            "score": 0,
            "isCorrect": False,
            "feedback": f"Could not analyze pronunciation. Error: {str(e)}",
            "transcript": ""
        }

