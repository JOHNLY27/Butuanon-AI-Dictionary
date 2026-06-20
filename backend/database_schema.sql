-- 1. Create Dictionary Table
CREATE TABLE IF NOT EXISTS dictionary (
    id SERIAL PRIMARY KEY,
    butuanon VARCHAR(255) NOT NULL,
    english VARCHAR(255) NOT NULL,
    pos VARCHAR(50) NOT NULL,
    pronunciation VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    example_butuanon VARCHAR(500),
    example_english VARCHAR(500),
    verified VARCHAR(50), -- 'native-speaker', 'academic', 'community', or NULL
    rating INT DEFAULT 0,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
    id SERIAL PRIMARY KEY,
    butuanon VARCHAR(255) NOT NULL,
    english VARCHAR(255) NOT NULL,
    pos VARCHAR(50) NOT NULL,
    pronunciation VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    example_butuanon VARCHAR(500),
    example_english VARCHAR(500),
    audio_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Full-text search indices for fast dictionary search
CREATE INDEX IF NOT EXISTS idx_dictionary_butuanon_trgm ON dictionary USING gin (to_tsvector('simple', butuanon));
CREATE INDEX IF NOT EXISTS idx_dictionary_english_trgm ON dictionary USING gin (to_tsvector('english', english));

-- 4. Seed Initial Vocabulary
INSERT INTO dictionary (butuanon, english, pos, pronunciation, definition, example_butuanon, example_english, verified, rating, audio_url)
VALUES
('Suwang', 'Sun', 'noun', 'soo-WANG', 'The star around which the earth orbits; the sun.', 'Aslag ug mainit ang suwang kuman.', 'The sun is big and hot now.', 'native-speaker', 5, NULL),
('Amigo', 'Friend', 'noun', 'ah-MEE-go', 'A person with whom one has a bond of mutual affection; a companion or buddy.', 'Ikaw ang akong pinakamahal nga amigo.', 'You are my most treasured friend.', 'community', 4, NULL),
('Balay', 'House; Home', 'noun', 'BAH-lay', 'A structure serving as a dwelling place; the place where one lives.', 'Aslag ang among balay sa bukid.', 'Our house in the mountains is big.', 'native-speaker', 5, NULL),
('Hinaat', 'Morning', 'noun', 'hee-nah-AT', 'The period of time from sunrise to noon.', 'Madiyaw ang hinaat disani sa Butuan.', 'The morning is beautiful here in Butuan.', 'academic', 5, NULL),
('Daga', 'Land; Earth; Ground', 'noun', 'DAH-gah', 'The solid surface of the earth; territory or homeland.', 'Ang daga hong Butuan madiyaw ug tabunok.', 'The land of Butuan is good and fertile.', 'native-speaker', 5, NULL),
('Gugma', 'Love; Affection', 'noun', 'GOOG-mah', 'A deep feeling of affection and care for another person or thing.', 'Aslag ang akong gugma hong akong pamilya.', 'My love for my family is great.', 'academic', 5, NULL),
('Kahoy', 'Tree; Wood', 'noun', 'KAH-hoy', 'A tall plant with a trunk; also refers to timber or wood material.', 'Ang kahoy sa bukid taas.', 'The tree in the mountain is tall.', 'community', 4, NULL),
('Lungsod', 'City; Town', 'noun', 'LOONG-sod', 'A large and important town; an urban center.', 'Butuan ang among lungsod.', 'Butuan is our city.', NULL, 3, NULL),
('Madiyaw nga hinaat', 'Good morning', 'phrase', 'mah-dee-YAWNG hee-nah-AT', 'A greeting used in the morning hours, expressing good wishes.', 'Madiyaw nga hinaat, kaiban! Kumusta ka?', 'Good morning, friend! How are you?', 'native-speaker', 5, NULL),
('Pamilya', 'Family', 'noun', 'pah-MEEL-yah', 'A group of people related by blood or marriage; relatives.', 'Importante ang pamilya sa atong kinabuhi.', 'Family is important in our life.', 'academic', 4, NULL),
('Tawo', 'Person; Human being', 'noun', 'TAH-wo', 'A human being; an individual member of the human species.', 'Madiyaw nga tawo si Juan.', 'Juan is a good person.', 'native-speaker', 5, NULL),
('Tubig', 'Water', 'noun', 'TOO-big', 'A clear, colorless liquid that forms rivers, seas, and rain; essential for life.', 'Bugnaw ang tubig hong suba.', 'The water of the river is cold.', 'community', 4, NULL)
ON CONFLICT DO NOTHING;
