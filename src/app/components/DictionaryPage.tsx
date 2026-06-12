import { useState, useEffect } from "react";
import { Search, Volume2, ChevronDown, ChevronUp, ArrowLeftRight, BadgeCheck, Star, Plus, Sparkles } from "lucide-react";
import { SuggestWordModal } from "./SuggestWordModal";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type VerifiedTag = "native-speaker" | "academic" | "community" | "pending" | null;

export const dictionaryEntries = [
  {
    id: 1,
    butuanon: "Adlaw",
    english: "Sun; Day",
    pos: "noun",
    pronunciation: "AD-law",
    definition: "The celestial body that provides light and warmth; also used to refer to a full day.",
    exampleButuanon: "Mainit ang adlaw karon.",
    exampleEnglish: "The sun is hot today.",
    verified: "native-speaker" as VerifiedTag,
    rating: 5,
  },
  {
    id: 2,
    butuanon: "Amigo",
    english: "Friend",
    pos: "noun",
    pronunciation: "ah-MEE-go",
    definition: "A person with whom one has a bond of mutual affection; a companion or buddy.",
    exampleButuanon: "Ikaw ang akong pinakamahal nga amigo.",
    exampleEnglish: "You are my most treasured friend.",
    verified: "community" as VerifiedTag,
    rating: 4,
  },
  {
    id: 3,
    butuanon: "Balay",
    english: "House; Home",
    pos: "noun",
    pronunciation: "BAH-lay",
    definition: "A structure serving as a dwelling place; the place where one lives.",
    exampleButuanon: "Dako ang among balay sa bukid.",
    exampleEnglish: "Our house in the mountains is big.",
    verified: "native-speaker" as VerifiedTag,
    rating: 5,
  },
  {
    id: 4,
    butuanon: "Buntag",
    english: "Morning",
    pos: "noun",
    pronunciation: "BOON-tag",
    definition: "The period of time from sunrise to noon.",
    exampleButuanon: "Maayo ang buntag diri sa Butuan.",
    exampleEnglish: "The morning is beautiful here in Butuan.",
    verified: "academic" as VerifiedTag,
    rating: 5,
  },
  {
    id: 5,
    butuanon: "Daga",
    english: "Land; Earth; Ground",
    pos: "noun",
    pronunciation: "DAH-gah",
    definition: "The solid surface of the earth; territory or homeland.",
    exampleButuanon: "Ang daga sa Butuan maayo ug tabunok.",
    exampleEnglish: "The land in Butuan is good and fertile.",
    verified: "native-speaker" as VerifiedTag,
    rating: 5,
  },
  {
    id: 6,
    butuanon: "Gugma",
    english: "Love; Affection",
    pos: "noun",
    pronunciation: "GOOG-mah",
    definition: "A deep feeling of affection and care for another person or thing.",
    exampleButuanon: "Dako ang akong gugma sa akong pamilya.",
    exampleEnglish: "My love for my family is great.",
    verified: "academic" as VerifiedTag,
    rating: 5,
  },
  {
    id: 7,
    butuanon: "Kahoy",
    english: "Tree; Wood",
    pos: "noun",
    pronunciation: "KAH-hoy",
    definition: "A tall plant with a trunk; also refers to timber or wood material.",
    exampleButuanon: "Ang kahoy sa bukid taas kaayo.",
    exampleEnglish: "The trees in the mountains are very tall.",
    verified: "community" as VerifiedTag,
    rating: 4,
  },
  {
    id: 8,
    butuanon: "Lungsod",
    english: "City; Town",
    pos: "noun",
    pronunciation: "LOONG-sod",
    definition: "A large and important town; an urban center.",
    exampleButuanon: "Butuan ang among lungsod.",
    exampleEnglish: "Butuan is our city.",
    verified: null as VerifiedTag,
    rating: 3,
  },
  {
    id: 9,
    butuanon: "Maayong buntag",
    english: "Good morning",
    pos: "phrase",
    pronunciation: "mah-AH-yong BOON-tag",
    definition: "A greeting used in the morning hours, expressing good wishes.",
    exampleButuanon: "Maayong buntag, amigo! Kumusta ka?",
    exampleEnglish: "Good morning, friend! How are you?",
    verified: "native-speaker" as VerifiedTag,
    rating: 5,
  },
  {
    id: 10,
    butuanon: "Pamilya",
    english: "Family",
    pos: "noun",
    pronunciation: "pah-MEEL-yah",
    definition: "A group of people related by blood or marriage; relatives.",
    exampleButuanon: "Importante ang pamilya sa atong kinabuhi.",
    exampleEnglish: "Family is important in our life.",
    verified: "academic" as VerifiedTag,
    rating: 4,
  },
  {
    id: 11,
    butuanon: "Tawo",
    english: "Person; Human being",
    pos: "noun",
    pronunciation: "TAH-wo",
    definition: "A human being; an individual member of the human species.",
    exampleButuanon: "Maayong tawo si Juan.",
    exampleEnglish: "Juan is a good person.",
    verified: "native-speaker" as VerifiedTag,
    rating: 5,
  },
  {
    id: 12,
    butuanon: "Tubig",
    english: "Water",
    pos: "noun",
    pronunciation: "TOO-big",
    definition: "A clear, colorless liquid that forms rivers, seas, and rain; essential for life.",
    exampleButuanon: "Coldog ang tubig sa suba.",
    exampleEnglish: "The water in the river is cold.",
    verified: "community" as VerifiedTag,
    rating: 4,
  },
];

const VERIFIED_CONFIG: Record<
  NonNullable<VerifiedTag>,
  { label: string; bg: string; text: string; border: string }
> = {
  "native-speaker": {
    label: "Verified by Native Speaker",
    bg: "rgba(196, 98, 45, 0.10)",
    text: "#A04A1A",
    border: "rgba(196, 98, 45, 0.25)",
  },
  academic: {
    label: "Academic Review",
    bg: "rgba(28, 43, 74, 0.08)",
    text: "#1C2B4A",
    border: "rgba(28, 43, 74, 0.18)",
  },
  community: {
    label: "Community Validated",
    bg: "rgba(80, 148, 90, 0.10)",
    text: "#2F6B38",
    border: "rgba(80, 148, 90, 0.25)",
  },
  pending: {
    label: "Pending Review",
    bg: "rgba(245, 158, 11, 0.10)",
    text: "#B45309",
    border: "rgba(245, 158, 11, 0.25)",
  },
};

function VerifiedBadge({ tag, rating }: { tag: VerifiedTag; rating: number }) {
  if (!tag) return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} color={i < rating ? "#C4622D" : "#D4C5B5"} fill={i < rating ? "#C4622D" : "none"} />
      ))}
    </div>
  );
  const cfg = VERIFIED_CONFIG[tag];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium"
      >
        <BadgeCheck size={10} />
        {cfg.label}
      </span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10} color={i < rating ? "#C4622D" : "#D4C5B5"} fill={i < rating ? "#C4622D" : "none"} />
        ))}
      </div>
    </div>
  );
}

function speakText(text: string) {
  if ("speechSynthesis" in window) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "fil-PH";
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
}

const POS_COLORS: Record<string, { bg: string; text: string }> = {
  noun: { bg: "rgba(28, 43, 74, 0.08)", text: "#1C2B4A" },
  verb: { bg: "rgba(196, 98, 45, 0.1)", text: "#C4622D" },
  adjective: { bg: "rgba(107, 122, 153, 0.12)", text: "#6B7A99" },
  phrase: { bg: "rgba(80, 148, 90, 0.12)", text: "#3D7A47" },
  adverb: { bg: "rgba(130, 60, 160, 0.1)", text: "#82369A" },
};

export function DictionaryPage() {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<"but-en" | "en-but">("but-en");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Suggested words states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    let url = "http://localhost:8000/api/dictionary";
    const params = [];
    if (search) params.push(`q=${encodeURIComponent(search)}`);
    if (activeLetter) params.push(`letter=${encodeURIComponent(activeLetter)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then((data) => {
        setWords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend connection failed, falling back to mock data.", err);
        
        // Fallback local storage suggestions mapping + static entries filtering
        const saved = localStorage.getItem("pending_contributions");
        let contributions = [];
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            contributions = parsed.map((item: any) => ({
              ...item,
              verified: item.verified || "pending",
            }));
          } catch (e) {
            console.error(e);
          }
        }
        
        const allLocal = [...contributions, ...dictionaryEntries];
        const filteredLocal = allLocal.filter((entry) => {
          const q = search.toLowerCase();
          const matchSearch =
            !q ||
            entry.butuanon.toLowerCase().includes(q) ||
            entry.english.toLowerCase().includes(q);
          const matchLetter = !activeLetter || entry.butuanon.toUpperCase().startsWith(activeLetter);
          return matchSearch && matchLetter;
        });

        setWords(filteredLocal);
        setLoading(false);
      });
  }, [search, activeLetter, isModalOpen]);

  function handleAudio(entry: any, e: React.MouseEvent) {
    e.stopPropagation();
    setPlayingId(entry.id);
    if (entry.audio) {
      const audio = new Audio(entry.audio);
      audio.play().catch((err) => console.error("Audio playback error:", err));
      audio.onended = () => setPlayingId(null);
    } else {
      speakText(direction === "but-en" ? entry.butuanon : entry.english);
      setTimeout(() => setPlayingId(null), 1500);
    }
  }

  const posStyle = (pos: string) => POS_COLORS[pos] || POS_COLORS.noun;

  return (
    <div style={{ backgroundColor: "#F7F2EB", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1C2B4A" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 style={{ color: "#F7F2EB" }} className="text-2xl font-bold mb-1">
            Butuanon Dictionary
          </h1>
          <p style={{ color: "#8B9DC3" }} className="text-sm mb-6">
            Browse and search thousands of Butuanon words and their English meanings.
          </p>

          {/* Search + Direction */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                color="#8B9DC3"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  direction === "but-en"
                    ? "Search in Butuanon..."
                    : "Search in English..."
                }
                style={{
                  backgroundColor: "#FFFDF9",
                  color: "#1C2B4A",
                  fontFamily: "Poppins, sans-serif",
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection(direction === "but-en" ? "en-but" : "but-en")}
                style={{
                  backgroundColor: "#C4622D",
                  color: "#FFFDF9",
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <ArrowLeftRight size={14} />
                {direction === "but-en" ? "Butuanon → English" : "English → Butuanon"}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFDF9",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <Plus size={14} />
                Suggest Word
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Suggest Word Banner */}
        <div
          style={{
            backgroundColor: "rgba(196, 98, 45, 0.08)",
            borderColor: "rgba(196, 98, 45, 0.15)",
          }}
          className="rounded-2xl border p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div
              style={{ backgroundColor: "rgba(196, 98, 45, 0.15)", color: "#C4622D" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ color: "#1C2B4A" }} className="text-sm font-bold">
                Help Us Preserve Butuanon!
              </h3>
              <p style={{ color: "#6B7A99" }} className="text-xs mt-0.5 max-w-xl leading-relaxed">
                Know a word that is not in our dictionary? Propose a new entry, translate it, and record its pronunciation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity self-start sm:self-auto whitespace-nowrap"
          >
            Suggest Word
          </button>
        </div>

        {/* Alphabet nav */}
        <div className="flex flex-wrap gap-1 mb-8">
          <button
            onClick={() => setActiveLetter(null)}
            style={{
              backgroundColor: !activeLetter ? "#1C2B4A" : "#EDE6DA",
              color: !activeLetter ? "#F7F2EB" : "#1C2B4A",
            }}
            className="w-8 h-8 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
          >
            All
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() =>
                setActiveLetter(activeLetter === letter ? null : letter)
              }
              style={{
                backgroundColor: activeLetter === letter ? "#C4622D" : "#EDE6DA",
                color: activeLetter === letter ? "#FFFDF9" : "#1C2B4A",
              }}
              className="w-8 h-8 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ color: "#8B9DC3" }} className="text-xs mb-4">
          {words.length} {words.length === 1 ? "entry" : "entries"} found
        </p>

        {/* Word cards */}
        <div className="space-y-3">
          {loading ? (
            <div
              style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
              className="rounded-2xl border p-10 text-center animate-pulse"
            >
              <p style={{ color: "#8B9DC3" }} className="text-sm font-semibold">
                Searching lexicon records...
              </p>
            </div>
          ) : words.length === 0 ? (
            <div
              style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
              className="rounded-2xl border p-10 text-center"
            >
              <p style={{ color: "#8B9DC3" }} className="text-sm">
                No words found. Try a different search term.
              </p>
            </div>
          ) : (
            words.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const ps = posStyle(entry.pos);
              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: "#FFFDF9",
                    borderColor: isExpanded ? "#C4622D" : "rgba(28,43,74,0.08)",
                  }}
                  className="rounded-2xl border overflow-hidden transition-all"
                >
                  <button
                    className="w-full text-left p-5 flex items-center gap-4 hover:bg-[#F7F2EB]/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          style={{ color: "#1C2B4A" }}
                          className="font-semibold text-base"
                        >
                          {entry.butuanon}
                        </span>
                        <span
                          style={{ backgroundColor: ps.bg, color: ps.text }}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                        >
                          {entry.pos}
                        </span>
                      </div>
                      <p style={{ color: "#6B7A99" }} className="text-sm truncate mb-1.5">
                        {entry.english}
                      </p>
                      <VerifiedBadge tag={entry.verified} rating={entry.rating} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleAudio(entry, e)}
                        style={{
                          backgroundColor:
                            playingId === entry.id
                              ? "#C4622D"
                              : "rgba(196, 98, 45, 0.1)",
                          color:
                            playingId === entry.id ? "#FFFDF9" : "#C4622D",
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-all"
                      >
                        <Volume2 size={14} />
                      </button>
                      <div style={{ color: "#8B9DC3" }}>
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        backgroundColor: "#F7F2EB",
                        borderTopColor: "rgba(28,43,74,0.08)",
                      }}
                      className="border-t px-5 py-5"
                    >
                      <p
                        style={{ color: "#8B9DC3" }}
                        className="text-xs font-medium uppercase tracking-wider mb-2"
                      >
                        Pronunciation
                      </p>
                      <p style={{ color: "#6B7A99" }} className="text-sm mb-4">
                        /{entry.pronunciation}/
                      </p>

                      <p
                        style={{ color: "#8B9DC3" }}
                        className="text-xs font-medium uppercase tracking-wider mb-2"
                      >
                        Definition
                      </p>
                      <p
                        style={{ color: "#4A5873" }}
                        className="text-sm leading-relaxed mb-4"
                      >
                        {entry.definition}
                      </p>

                      <p
                        style={{ color: "#8B9DC3" }}
                        className="text-xs font-medium uppercase tracking-wider mb-2"
                      >
                        Example Sentence
                      </p>
                      <div
                        style={{
                          backgroundColor: "#FFFDF9",
                          borderColor: "rgba(28,43,74,0.08)",
                          borderLeftColor: "#C4622D",
                        }}
                        className="rounded-xl border border-l-4 p-4"
                      >
                        <p
                          style={{ color: "#1C2B4A" }}
                          className="text-sm font-medium mb-1"
                        >
                          {entry.exampleButuanon}
                        </p>
                        <p style={{ color: "#6B7A99" }} className="text-sm">
                          {entry.exampleEnglish}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={(e) => handleAudio(entry, e)}
                          style={{
                            backgroundColor: "#1C2B4A",
                            color: "#F7F2EB",
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Volume2 size={13} />
                          Play Audio
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <SuggestWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          loadContributions();
        }}
      />
    </div>
  );
}
