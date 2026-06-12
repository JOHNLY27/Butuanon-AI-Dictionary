from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class DictionaryEntry(Base):
    __tablename__ = "dictionary"

    id = Column(Integer, primary_key=True, index=True)
    butuanon = Column(String(255), nullable=False)
    english = Column(String(255), nullable=False)
    pos = Column(String(50), nullable=False)
    pronunciation = Column(String(255), nullable=False)
    definition = Column(Text, nullable=False)
    example_butuanon = Column(String(500), nullable=True)
    example_english = Column(String(500), nullable=True)
    verified = Column(String(50), nullable=True)  # 'native-speaker', 'academic', 'community', or None
    rating = Column(Integer, default=0)
    audio_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    butuanon = Column(String(255), nullable=False)
    english = Column(String(255), nullable=False)
    pos = Column(String(50), nullable=False)
    pronunciation = Column(String(255), nullable=False)
    definition = Column(Text, nullable=False)
    example_butuanon = Column(String(500), nullable=True)
    example_english = Column(String(500), nullable=True)
    audio_url = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    profile_pic = Column(String(500), nullable=True)
    xp_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

