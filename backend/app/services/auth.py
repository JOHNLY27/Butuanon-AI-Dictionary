import hmac
import hashlib
import json
import base64
import time
import httpx
from typing import Optional, Dict, Any
from ..config import settings

SECRET_KEY = settings.GEMINI_API_KEY or "butuanon_dictionary_fallback_key_2026"

def create_session_token(payload_data: Dict[str, Any], expires_in: int = 86400 * 30) -> str:
    """
    Creates a signed session token (payload + signature) without external JWT dependencies.
    """
    payload = dict(payload_data)
    payload["exp"] = int(time.time()) + expires_in
    
    # Base64 encode the payload
    serialized_payload = json.dumps(payload).encode("utf-8")
    encoded_payload = base64.b64encode(serialized_payload).decode("utf-8")
    
    # Sign the payload using HMAC-SHA256
    sig = hmac.new(
        SECRET_KEY.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return f"{encoded_payload}.{sig}"

def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies the signature and expiration of a session token. Returns payload if valid.
    """
    try:
        if "." not in token:
            return None
            
        encoded_payload, signature = token.split(".", 1)
        
        # Verify HMAC signature
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"),
            encoded_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return None
            
        # Decode and load payload JSON
        decoded_payload_bytes = base64.b64decode(encoded_payload.encode("utf-8"))
        payload = json.loads(decoded_payload_bytes.decode("utf-8"))
        
        # Check expiration time
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

async def verify_google_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies Google ID Token via Google's secure tokeninfo service.
    """
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                # Verify that the token was issued by Google
                if data.get("iss") in ["accounts.google.com", "https://accounts.google.com"]:
                    return data
    except Exception as e:
        print(f"Error during Google token validation query: {e}")
    return None
