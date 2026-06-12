from supabase import create_client, Client
from ..config import settings
import uuid

# Initialize client
supabase_client: Client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase Client: {e}")

def upload_audio_to_supabase(file_bytes: bytes, original_filename: str) -> str:
    """
    Uploads audio binary data into the 'pronunciations' bucket on Supabase Storage.
    Returns the public HTTP URL of the file, or an empty string on error.
    """
    if not supabase_client:
        print("Supabase URL and API Key are missing. Skipping upload.")
        return ""

    # Ensure files have unique names to prevent collision
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    bucket_name = "pronunciations"

    try:
        # Perform upload
        res = supabase_client.storage.from_(bucket_name).upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": "audio/webm"}
        )
        
        # Retrieve the public url for web playback
        public_url = supabase_client.storage.from_(bucket_name).get_public_url(unique_filename)
        return public_url
    except Exception as e:
        print(f"Supabase Storage Upload Failure: {e}")
        return ""
