import sys
import os

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.services.gemini import translate_text

test_cases = [
    {
        "text": "Good morning, friend.",
        "direction": "en-but",
        "must_have": ["madiyaw", "hinaat"],
        "must_not_have": ["maayong", "buntag", "higala"]
    },
    {
        "text": "The child has big hands.",
        "direction": "en-but",
        "must_have": ["buntanak", "aslag", "alima"],
        "must_not_have": ["bata", "dako", "kamot"]
    },
    {
        "text": "Where are you going tomorrow?",
        "direction": "en-but",
        "must_have": ["hari", "kunum"],
        "must_not_have": ["asa", "ugma"]
    },
    {
        "text": "No, I will not go.",
        "direction": "en-but",
        "must_have": ["dii"],
        "must_not_have": ["dili"]
    },
    {
        "text": "Give the water to the child.",
        "direction": "en-but",
        "must_have": ["hong"],
        "must_not_have": ["sa bata", "sa buntanak"]
    }
]

import time

def run_tests():
    db = SessionLocal()
    try:
        print("Starting AI Translation Verification...\n")
        all_passed = True
        
        for idx, tc in enumerate(test_cases, 1):
            if idx > 1:
                print("Sleeping 5 seconds to avoid API RPM limit...")
                time.sleep(5)
            print(f"Test Case {idx}: Translating '{tc['text']}' ({tc['direction']})")
            translated = translate_text(db, tc["text"], tc["direction"])
            print(f"Result: '{translated}'")
            
            passed = True
            failed_reasons = []
            
            # Check must-have terms (case-insensitive)
            for term in tc["must_have"]:
                if term.lower() not in translated.lower():
                    passed = False
                    failed_reasons.append(f"Missing expected Butuanon term: '{term}'")
                    
            # Check must-not-have terms (case-insensitive)
            for term in tc["must_not_have"]:
                if term.lower() in translated.lower():
                    passed = False
                    failed_reasons.append(f"Found forbidden Cebuano/incorrect term: '{term}'")
            
            if passed:
                print("Status: PASSED\n")
            else:
                all_passed = False
                print("Status: FAILED")
                for reason in failed_reasons:
                    print(f"  - {reason}")
                print()
                
        if all_passed:
            print("All test cases PASSED! The translation is accurate Butuanon.")
            sys.exit(0)
        else:
            print("Some test cases FAILED. Please check prompt instructions or database context.")
            sys.exit(1)
            
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
