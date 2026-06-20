# System Design Documentation
## Web-Based AI-Driven Butuanon-English Dictionary and Audio Translation System

---

## 1. Introduction & Background

### Flowchart (Existing System / Scattered Processes)

Currently, individuals seeking to learn or verify Butuanon words and their English equivalents must navigate scattered, inconsistent, and largely manual resources. Because there is no centralized, dedicated dictionary platform for Butuanon, users typically attempt three primary avenues:
1. **Generic Multilingual Translation Sites (e.g., Glosbe)**: These platforms feature small, user-contributed, and unverified word pairs. They often contain high error rates (confusing Butuanon with other Bisayan languages), lack native-speaker audio pronunciations, and cannot translate full contextual sentences.
2. **Static/Scanned Reference Files (e.g., "Save Our Butuanon Language" PDFs)**: Local educators and linguists have compiled physical and PDF wordlists. However, these documents are not searchable via natural language queries, require tedious alphabetical scanning, lack audio recordings, and do not provide grammatical breakdowns or sentence translations.
3. **Social Media Communities (e.g., Facebook Pages)**: Learners post text-based queries on community boards and wait hours or days for responses from native speakers. The answers are often inconsistent, text-only, and unarchived, meaning the same questions are asked repeatedly.

#### Existing System Flowchart

```mermaid
flowchart TD
    Start([Start]) --> UserGoal[User needs to look up a Butuanon word or translate a sentence]
    UserGoal --> RouteChoice{Choose Available Reference Method}
    
    %% Option A: Online Multilingual Sites
    RouteChoice -- "Option A: Online Portals (e.g., Glosbe)" --> GlosbeSearch[Search keyword on translation site]
    GlosbeSearch --> GlosbeResult{Word exists & translated?}
    GlosbeResult -- "Yes" --> GlosbeCheck[View unverified, text-only translation]
    GlosbeCheck --> GlosbeIssue{Is meaning clear & has audio?}
    GlosbeIssue -- "No (Lacks audio/context)" --> RouteChoice
    GlosbeIssue -- "Yes (Fuzzy meaning)" --> End([End])
    GlosbeResult -- "No" --> RouteChoice
    
    %% Option B: Static PDFs / Documents
    RouteChoice -- "Option B: Scanned PDFs & Wordlists" --> OpenPDF[Open scanned PDF document]
    OpenPDF --> SearchPDF[Scroll & scan pages alphabetically]
    SearchPDF --> PDFResult{Word found in list?}
    PDFResult -- "Yes" --> PDFCheck[Read translation - guess pronunciation from text] --> End
    PDFResult -- "No" --> RouteChoice

    %% Option C: Social Media Communities
    RouteChoice -- "Option C: Facebook Community Groups" --> PostQuery[Post vocabulary question on group board]
    PostQuery --> WaitDays[Wait hours or days for native speaker response]
    WaitDays -- "Receive response" --> ReceiveReply[Receive text reply - results may vary/no audio] --> End
```
*Figure 1. Flowchart of the existing system and scattered processes for looking up Butuanon words.*

---

## 2. Proposed System Overview

### Flowchart (Proposed System)

The proposed Web-Based AI-Driven Butuanon-English Dictionary and Audio Translation System addresses these gaps by providing a centralized, searchable, and freely accessible online platform. Users can search for Butuanon or English words directly through the Dictionary module, which returns definitions, parts of speech, and example sentences instantly from a structured database. 

For words or phrases not yet catalogued, or for full sentence translation, users can use the Translation module, which is powered by **Google Gemini 2.5 Flash** integrated with a **Retrieval-Augmented Generation (RAG)** system that injects lexicographical context from the dictionary database. If the API key is not configured or an API error occurs, the system falls back on a deterministic database dictionary lookup and word-by-word mapping.

Every entry and translation result is paired with an Audio feature: if a recorded pronunciation is available on Supabase Storage, it is streamed; otherwise, the system dynamically generates speech using browser-based text-to-speech (TTS) mapped to a regional voice. Users can also register and authenticate via Google OAuth to earn Experience Points (XP) by participating in interactive vocabulary quizzes, and suggest new words by recording audios in their browser.

#### Proposed System Process Flow

```mermaid
flowchart TD
    Start([Start]) --> AccessPlatform[Access Web-Based AI-Driven Dictionary & Translation System]
    AccessPlatform --> ChooseFeature{Choose Feature}
    
    %% Dictionary Search Path
    ChooseFeature -- "Dictionary Search" --> SearchInput[Input Butuanon or English keyword]
    SearchInput --> QueryDB[Query central database]
    QueryDB --> MatchFound{Match Found?}
    MatchFound -- "Yes" --> ShowEntry[Display definition, POS, example sentences]
    ShowEntry --> AudioAvailable{Audio pronunciation exists?}
    AudioAvailable -- "Yes" --> PlayAudio[Stream recorded audio from Supabase Storage] --> End([End])
    AudioAvailable -- "No" --> PlayTTS[Play browser-based Text-to-Speech] --> End
    
    %% Substring fallback path
    MatchFound -- "No" --> SubstringSearch[Perform substring database query]
    SubstringSearch --> SuggestEntries[Display partial matches & letter suggestions]
    SuggestEntries --> UserSelects{User selects suggestion?}
    UserSelects -- "Yes" --> ShowEntry
    UserSelects -- "No" --> End
    
    %% Translation Path
    ChooseFeature -- "AI Translation" --> InputText[Submit text & select translation direction]
    InputText --> QueryRAG[Query dictionary table for word context]
    QueryRAG --> GeminiAvailable{Gemini API Online?}
    GeminiAvailable -- "Yes" --> RunGeminiRAG[Translate via Gemini 2.5 Flash API with RAG context] --> ShowTranslation[Display translated text + disclaimer] --> End
    GeminiAvailable -- "No" --> DBFallback[Fall back to database lookup / word mapping] --> ShowTranslation --> End
```
*Figure 2. Flowchart of the proposed Butuanon-English AI Dictionary and Audio Translation System.*

---

## 3. Data Flow Diagrams (DFD)

### Data Flow Diagram (DFD) Architecture

The Data Flow Diagram illustrates how data moves within the proposed system. The system involves two primary external entities: the **User** (students, educators, or community members accessing the dictionary, submitting suggestions, and taking quizzes) and the **Admin** (the research team responsible for managing dictionary content and review of community contributions).

Authentication is handled via Google OAuth API, audio assets are hosted on Supabase Storage, and the RAG-based translation is handled by the Google Gemini API.

### Level 0 — Context Diagram

The Context Diagram defines the system boundary, showing the high-level inputs and outputs between the core system and external entities.

```mermaid
flowchart TD
    User([User])
    Admin([Admin])
    Gemini[[Google Gemini API\nExternal LLM Service]]
    GoogleAuth[[Google OAuth API\nExternal Auth Service]]
    SupabaseStore[[Supabase Storage\nAudio Bucket]]
    
    System(((0.0\nWeb-Based Butuanon-English\nDictionary & Audio\nTranslation System)))

    %% User interactions
    User -- "Search queries, Translation text, Suggest words with audio, Google credentials, Quiz XP" --> System
    System -- "Dictionary matches, Translation text, Google profile info, Audio stream" --> User

    %% Admin interactions
    Admin -- "Manage dictionary, Approve/Reject suggestions, Admin credentials" --> System
    System -- "System analytics & logs" --> Admin

    %% External services
    System -- "Source text & context" --> Gemini
    Gemini -- "Translated sentence" --> System
    System -- "Credentials validation" --> GoogleAuth
    GoogleAuth -- "Verified user profile" --> System
    System -- "Upload recorded .webm files" --> SupabaseStore
    SupabaseStore -- "Audio file URLs" --> System
```
*Figure 3. Level 0 Context Diagram of the proposed system.*

---

### Level 1 — Main Processes

The Level 1 diagram breaks the system down into five major processes:
1. **(1.0) Dictionary Search**: Querying the database for exact matches, substring matches, or filtering alphabetically.
2. **(2.0) AI Translation Processing (RAG + Gemini)**: Fetching word mapping context from the database and using Gemini 2.5 Flash API (with DB fallback).
3. **(3.0) Audio Playback**: Retrieving the audio URL from database records and streaming from Supabase Storage (or fallback to client-side TTS).
4. **(4.0) User Suggestion Management**: Submitting community proposals (Word Suggestion) and allowing Admins to moderate contributions.
5. **(5.0) User Authentication & Gamification**: Managing logins via Google OAuth and updating user XP metrics based on quiz scores.

```mermaid
flowchart TD
    %% Entities & Services
    User([User])
    Admin([Admin])
    Gemini[[Google Gemini API]]
    GoogleAuth[[Google OAuth API]]
    SupabaseStore[[Supabase Storage]]
    
    %% Processes
    P1(((1.0\nDictionary Search)))
    P2(((2.0\nAI Translation\nProcessing)))
    P3(((3.0\nAudio Playback)))
    P4(((4.0\nUser Suggestion\nManagement)))
    P5(((5.0\nUser Auth &\nGamification)))
    
    %% Data Stores
    D1[(D1: Dictionary Entries)]
    D2[(D2: Contributions)]
    D3[(D3: Users)]
    
    %% Process 1: Search
    User -- "Search Keyword / Letter" --> P1
    P1 -- "Query exact & substring" --> D1
    P1 -- "Query pending suggs" --> D2
    D1 -- "Lexical matches" --> P1
    D2 -- "Pending suggestions" --> P1
    P1 -- "Combined results" --> User
    
    %% Process 2: Translation
    User -- "Text & Direction" --> P2
    P2 -- "Context lookup" --> D1
    D1 -- "Matching context entries" --> P2
    P2 -- "Enhanced prompt" --> Gemini
    Gemini -- "Translated result" --> P2
    P2 -- "Translation output" --> User
    
    %% Process 3: Audio Playback
    User -- "Audio Playback Request" --> P3
    P3 -- "Get audio URL" --> D1
    P3 -- "Get audio URL" --> D2
    D1 -- "URL" --> P3
    D2 -- "URL" --> P3
    P3 -- "Retrieve file" --> SupabaseStore
    SupabaseStore -- "Audio binary" --> P3
    P3 -- "Play sound / TTS" --> User
    
    %% Process 4: Suggestion Management
    User -- "Suggest Word Form & Audio" --> P4
    P4 -- "Upload audio" --> SupabaseStore
    SupabaseStore -- "Audio URL" --> P4
    P4 -- "Insert pending sugg" --> D2
    Admin -- "Approve/Reject Suggestion" --> P4
    P4 -- "Update status or merge" --> D1
    P4 -- "Update status" --> D2
    
    %% Process 5: Auth & Gamification
    User -- "Login Token" --> P5
    P5 -- "Validate token" --> GoogleAuth
    GoogleAuth -- "Profile details" --> P5
    P5 -- "Write/Read profile info" --> D3
    D3 -- "User info & XP" --> P5
    User -- "Submit Quiz Score" --> P5
    P5 -- "Update XP points" --> D3
```
*Figure 4. Level 1 Data Flow Diagram showing the main processes of the system.*

---

### Level 2 — Process 1: Dictionary Search

The Dictionary Search process queries the database entries. The system queries the `dictionary` (and pending `contributions`) table for exact string matches. If none is found, it performs substring query matching in both English and Butuanon. If the server is offline, the client frontend falls back to parsing stored contributions and static dictionary entries in local storage.

```mermaid
flowchart TD
    User([User])
    D1[(D1: Dictionary Entries)]
    D2[(D2: Contributions)]
    
    P11(((1.1\nValidate & Normalize\nInput)))
    P12(((1.2\nPerform Exact\nMatch Query)))
    P13(((1.3\nExecute Substring\nFuzzy Search)))
    P14(((1.4\nFormat & Present\nResults)))
    
    User -- "Search Keyword" --> P11
    P11 -- "Cleaned Keyword" --> P12
    P12 -- "Query" --> D1
    P12 -- "Query pending" --> D2
    D1 -- "Matches" --> P12
    D2 -- "Matches" --> P12
    
    P12 -- "Match Found" --> P14
    P12 -- "No Match Found" --> P13
    P13 -- "Substring Query" --> D1
    P13 -- "Substring Query" --> D2
    D1 -- "Matches" --> P13
    D2 -- "Matches" --> P13
    P13 -- "Closest Suggestions" --> P14
    
    P14 -- "Formatted entries/suggestions" --> User
```
*Figure 5. Level 2 Data Flow Diagram for Process 1 — Dictionary Search.*

---

### Level 2 — Process 2: AI Translation Processing

When translating a sentence, the system queries the `dictionary` table for any words matching substrings in the request to construct RAG context. The prompt is sent to Gemini 2.5 Flash, which returns the translated sentence. If the Gemini service is unavailable, the system falls back to a database dictionary mapping engine (matching exact, substring, or splitting word-by-word).

```mermaid
flowchart TD
    User([User])
    Gemini[[Google Gemini API]]
    D1[(D1: Dictionary Entries)]
    
    P21(((2.1\nDetect Input\nLanguage)))
    P22(((2.2\nExtract Words &\nQuery Context)))
    P23(((2.3\nCompile Prompt\nwith RAG)))
    P24(((2.4\nInvoke Gemini\nInference)))
    P25(((2.5\nDB Lookup\nFallback)))
    P26(((2.6\nFormat Output)))
    
    User -- "Text & Direction" --> P21
    P21 -- "Input info" --> P22
    P22 -- "Word lookup" --> D1
    D1 -- "RAG context definitions" --> P22
    P22 -- "Context details" --> P23
    
    P23 -- "Prompt" --> P24
    P24 -- "Send payload" --> Gemini
    Gemini -- "Translated text" --> P24
    
    P24 -- "API error / timeout" --> P25
    P25 -- "Word-by-word match" --> D1
    D1 -- "Direct meanings" --> P25
    P25 -- "Fallback text" --> P26
    
    P24 -- "API success" --> P26
    P26 -- "Translated result & disclaimer" --> User
```
*Figure 6. Level 2 Data Flow Diagram for Process 2 — AI Translation Processing.*

---

## 4. Use Case Diagram

The Use Case Diagram presents the interactions between users and the proposed system.

* **The General User** (students, educators, or community members) can search for entries, filter by alphabet, translate text using the AI translation feature, play audio pronunciations (streams or TTS), and submit suggestions (with recorded pronunciation audio) without logging in. Upon logging in via Google OAuth, they can participate in interactive quizzes and earn XP points.
* **The Admin** (research team), once authenticated, can manage dictionary entries (add, edit, delete) and review/moderate community contributions (approving or rejecting pending suggestions).

```mermaid
graph LR
    User([General User])
    Admin([Admin])
    
    subgraph Use Cases
        UC1(Search Dictionary Entries)
        UC2(Browse Alphabetically)
        UC3(Translate Text via AI Gemini)
        UC4(Play Pronunciation Audio)
        UC5(Propose Word Suggestion / Record Audio)
        
        UC6(Authenticate via Google OAuth)
        UC7(Play Interactive Quiz & Earn XP)
        
        UC8(Manage Dictionary Entries)
        UC9(Approve / Reject Suggestions)
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    
    Admin --> UC8
    Admin --> UC9
    
    UC8 -.-> |requires authentication| UC6
    UC9 -.-> |requires authentication| UC6
```
*Figure 7. Use Case Diagram of the proposed system.*

---

## 5. Database Schema & Entity Relationship Diagram (ERD)

The database schema utilizes PostgreSQL (via Supabase) to support the complete production feature set of the startup, modeling user access, lexical records, community moderation, usage logging, gamification, and personalization elements.

### Entity Descriptions

| Entity | Purpose | SQL Table Name |
| :--- | :--- | :--- |
| **USERS** | Holds account profiles authenticated via Google OAuth. Tracks gamified user statistics (`xp_points`). | `users` |
| **ADMINS** | Administrative accounts for the research team/editors. Used to manage dictionary content and review community contributions. | `admins` |
| **DICTIONARY_ENTRIES** | Central verified vocabulary listings containing terms, pronunciation keys, definitions, example sentences, verification metadata, ratings, and audio storage URLs. | `dictionary` |
| **CONTRIBUTIONS** | Lexical suggestions submitted by community members. Holds the pending audio recording link, moderation status, and auditing links to administrators. | `contributions` |
| **SEARCH_LOGS** | Tracks query search keywords, helping administrators evaluate search analytics and locate missing vocabularies. | `search_logs` |
| **TRANSLATION_LOGS** | Pairs of texts submitted and translated by the AI model, useful for evaluation and model fine-tuning loops. | `translation_logs` |
| **WORD_OF_THE_DAY** | Featured words scheduled by date, presented on the platform landing page to increase daily learner engagement. | `word_of_the_day` |
| **QUIZ_SCORES** | Records of quiz scores (items got correct vs total) for gamification analytics and XP validation. | `quiz_scores` |
| **USER_BOOKMARKS** | User-specific study lists matching users to saved dictionary entries. | `user_bookmarks` |

### Key Relationships Summary

* **Users to Contributions**: `1:N` cardinality. A logged-in user can submit multiple suggestions/contributions (`user_id`).
* **Users to Activity Logs**: `1:N` cardinality. A user logs multiple search logs (`user_id`) and translation logs (`user_id`) (nullable fields for guest users).
* **Users to Gamification/Personalization**: `1:N` cardinality. Users record multiple quiz scores (`quiz_scores`) and save multiple terms (`user_bookmarks`).
* **Admins to Dictionary Entries**: `1:N` cardinality. An administrator can add or modify multiple dictionary entries (`created_by_admin_id`).
* **Admins to Contributions**: `1:N` cardinality. An administrator reviews, approves, or rejects pending suggestions (`reviewed_by_admin_id`).
* **Dictionary Entries to System Features**: `1:N` cardinality. Entries can be featured as the Word of the Day on multiple dates (`entry_id`) and bookmarked by multiple users (`entry_id`).

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        string google_id UK "Unique Google profile ID"
        string username "User display name"
        string email UK "User email"
        string profile_pic "Google avatar URL"
        int xp_points "Gamification XP"
        timestamp created_at
    }
    ADMINS {
        int id PK
        string username UK "Admin handle"
        string email UK "Admin email"
        string password_hash "Secure hash"
        string role "superadmin | editor"
        timestamp created_at
    }
    DICTIONARY_ENTRIES {
        int id PK
        int created_by_admin_id FK "Reference to creator admin (nullable)"
        string butuanon "Butuanon term"
        string english "English translation"
        string pos "Part of speech"
        string pronunciation "Pronunciation notation"
        text definition "Term definition"
        string example_butuanon "Butuanon example sentence"
        string example_english "English translation of example"
        string verified "Verification source tags"
        int rating "Community validation rating"
        string audio_url "Supabase Storage URL"
        timestamp created_at
    }
    CONTRIBUTIONS {
        int id PK
        int user_id FK "Reference to submitting user (nullable)"
        int reviewed_by_admin_id FK "Reference to moderation admin (nullable)"
        string butuanon "Suggested Butuanon term"
        string english "Suggested English translation"
        string pos "Part of speech"
        string pronunciation "Suggested pronunciation"
        text definition "Suggested definition"
        string example_butuanon "Suggested Butuanon example"
        string example_english "Suggested English example"
        string audio_url "Uploaded audio recording URL"
        string status "pending | approved | rejected"
        timestamp created_at
    }
    TRANSLATION_LOGS {
        int id PK
        int user_id FK "Reference to user (nullable)"
        text source_text "Text submitted"
        text translated_text "Resulting translation"
        string direction "but-en | en-but"
        string model_version "Gemini version used"
        timestamp created_at
    }
    SEARCH_LOGS {
        int id PK
        int user_id FK "Reference to user (nullable)"
        string query "Searched keyword"
        string match_type "exact | substring | none"
        timestamp created_at
    }
    WORD_OF_THE_DAY {
        int id PK
        int entry_id FK "Reference to dictionary entry"
        date featured_date "Scheduled date"
    }
    QUIZ_SCORES {
        int id PK
        int user_id FK "Reference to user"
        int score "Number of correct answers"
        int total_questions "Total items"
        int xp_gained "XP rewarded"
        timestamp created_at
    }
    USER_BOOKMARKS {
        int id PK
        int user_id FK "Reference to user"
        int entry_id FK "Reference to dictionary entry"
        timestamp created_at
    }

    USERS ||--o{ CONTRIBUTIONS : "submits"
    USERS ||--o{ SEARCH_LOGS : "performs"
    USERS ||--o{ TRANSLATION_LOGS : "requests"
    USERS ||--o{ QUIZ_SCORES : "records"
    USERS ||--o{ USER_BOOKMARKS : "creates"
    
    ADMINS ||--o{ DICTIONARY_ENTRIES : "creates/updates"
    ADMINS ||--o{ CONTRIBUTIONS : "moderates"
    
    DICTIONARY_ENTRIES ||--o{ USER_BOOKMARKS : "saved_in"
    DICTIONARY_ENTRIES ||--o{ WORD_OF_THE_DAY : "featured_as"
```
*Figure 8. Entity Relationship Diagram of the proposed system database (PostgreSQL/Supabase).*
