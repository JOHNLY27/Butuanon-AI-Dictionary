import sys
import os

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import DictionaryEntry

updates = [
    {
        "old_butuanon": "Buntag",
        "new_butuanon": "Hinaat",
        "pronunciation": "hee-nah-AT",
        "definition": "The period of time from sunrise to noon.",
        "example_butuanon": "Madiyaw ang hinaat disani sa Butuan.",
        "example_english": "The morning is beautiful here in Butuan."
    },
    {
        "old_butuanon": "Maayong buntag",
        "new_butuanon": "Madiyaw nga hinaat",
        "pronunciation": "mah-dee-YAWNG hee-nah-AT",
        "definition": "A greeting used in the morning hours, expressing good wishes.",
        "example_butuanon": "Madiyaw nga hinaat, kaiban! Kumusta ka?",
        "example_english": "Good morning, friend! How are you?"
    },
    {
        "old_butuanon": "MAAYONG GABII",
        "new_butuanon": "Madiyaw nga duum",
        "pronunciation": "mah-dee-YAWNG doo-OOM",
        "definition": "A greeting used in the evening or night hours.",
        "example_butuanon": "Madiyaw nga duum sa tanan.",
        "example_english": "Good evening to everyone."
    },
    {
        "old_butuanon": "Maayong gabii",
        "new_butuanon": "Madiyaw nga duum",
        "pronunciation": "mah-dee-YAWNG doo-OOM",
        "definition": "A greeting used in the evening or night hours.",
        "example_butuanon": "Madiyaw nga duum sa tanan.",
        "example_english": "Good evening to everyone."
    },
    {
        "old_butuanon": "MAAYONG GABI-I",
        "new_butuanon": "Madiyaw nga duum",
        "pronunciation": "mah-dee-YAWNG doo-OOM",
        "definition": "A greeting used in the evening or night hours.",
        "example_butuanon": "Madiyaw nga duum kanimo.",
        "example_english": "Good night to you."
    },
    {
        "old_butuanon": "Maayong hapon",
        "new_butuanon": "Madiyaw nga hapun",
        "pronunciation": "mah-dee-YAWNG hah-POON",
        "definition": "A greeting used in the afternoon hours.",
        "example_butuanon": "Madiyaw nga hapun sa inyo.",
        "example_english": "Good afternoon to you all."
    },
    {
        "old_butuanon": "MAAYONG UDTO",
        "new_butuanon": "Madiyaw nga udto",
        "pronunciation": "mah-dee-YAWNG ood-TOH",
        "definition": "A greeting used at noon/midday.",
        "example_butuanon": "Madiyaw nga udto sa tanan.",
        "example_english": "Good noon to everyone."
    },
    {
        "old_butuanon": "Gabii",
        "new_butuanon": "Duum",
        "pronunciation": "doo-OOM",
        "definition": "The period of darkness after sundown; night.",
        "example_butuanon": "Madiyaw ang duum kuman.",
        "example_english": "The night is beautiful now."
    },
    {
        "old_butuanon": "Karon",
        "new_butuanon": "Kuman",
        "pronunciation": "koo-MAN",
        "definition": "At the present time or moment; now.",
        "example_butuanon": "Moadto ako kuman sa lungsod.",
        "example_english": "I will go to the city now."
    },
    {
        "old_butuanon": "Ugma",
        "new_butuanon": "Kunum",
        "pronunciation": "koo-NOOM",
        "definition": "On the day after today; tomorrow.",
        "example_butuanon": "Magkita kita kunum.",
        "example_english": "We will see each other tomorrow."
    },
    {
        "old_butuanon": "Kagahapon",
        "new_butuanon": "Kabi-i",
        "pronunciation": "kah-bee-EE",
        "definition": "On the day before today; yesterday.",
        "example_butuanon": "Nianhi siya kabi-i.",
        "example_english": "He came here yesterday."
    },
    {
        "old_butuanon": "Dili",
        "new_butuanon": "Dii",
        "pronunciation": "dee-EE",
        "definition": "A negative response; used to express denial, refusal, or disagreement; no/not.",
        "example_butuanon": "Dii ako gusto hong bugnaw nga tubig.",
        "example_english": "I do not want cold water."
    },
    {
        "old_butuanon": "Dako",
        "new_butuanon": "Aslag",
        "pronunciation": "as-LAG",
        "definition": "Large in size, degree, or intensity; big.",
        "example_butuanon": "Aslag ang balay hong akong kaiban.",
        "example_english": "The house of my friend is big."
    },
    {
        "old_butuanon": "Gamay",
        "new_butuanon": "Ti-ad",
        "pronunciation": "tee-AD",
        "definition": "Small in size, quantity, or degree; little.",
        "example_butuanon": "Ti-ad ra ang akong kuwarta kuman.",
        "example_english": "My money is only little now."
    },
    {
        "old_butuanon": "Higala",
        "new_butuanon": "Kaiban",
        "pronunciation": "kah-ee-BAN",
        "definition": "A companion, friend, or associate.",
        "example_butuanon": "Ikaw ang akong kaiban.",
        "example_english": "You are my friend."
    },
    {
        "old_butuanon": "Kamot",
        "new_butuanon": "Alima",
        "pronunciation": "ah-lee-MAH",
        "definition": "The end part of a person's arm beyond the wrist.",
        "example_butuanon": "Hinloi ang imong alima sa dii pa mokaon.",
        "example_english": "Clean your hands before eating."
    },
    {
        "old_butuanon": "Bata",
        "new_butuanon": "Buntanak",
        "pronunciation": "boon-tah-NAK",
        "definition": "A young human being below the age of puberty; a child.",
        "example_butuanon": "Nagdula ang buntanak disani sa alad.",
        "example_english": "The child is playing here in the yard."
    },
    {
        "old_butuanon": "Asa",
        "new_butuanon": "Hari",
        "pronunciation": "hah-REE",
        "definition": "In or to what place; where.",
        "example_butuanon": "Hari ka moadto kuman?",
        "example_english": "Where are you going now?"
    },
    {
        "old_butuanon": "Unsa",
        "new_butuanon": "Uno",
        "pronunciation": "oo-NOH",
        "definition": "What; used to ask for information or clarification.",
        "example_butuanon": "Uno ang imong ngalan?",
        "example_english": "What is your name?"
    },
    {
        "old_butuanon": "Kinsa",
        "new_butuanon": "Hisu",
        "pronunciation": "hee-SOO",
        "definition": "Who; used to ask about the identity of a person.",
        "example_butuanon": "Hisu siya?",
        "example_english": "Who is he/she?"
    },
    {
        "old_butuanon": "Giunsa",
        "new_butuanon": "In-uno",
        "pronunciation": "een-oo-NOH",
        "definition": "How; by what means or process.",
        "example_butuanon": "In-uno mo paghimo ini?",
        "example_english": "How did you make this?"
    },
    {
        "old_butuanon": "Daghan",
        "new_butuanon": "Maday-a",
        "pronunciation": "mah-day-AH",
        "definition": "A large number of people or things; many.",
        "example_butuanon": "Maday-a ang tawo disani.",
        "example_english": "Many people are here."
    },
    {
        "old_butuanon": "Palit",
        "new_butuanon": "Bili",
        "pronunciation": "bee-LEE",
        "definition": "To acquire something by paying for it; buy.",
        "example_butuanon": "Mobili ako hong kape kunum.",
        "example_english": "I will buy coffee tomorrow."
    },
    {
        "old_butuanon": "Saka",
        "new_butuanon": "Daag",
        "pronunciation": "dah-AG",
        "definition": "To go up or climb a mountain, tree, or stairs.",
        "example_butuanon": "Mondaag ako sa kahoy.",
        "example_english": "I will climb the tree."
    },
    {
        "old_butuanon": "Yuta",
        "new_butuanon": "Daga",
        "pronunciation": "dah-GAH",
        "definition": "The solid surface of the earth; soil; land.",
        "example_butuanon": "Ang daga sa Butuan tabunok.",
        "example_english": "The soil in Butuan is fertile."
    },
    {
        "old_butuanon": "Nindot",
        "new_butuanon": "Madiyaw",
        "pronunciation": "mah-dee-YAW",
        "definition": "Pleasing to the senses or mind; beautiful; nice.",
        "example_butuanon": "Madiyaw nga balay.",
        "example_english": "Beautiful house."
    },
    {
        "old_butuanon": "Lingkod",
        "new_butuanon": "Ingkod",
        "pronunciation": "eeng-KOD",
        "definition": "To be in or assume a position in which the body's weight is supported by the buttocks; sit down.",
        "example_butuanon": "Pag-ingkod disani.",
        "example_english": "Sit down here."
    },
    {
        "old_butuanon": "Adlaw",
        "new_butuanon": "Suwang",
        "pronunciation": "soo-WANG",
        "definition": "The star around which the earth orbits; the sun.",
        "example_butuanon": "Aslag ug mainit ang suwang kuman.",
        "example_english": "The sun is big and hot now."
    },
    {
        "old_butuanon": "Amigo",
        "new_butuanon": "Amigo",
        "english": "Friend",
        "pronunciation": "ah-MEE-go",
        "definition": "A male friend (Spanish loanword commonly used).",
        "example_butuanon": "Ikaw ang akong pinakamahal nga amigo.",
        "example_english": "You are my most treasured friend."
    },
    {
        "old_butuanon": "Balay",
        "new_butuanon": "Balay",
        "english": "House; Home",
        "pronunciation": "BAH-lay",
        "definition": "A structure serving as a dwelling place; home.",
        "example_butuanon": "Aslag ang among balay sa bukid.",
        "example_english": "Our house in the mountains is big."
    },
    {
        "old_butuanon": "Kahoy",
        "new_butuanon": "Kahoy",
        "english": "Tree; Wood",
        "pronunciation": "KAH-hoy",
        "definition": "A tall plant with a trunk; tree; wood.",
        "example_butuanon": "Ang kahoy sa bukid taas.",
        "example_english": "The tree in the mountain is tall."
    },
    {
        "old_butuanon": "Lungsod",
        "new_butuanon": "Lungsod",
        "english": "City; Town",
        "pronunciation": "LOONG-sod",
        "definition": "A large and important town; city.",
        "example_butuanon": "Butuan ang among lungsod.",
        "example_english": "Butuan is our city."
    },
    {
        "old_butuanon": "Pamilya",
        "new_butuanon": "Pamilya",
        "english": "Family",
        "pronunciation": "pah-MEEL-yah",
        "definition": "A group of people related by blood or marriage; relatives.",
        "example_butuanon": "Importante ang pamilya sa atong kinabuhi.",
        "example_english": "Family is important in our life."
    },
    {
        "old_butuanon": "Tawo",
        "new_butuanon": "Tawo",
        "english": "Person; Human being",
        "pronunciation": "TAH-wo",
        "definition": "A human being; person.",
        "example_butuanon": "Madiyaw nga tawo si Juan.",
        "example_english": "Juan is a good person."
    },
    {
        "old_butuanon": "Tubig",
        "new_butuanon": "Tubig",
        "english": "Water",
        "pronunciation": "TOO-big",
        "definition": "A clear, colorless liquid essential for life; water.",
        "example_butuanon": "Bugnaw ang tubig hong suba.",
        "example_english": "The water of the river is cold."
    }
]

def run_updates():
    db = SessionLocal()
    try:
        updated_count = 0
        inserted_count = 0
        deleted_duplicates = 0
        
        for item in updates:
            old_name = item["old_butuanon"]
            new_name = item["new_butuanon"]
            english_val = item.get("english")
            
            # Find entries matching old_name
            old_entries = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(old_name)).all()
            
            # Find entries matching new_name (excluding the ones we found for old_name to avoid self-collision)
            old_ids = [e.id for e in old_entries]
            existing_new = db.query(DictionaryEntry).filter(
                DictionaryEntry.butuanon.ilike(new_name),
                ~DictionaryEntry.id.in_(old_ids) if old_ids else True
            ).all()
            
            if old_entries:
                # Update the first old entry
                entry = old_entries[0]
                entry.butuanon = new_name
                if english_val:
                    entry.english = english_val
                entry.pronunciation = item["pronunciation"]
                entry.definition = item["definition"]
                entry.example_butuanon = item["example_butuanon"]
                entry.example_english = item["example_english"]
                updated_count += 1
                print(f"Updated entry: {old_name} -> {new_name}")
                
                # Delete any other old entries as they are duplicates
                for extra in old_entries[1:]:
                    db.delete(extra)
                    deleted_duplicates += 1
                    print(f"Deleted duplicate old entry for: {old_name}")
                
                # If there are existing new entries that are separate, delete them to avoid duplication
                for extra in existing_new:
                    db.delete(extra)
                    deleted_duplicates += 1
                    print(f"Deleted existing new entry collision for: {new_name}")
            else:
                # If old name doesn't exist in the database, check if new name exists
                new_entries = db.query(DictionaryEntry).filter(DictionaryEntry.butuanon.ilike(new_name)).all()
                if new_entries:
                    # Just update the first new entry fields
                    entry = new_entries[0]
                    if english_val:
                        entry.english = english_val
                    entry.pronunciation = item["pronunciation"]
                    entry.definition = item["definition"]
                    entry.example_butuanon = item["example_butuanon"]
                    entry.example_english = item["example_english"]
                    updated_count += 1
                    print(f"Updated existing new entry fields: {new_name}")
                    
                    # Delete any duplicate new entries
                    for extra in new_entries[1:]:
                        db.delete(extra)
                        deleted_duplicates += 1
                        print(f"Deleted duplicate new entry for: {new_name}")
                else:
                    # Insert as a new entry
                    # Deduce english / pos if not explicitly provided
                    english = english_val
                    if not english:
                        if new_name == "Hinaat":
                            english = "Morning"
                        elif new_name == "Madiyaw nga hinaat":
                            english = "Good morning"
                        elif new_name == "Madiyaw nga duum":
                            english = "Good evening"
                        elif new_name == "Madiyaw nga hapun":
                            english = "Good afternoon"
                        elif new_name == "Madiyaw nga udto":
                            english = "Good noon"
                        elif new_name == "Duum":
                            english = "Night; Evening"
                        elif new_name == "Kuman":
                            english = "Now"
                        elif new_name == "Kunum":
                            english = "Tomorrow"
                        elif new_name == "Kabi-i":
                            english = "Yesterday"
                        elif new_name == "Dii":
                            english = "No; Not"
                        elif new_name == "Aslag":
                            english = "Big; Large"
                        elif new_name == "Ti-ad":
                            english = "Small; Little"
                        elif new_name == "Kaiban":
                            english = "Friend; Companion"
                        elif new_name == "Alima":
                            english = "Hand"
                        elif new_name == "Buntanak":
                            english = "Child"
                        elif new_name == "Hari":
                            english = "Where"
                        elif new_name == "Uno":
                            english = "What"
                        elif new_name == "Hisu":
                            english = "Who"
                        elif new_name == "In-uno":
                            english = "How"
                        elif new_name == "Maday-a":
                            english = "Many; Much"
                        elif new_name == "Bili":
                            english = "Buy"
                        elif new_name == "Daag":
                            english = "Climb"
                        elif new_name == "Daga":
                            english = "Earth; Land; Soil"
                        elif new_name == "Madiyaw":
                            english = "Beautiful; Good; Nice"
                        elif new_name == "Ingkod":
                            english = "Sit down"
                        elif new_name == "Suwang":
                            english = "Sun"
                        else:
                            english = old_name if old_name != new_name else ""
                    
                    pos = "noun"
                    if new_name in ["Madiyaw nga hinaat", "Madiyaw nga duum", "Madiyaw nga hapun", "Madiyaw nga udto"]:
                        pos = "phrase"
                    elif new_name in ["Kuman", "Kunum", "Kabi-i", "Dii", "Hari", "Uno", "Hisu", "In-uno"]:
                        pos = "adverb"
                    elif new_name in ["Aslag", "Ti-ad", "Madiyaw"]:
                        pos = "adjective"
                    elif new_name in ["Bili", "Daag", "Ingkod"]:
                        pos = "verb"
                    
                    new_entry = DictionaryEntry(
                        butuanon=new_name,
                        english=english,
                        pos=pos,
                        pronunciation=item["pronunciation"],
                        definition=item["definition"],
                        example_butuanon=item["example_butuanon"],
                        example_english=item["example_english"],
                        verified="academic",
                        rating=5
                    )
                    db.add(new_entry)
                    inserted_count += 1
                    print(f"Inserted missing entry: {new_name}")
                    
        db.commit()
        print("----------------------------------------")
        print(f"Completed! Updated: {updated_count}, Inserted: {inserted_count}, Deleted Duplicates: {deleted_duplicates}")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_updates()
