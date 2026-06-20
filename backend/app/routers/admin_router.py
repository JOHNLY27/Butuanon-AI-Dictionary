from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..models import DictionaryEntry, Contribution, User
from .auth_router import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

# Schemas for Admin Request Payloads
class ApproveContributionRequest(BaseModel):
    butuanon: str
    english: str
    pos: str
    pronunciation: str
    definition: str
    example_butuanon: Optional[str] = None
    example_english: Optional[str] = None
    verified: Optional[str] = "community"
    audio_url: Optional[str] = None

class CreateDictionaryRequest(BaseModel):
    butuanon: str
    english: str
    pos: str
    pronunciation: str
    definition: str
    example_butuanon: Optional[str] = None
    example_english: Optional[str] = None
    verified: Optional[str] = "native-speaker"
    rating: int = 0
    audio_url: Optional[str] = None

class UpdateDictionaryRequest(BaseModel):
    butuanon: str
    english: str
    pos: str
    pronunciation: str
    definition: str
    example_butuanon: Optional[str] = None
    example_english: Optional[str] = None
    verified: Optional[str] = None
    rating: int = 0
    audio_url: Optional[str] = None

# --- Contribution Endpoints ---

@router.get("/contributions", response_model=List[dict])
def list_contributions(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get all word contributions submitted by users.
    Sorted by pending status first, then by creation date.
    """
    contribs = db.query(Contribution).order_by(
        # Group pending contributions at the top
        Contribution.status.desc(), 
        Contribution.created_at.desc()
    ).all()

    return [
        {
            "id": c.id,
            "butuanon": c.butuanon,
            "english": c.english,
            "pos": c.pos,
            "pronunciation": c.pronunciation,
            "definition": c.definition,
            "example_butuanon": c.example_butuanon,
            "example_english": c.example_english,
            "audio_url": c.audio_url,
            "status": c.status,
            "created_at": c.created_at
        } for c in contribs
    ]

@router.post("/contributions/{id}/approve")
def approve_contribution(
    id: int,
    payload: ApproveContributionRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Approve a pending contribution. This moves/creates the entry 
    in the live dictionary database and changes the contribution status to approved.
    Allows live modification by the admin during approval.
    """
    contrib = db.query(Contribution).filter(Contribution.id == id).first()
    if not contrib:
        raise HTTPException(status_code=404, detail="Contribution not found.")
    
    if contrib.status != "pending":
         raise HTTPException(status_code=400, detail="Contribution has already been processed.")

    # 1. Create a new DictionaryEntry
    entry = DictionaryEntry(
        butuanon=payload.butuanon.strip(),
        english=payload.english.strip(),
        pos=payload.pos.strip(),
        pronunciation=payload.pronunciation.strip(),
        definition=payload.definition.strip(),
        example_butuanon=payload.example_butuanon.strip() if payload.example_butuanon else None,
        example_english=payload.example_english.strip() if payload.example_english else None,
        verified=payload.verified,
        rating=5, # Admin approved starts with a high rating
        audio_url=payload.audio_url
    )
    db.add(entry)

    # 2. Update Contribution status
    contrib.status = "approved"
    
    db.commit()
    db.refresh(entry)
    db.refresh(contrib)

    return {"message": "Contribution approved and published to the dictionary.", "entry_id": entry.id}

@router.post("/contributions/{id}/reject")
def reject_contribution(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Reject a pending contribution. Marks status as rejected.
    """
    contrib = db.query(Contribution).filter(Contribution.id == id).first()
    if not contrib:
        raise HTTPException(status_code=404, detail="Contribution not found.")

    if contrib.status != "pending":
         raise HTTPException(status_code=400, detail="Contribution has already been processed.")

    contrib.status = "rejected"
    db.commit()
    db.refresh(contrib)

    return {"message": "Contribution rejected successfully."}


# --- Dictionary Direct Management Endpoints (CRUD) ---

@router.post("/dictionary")
def create_dictionary_entry(
    payload: CreateDictionaryRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Directly insert a new verified entry into the dictionary.
    """
    entry = DictionaryEntry(
        butuanon=payload.butuanon.strip(),
        english=payload.english.strip(),
        pos=payload.pos.strip(),
        pronunciation=payload.pronunciation.strip(),
        definition=payload.definition.strip(),
        example_butuanon=payload.example_butuanon.strip() if payload.example_butuanon else None,
        example_english=payload.example_english.strip() if payload.example_english else None,
        verified=payload.verified,
        rating=payload.rating,
        audio_url=payload.audio_url
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Dictionary entry created successfully.", "id": entry.id}

@router.put("/dictionary/{id}")
def update_dictionary_entry(
    id: int,
    payload: UpdateDictionaryRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Directly update details of an existing dictionary entry.
    """
    entry = db.query(DictionaryEntry).filter(DictionaryEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Dictionary entry not found.")

    entry.butuanon = payload.butuanon.strip()
    entry.english = payload.english.strip()
    entry.pos = payload.pos.strip()
    entry.pronunciation = payload.pronunciation.strip()
    entry.definition = payload.definition.strip()
    entry.example_butuanon = payload.example_butuanon.strip() if payload.example_butuanon else None
    entry.example_english = payload.example_english.strip() if payload.example_english else None
    entry.verified = payload.verified
    entry.rating = payload.rating
    
    if payload.audio_url is not None:
        entry.audio_url = payload.audio_url

    db.commit()
    db.refresh(entry)
    return {"message": "Dictionary entry updated successfully.", "id": entry.id}

@router.delete("/dictionary/{id}")
def delete_dictionary_entry(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Directly remove an entry from the dictionary database.
    """
    entry = db.query(DictionaryEntry).filter(DictionaryEntry.id == id).first()
    if not entry:
         raise HTTPException(status_code=404, detail="Dictionary entry not found.")
         
    db.delete(entry)
    db.commit()
    return {"message": "Dictionary entry deleted successfully.", "id": id}
