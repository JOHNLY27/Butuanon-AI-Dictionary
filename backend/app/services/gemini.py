import google.generativeai as genai
from sqlalchemy.orm import Session
from ..config import settings
from ..models import DictionaryEntry
import re

# Configure Gemini SDK
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

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
            related_entries = db.query(DictionaryEntry).filter(or_(*clauses)).limit(10).all()
        
    # If query matched few words, fallback to general entries for formatting context
    if len(related_entries) < 3:
        fallbacks = db.query(DictionaryEntry).limit(6).all()
        for f in fallbacks:
            if f not in related_entries:
                related_entries.append(f)
                
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
    
    # Try exact match first
    if direction == "but-en":
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(cleaned)).first()
        if entry:
            return entry.english
    else:
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.english.ilike(cleaned)).first()
        if entry:
            return entry.butuanon

    # Try matching common substrings/phrases in dictionary
    if direction == "but-en":
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(f"%{cleaned}%")).first()
        if entry:
            return entry.english
    else:
        entry = db.query(DictionaryEntry).filter(DictionaryEntry.english.ilike(f"%{cleaned}%")).first()
        if entry:
            return entry.butuanon

    # Split into words and try word-by-word translation as a backup
    words = re.findall(r'\b\w+\b', cleaned)
    if not words:
        return text
        
    translated = []
    for w in words:
        if direction == "but-en":
            entry = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(w)).first()
            if entry:
                meanings = re.split(r'[;,\/]', entry.english)
                translated.append(meanings[0].strip())
            else:
                translated.append(w)
        else:
            entry = db.query(DictionaryEntry).filter(DictionaryEntry.english.ilike(f"%{w}%")).first()
            if entry:
                translated.append(entry.butuanon)
            else:
                translated.append(w)
                
    return " ".join(translated)

def translate_text(db: Session, text: str, direction: str) -> str:
    # Try using Gemini first if key is present
    if settings.GEMINI_API_KEY:
        try:
            context = get_translation_context(db, text, direction)
            
            # Configure Gemini 2.5 Flash
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                generation_config={
                    "temperature": 0.2, # low temperature for strict factual translation
                }
            )
            
            src = "Butuanon" if direction == "but-en" else "English"
            dest = "English" if direction == "but-en" else "Butuanon"
            
            prompt = f"""You are a professional linguist specializing in Butuanon, an Austronesian language spoken in Butuan City, Agusan del Norte, Mindanao, Philippines.
Your task is to translate sentences between Butuanon and English.

Here is a verified dictionary context containing words and examples that appear in or relate to the text. Use these exact definitions and example syntaxes to form your translation:
================================================
{context}
================================================

Text to translate from {src} to {dest}:
"{text}"

Translation Guidelines:
1. Translate accurately. If a word is not present in the dictionary above, apply logical grammatical endings standard in Bisayan/Butuanon language morphology.
2. Return ONLY the final translated sentence string.
3. DO NOT include any introductions ("Here is your translation:"), explanations, or warnings.
"""
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error during Gemini Translation: {e}. Falling back to database dictionary lookup.")
            
    # Fallback: DB Dictionary lookup
    return db_dictionary_lookup(db, text, direction)
