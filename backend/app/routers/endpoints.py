from fastapi import APIRouter, Depends, Query, Form, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
import random
from ..database import get_db
from ..models import DictionaryEntry, Contribution
from ..services.gemini import translate_text
from ..services.storage import upload_audio_to_supabase
from pydantic import BaseModel

router = APIRouter(prefix="/api")

# Pydantic Schemas for validation
class TranslationRequest(BaseModel):
    text: str
    direction: str  # 'but-en' or 'en-but'

class TranslationResponse(BaseModel):
    sourceText: str
    result: str
    direction: str

class DictionaryItem(BaseModel):
    id: int
    butuanon: str
    english: str
    pos: str
    pronunciation: str
    definition: str
    exampleButuanon: Optional[str] = None
    exampleEnglish: Optional[str] = None
    verified: Optional[str] = None
    rating: int = 0
    audio: Optional[str] = None

    class Config:
        from_attributes = True

# 1. Search / Fetch Dictionary List
@router.get("/dictionary", response_model=List[DictionaryItem])
def get_dictionary(
    q: Optional[str] = Query(None),
    letter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Fetch all entries from database
    entries_query = db.query(DictionaryEntry)
    
    # Also fetch all pending user contributions to merge into the dictionary list (labeled as pending review)
    contributions_query = db.query(Contribution).filter(Contribution.status == "pending")

    entries = entries_query.all()
    contribs = contributions_query.all()

    # Map database entries to matches
    all_items = []
    
    # Map pending contributions
    for c in contribs:
        all_items.append(DictionaryItem(
            id=c.id + 10000, # Offset ID to prevent collision with actual entries
            butuanon=c.butuanon,
            english=c.english,
            pos=c.pos,
            pronunciation=c.pronunciation,
            definition=c.definition,
            exampleButuanon=c.example_butuanon,
            exampleEnglish=c.example_english,
            verified="pending",
            rating=0,
            audio=c.audio_url
        ))

    # Map verified dictionary items
    for e in entries:
        all_items.append(DictionaryItem(
            id=e.id,
            butuanon=e.butuanon,
            english=e.english,
            pos=e.pos,
            pronunciation=e.pronunciation,
            definition=e.definition,
            exampleButuanon=e.example_butuanon,
            exampleEnglish=e.example_english,
            verified=e.verified,
            rating=e.rating,
            audio=e.audio_url
        ))

    # Apply search filtering in memory
    filtered = all_items
    if q:
        query_str = q.lower().strip()
        filtered = [
            item for item in filtered 
            if query_str in item.butuanon.lower() or query_str in item.english.lower()
        ]
        
    if letter:
        let_str = letter.upper().strip()
        filtered = [
            item for item in filtered 
            if item.butuanon.upper().startswith(let_str)
        ]

    return filtered

# 2. Submit Word Suggestion
@router.post("/suggest")
async def suggest_word(
    butuanon: str = Form(...),
    english: str = Form(...),
    pos: str = Form(...),
    pronunciation: str = Form(...),
    definition: str = Form(...),
    exampleButuanon: Optional[str] = Form(None),
    exampleEnglish: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    audio_url = None
    if audio:
        try:
            file_bytes = await audio.read()
            # Upload to Supabase Storage Bucket
            audio_url = upload_audio_to_supabase(file_bytes, audio.filename or "pronunciation.webm")
        except Exception as e:
            print(f"Failed handling audio upload: {e}")

    # Create new contribution record
    new_contrib = Contribution(
        butuanon=butuanon.strip(),
        english=english.strip(),
        pos=pos.strip(),
        pronunciation=pronunciation.strip(),
        definition=definition.strip(),
        example_butuanon=exampleButuanon.strip() if exampleButuanon else None,
        example_english=exampleEnglish.strip() if exampleEnglish else None,
        audio_url=audio_url,
        status="pending"
    )

    db.add(new_contrib)
    db.commit()
    db.refresh(new_contrib)

    return {"message": "Contribution submitted successfully", "id": new_contrib.id}

# 3. AI Translation (RAG + Gemini)
@router.post("/translate", response_model=TranslationResponse)
def translate(request: TranslationRequest, db: Session = Depends(get_db)):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    result = translate_text(db, request.text, request.direction)
    return TranslationResponse(
        sourceText=request.text,
        result=result,
        direction=request.direction
    )

# 4. Dynamic Quiz Question Generator
class QuizQuestion(BaseModel):
    butuanonWord: str
    correctAnswer: str
    options: List[str]
    type: str  # 'but-en' or 'en-but'
    prompt: str

@router.get("/quiz", response_model=List[QuizQuestion])
def get_quiz(
    rank: int = Query(0),
    db: Session = Depends(get_db)
):
    entries = db.query(DictionaryEntry).all()
    min_required_entries = 5 if rank >= 7 else 4
    if len(entries) < min_required_entries:
        raise HTTPException(status_code=400, detail="Not enough entries in dictionary to generate a quiz")

    # Generate 10 questions
    random_entries = random.sample(entries, min(10, len(entries)))
    questions = []

    for entry in random_entries:
        quiz_type = "but-en" if random.random() > 0.5 else "en-but"
        correct_answer = entry.english if quiz_type == "but-en" else entry.butuanon

        # Select unique distractors that don't match the correct answer
        correct_norm = correct_answer.strip().lower()
        candidate_distractors = []
        for e in entries:
            val = e.english if quiz_type == "but-en" else e.butuanon
            if val.strip().lower() != correct_norm:
                candidate_distractors.append(val.strip())
        
        # Deduplicate candidates case-insensitively
        seen = set()
        unique_candidates = []
        for c in candidate_distractors:
            c_norm = c.lower()
            if c_norm not in seen:
                seen.add(c_norm)
                unique_candidates.append(c)

        # Scale options based on rank (level)
        num_distractors = 4 if rank >= 7 else 3
        distractors = random.sample(unique_candidates, min(num_distractors, len(unique_candidates)))

        options = [correct_answer] + distractors
        random.shuffle(options)

        prompt = (
            f'What is the English meaning of the Butuanon word "{entry.butuanon}"?'
            if quiz_type == "but-en"
            else f'What is the Butuanon word for the English term "{entry.english}"?'
        )

        questions.append(QuizQuestion(
            butuanonWord=entry.butuanon,
            correctAnswer=correct_answer,
            options=options,
            type=quiz_type,
            prompt=prompt
        ))

    return questions
