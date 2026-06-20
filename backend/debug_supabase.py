import traceback, os
from dotenv import load_dotenv
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

from supabase import create_client
try:
    client = create_client(url, key)
    print(f"SUCCESS: Supabase client created (type: {type(client).__name__})")
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()
