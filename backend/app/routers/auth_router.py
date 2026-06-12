from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import User
from ..config import settings
from ..services.auth import verify_google_token, create_session_token, verify_session_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class GoogleLoginRequest(BaseModel):
    credential: str

class XpUpdateRequest(BaseModel):
    points: int

# Helper to verify token from Authorization header
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token header."
        )
    
    token = authorization.split(" ")[1]
    payload = verify_session_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please log in again."
        )
        
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
    return user

@router.post("/google")
async def google_auth(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    # 1. Verify token with Google
    token_info = await verify_google_token(request.credential)
    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google credentials token."
        )
        
    google_id = token_info.get("sub")
    email = token_info.get("email")
    name = token_info.get("name", email.split("@")[0] if email else "Guest")
    profile_pic = token_info.get("picture")
    
    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google profile is missing unique identifying attributes."
        )

    # 2. Check if user already exists
    user = db.query(User).filter(User.google_id == google_id).first()
    
    if not user:
        # Check if email is already taken
        existing_email_user = db.query(User).filter(User.email == email).first()
        if existing_email_user:
            # Connect Google ID to existing email
            user = existing_email_user
            user.google_id = google_id
            if profile_pic:
                user.profile_pic = profile_pic
        else:
            # Register new user
            user = User(
                google_id=google_id,
                username=name,
                email=email,
                profile_pic=profile_pic,
                xp_points=0
            )
            db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update profile pic if changed
        if profile_pic and user.profile_pic != profile_pic:
            user.profile_pic = profile_pic
            db.commit()
            db.refresh(user)

    # 3. Issue session token
    token = create_session_token({
        "user_id": user.id,
        "email": user.email,
        "username": user.username
    })

    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "xp_points": user.xp_points
        }
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_pic": user.profile_pic,
        "xp_points": user.xp_points
    }

@router.post("/xp")
def add_xp(request: XpUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if request.points <= 0:
         raise HTTPException(status_code=400, detail="Points value must be positive.")
         
    user.xp_points += request.points
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "username": user.username,
        "xp_points": user.xp_points
    }

@router.get("/config")
def get_auth_config():
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID or "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"
    }
