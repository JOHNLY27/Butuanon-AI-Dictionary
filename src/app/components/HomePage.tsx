import { useState, useEffect } from "react";
import { Search, Volume2, ChevronRight, Globe, BookOpen, Mic } from "lucide-react";
import { dictionaryEntries } from "./DictionaryPage";
import { API_BASE_URL } from "../config";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const wordOfTheDay = {
  butuanon: "Madiyaw nga hinaat",
  english: "Good morning",
  partOfSpeech: "phrase",
  pronunciation: "mah-dee-YAWNG hee-nah-AT",
  example: "Madiyaw nga hinaat, kaiban! — Good morning, friend!",
};

const featuredWords = [
  { butuanon: "Daga", english: "Land / Earth", pos: "noun" },
  { butuanon: "Gugma", english: "Love", pos: "noun" },
  { butuanon: "Tubig", english: "Water", pos: "noun" },
  { butuanon: "Suwang", english: "Sun", pos: "noun" },
  { butuanon: "Balay", english: "House / Home", pos: "noun" },
  { butuanon: "Tawo", english: "Person / People", pos: "noun" },
];

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speak = () => {
    const cleanText = text.replace(/[-]/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.rate = 0.82;
    utt.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let chosenVoice = voices.find((v) => {
        const l = v.lang.toLowerCase();
        return l.startsWith("fil") || l.startsWith("tl");
      });

      if (!chosenVoice) {
        chosenVoice = voices.find((v) => {
          const l = v.lang.toLowerCase();
          return l.startsWith("id") || l.startsWith("ms") || l.startsWith("es");
        });
      }

      if (!chosenVoice) {
        chosenVoice = voices.find((v) => {
          const n = v.name.toLowerCase();
          return n.includes("natural") || n.includes("google") || n.includes("neural") || n.includes("premium");
        });
      }

      if (chosenVoice) {
        utt.voice = chosenVoice;
        utt.lang = chosenVoice.lang;
      } else {
        utt.lang = "fil-PH";
      }
    } else {
      utt.lang = "fil-PH";
    }

    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speak();
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    speak();
  }
}

// Inline SVG illustration: stylized baybayin-inspired pattern + sun motif
function PhilippineIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Sun rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 320 + Math.cos(angle) * 38;
        const y1 = 80 + Math.sin(angle) * 38;
        const x2 = 320 + Math.cos(angle) * 62;
        const y2 = 80 + Math.sin(angle) * 62;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        );
      })}
      <circle cx="320" cy="80" r="28" fill="#D4AF37" opacity="0.18" />
      <circle cx="320" cy="80" r="16" fill="#D4AF37" opacity="0.35" />

      {/* Weave / textile pattern rows */}
      {[140, 160, 180, 200, 220, 240].map((y, ri) =>
        Array.from({ length: 10 }).map((_, ci) => {
          const x = 20 + ci * 38;
          const isAlt = (ri + ci) % 2 === 0;
          return (
            <rect
              key={`${ri}-${ci}`}
              x={x}
              y={y}
              width={22}
              height={10}
              rx={3}
              fill={isAlt ? "#D4AF37" : "#0F1D30"}
              opacity={isAlt ? 0.25 : 0.1}
            />
          );
        })
      )}

      {/* Stylized baybayin glyphs (decorative, not literal) */}
      <g opacity="0.12" fill="#0F1D30">
        <ellipse cx="60" cy="60" rx="18" ry="24" />
        <rect x="52" y="84" width="16" height="4" rx="2" />
        <ellipse cx="110" cy="50" rx="14" ry="20" />
        <line x1="110" y1="70" x2="110" y2="90" stroke="#0F1D30" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="155" cy="60" rx="12" ry="18" />
        <ellipse cx="155" cy="88" rx="12" ry="6" />
      </g>

      {/* Waves at bottom */}
      <path
        d="M0 270 Q50 255 100 270 Q150 285 200 270 Q250 255 300 270 Q350 285 400 270 L400 300 L0 300 Z"
        fill="#0F1D30"
        opacity="0.07"
      />
      <path
        d="M0 282 Q50 270 100 282 Q150 294 200 282 Q250 270 300 282 Q350 294 400 282 L400 300 L0 300 Z"
        fill="#D4AF37"
        opacity="0.1"
      />
    </svg>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRipple, setAudioRipple] = useState(false);
  const [entryCount, setEntryCount] = useState<number>(dictionaryEntries.length);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dictionary`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEntryCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) onNavigate("dictionary");
  }

  function handleAudio() {
    if (audioPlaying) return;
    setAudioPlaying(true);
    setAudioRipple(true);
    speakText(wordOfTheDay.butuanon);
    setTimeout(() => setAudioRipple(false), 700);
    setTimeout(() => setAudioPlaying(false), 2000);
  }

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--river-blue) 0%, #162942 60%, #1B3150 100%)",
        }}
        className="relative overflow-hidden py-20 px-4"
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #D4AF37, #D4AF37 2px, transparent 2px, transparent 30px)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-[var(--golden-heritage)]/35 bg-white/5 shadow-md backdrop-blur-xs">
            <img src="/logo.png" alt="Balanghay Logo" className="w-6 h-6 rounded-full object-cover border border-[var(--golden-heritage)]" />
            <span style={{ color: "#CBD5E8" }} className="text-xs font-semibold tracking-wide">
              Balanghay Heritage · Butuanon AI Dictionary
            </span>
          </div>
          <h1 style={{ color: "var(--ivory-sail)" }} className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Discover the <span style={{ color: "var(--golden-heritage)" }}>Butuanon</span> Language
          </h1>
          <p style={{ color: "#A0B2D6" }} className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Search thousands of Butuanon words, get AI-powered translations, and hear native pronunciations — preserving a living heritage.
          </p>
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 z-10" color="#A0B2D6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a Butuanon or English word..."
                style={{ backgroundColor: "#FFFDF9", color: "#1E293B", fontFamily: "Poppins, sans-serif" }}
                className="w-full pl-12 pr-36 py-4 rounded-2xl text-sm outline-none shadow-xl placeholder:text-gray-400 border border-amber-900/10"
              />
              <button
                type="submit"
                style={{ backgroundColor: "var(--golden-heritage)", color: "#0F1D30", fontFamily: "Poppins, sans-serif" }}
                className="absolute right-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Madiyaw nga hinaat", "Gugma", "Daga", "Balay"].map((word) => (
              <button
                key={word}
                onClick={() => { setSearchQuery(word); onNavigate("dictionary"); }}
                style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#CBD5E8", borderColor: "rgba(255,255,255,0.1)" }}
                className="px-3 py-1.5 rounded-full text-xs border hover:bg-white/15 transition-all"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Word of the Day — prominent */}
      <section style={{ backgroundColor: "var(--background)" }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-1.5 h-6 rounded-full" />
            <h2 style={{ color: "var(--river-blue)" }} className="text-xl font-bold">Word of the Day</h2>
          </div>

          {/* Card */}
          <div
            style={{ backgroundColor: "var(--river-blue)" }}
            className="rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Illustration layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute right-0 top-0 w-72 h-full opacity-30">
                <PhilippineIllustration />
              </div>
            </div>

            {/* Header bar */}
            <div
              style={{ borderBottomColor: "rgba(255,255,255,0.08)" }}
              className="border-b px-6 sm:px-10 py-4 flex items-center justify-between relative z-10"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: "var(--golden-heritage)" }} />
                <span style={{ color: "#A0B2D6" }} className="text-xs font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span
                style={{ backgroundColor: "rgba(212, 175, 55, 0.2)", color: "var(--golden-heritage)" }}
                className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
              >
                {wordOfTheDay.partOfSpeech}
              </span>
            </div>

            {/* Main content */}
            <div className="px-6 sm:px-10 pt-10 pb-8 relative z-10 grid sm:grid-cols-5 gap-8 items-center">
              {/* Left: word info */}
              <div className="sm:col-span-3">
                <p style={{ color: "#A0B2D6" }} className="text-xs mb-2 uppercase tracking-widest font-semibold">
                  Butuanon
                </p>
                <h3 style={{ color: "var(--ivory-sail)" }} className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
                  {wordOfTheDay.butuanon}
                </h3>
                <p style={{ color: "#A0B2D6" }} className="text-sm mb-6">
                  /{wordOfTheDay.pronunciation}/
                </p>

                {/* Audio button — large and prominent */}
                <button
                  onClick={handleAudio}
                  className="relative group flex items-center gap-3"
                  aria-label="Play pronunciation"
                >
                  {/* Ripple rings */}
                  {audioRipple && (
                    <>
                      <span
                        className="absolute rounded-full animate-ping"
                        style={{
                          backgroundColor: "rgba(212, 175, 55, 0.35)",
                          width: 56,
                          height: 56,
                          top: 0,
                          left: 0,
                        }}
                      />
                      <span
                        className="absolute rounded-full"
                        style={{
                          backgroundColor: "rgba(212, 175, 55, 0.15)",
                          width: 56,
                          height: 56,
                          top: 0,
                          left: 0,
                          animation: "ping 0.9s ease-out 0.2s",
                        }}
                      />
                    </>
                  )}
                  <div
                    style={{
                      backgroundColor: "var(--golden-heritage)",
                      color: "#0F1D30",
                      width: 56,
                      height: 56,
                    }}
                    className="rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                  >
                    <Volume2 size={22} color="#0F1D30" />
                  </div>
                  <span style={{ color: "#CBD5E8" }} className="text-sm font-semibold">
                    {audioPlaying ? "Playing..." : "Hear pronunciation"}
                  </span>
                </button>
              </div>

              {/* Right: translation + example */}
              <div className="sm:col-span-2 space-y-4">
                <div
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.08)" }}
                  className="rounded-2xl border p-5"
                >
                  <p style={{ color: "#A0B2D6" }} className="text-xs uppercase tracking-widest mb-1 font-semibold">English</p>
                  <p style={{ color: "var(--golden-heritage)" }} className="text-2xl font-bold">
                    {wordOfTheDay.english}
                  </p>
                </div>
                <div
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}
                  className="rounded-2xl border p-5"
                >
                  <p style={{ color: "#A0B2D6" }} className="text-xs uppercase tracking-widest mb-2 font-semibold">Example</p>
                  <p style={{ color: "#CBD5E8" }} className="text-sm leading-relaxed">
                    {wordOfTheDay.example}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom accent strip */}
            <div
              style={{ background: "linear-gradient(90deg, var(--golden-heritage), #F59E0B, var(--golden-heritage))" }}
              className="h-1"
            />
          </div>
        </div>
      </section>

      {/* Featured Words */}
      <section style={{ backgroundColor: "#EFE6D8" }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-1.5 h-6 rounded-full" />
              <h2 style={{ color: "var(--river-blue)" }} className="text-xl font-bold">Explore Common Words</h2>
            </div>
            <button
              onClick={() => onNavigate("dictionary")}
              style={{ color: "var(--river-blue)" }}
              className="flex items-center gap-1 text-sm font-bold hover:opacity-80 transition-opacity"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {featuredWords.map((word) => (
              <button
                key={word.butuanon}
                onClick={() => onNavigate("dictionary")}
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-xl border p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <p style={{ color: "var(--river-blue)" }} className="font-bold text-base mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {word.butuanon}
                </p>
                <p style={{ color: "#6B7A99" }} className="text-xs mb-2">{word.english}</p>
                <span style={{ backgroundColor: "rgba(28,43,74,0.07)", color: "#6B7A99" }} className="text-xs px-2 py-0.5 rounded-full font-medium">
                  {word.pos}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Intro */}
      <section style={{ backgroundColor: "var(--background)" }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-1.5 h-6 rounded-full" />
              <h2 style={{ color: "var(--river-blue)" }} className="text-xl font-bold">About Butuanon</h2>
            </div>
            <p style={{ color: "#334155" }} className="text-sm leading-relaxed mb-4">
              Butuanon is an Austronesian language spoken primarily in Butuan City, the capital of Agusan del Norte in Mindanao, Philippines. It belongs to the Visayan language family and carries centuries of cultural heritage from the ancient Kingdom of Butuan.
            </p>
            <p style={{ color: "#334155" }} className="text-sm leading-relaxed mb-6">
              This platform was developed to document, digitize, and share the Butuanon language with learners, researchers, and the global Filipino diaspora — ensuring this living language thrives into the future.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate("dictionary")}
                style={{ backgroundColor: "var(--river-blue)", color: "var(--ivory-sail)" }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                Browse Dictionary
              </button>
              <button
                onClick={() => onNavigate("about")}
                style={{ backgroundColor: "transparent", color: "var(--river-blue)", borderColor: "var(--river-blue)" }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border hover:bg-black/5 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, label: "Dictionary Entries", value: `${entryCount}+` },
              { icon: Mic, label: "Audio Pronunciations", value: `${entryCount}+` },
              { icon: Globe, label: "Supported Languages", value: "Butuanon & English" },
              { icon: Search, label: "Search Capability", value: "Real-Time AI" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-2xl border p-5 text-center shadow-sm"
              >
                <div style={{ backgroundColor: "rgba(212,175,55,0.15)" }} className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} style={{ color: "var(--river-blue)" }} />
                </div>
                <p style={{ color: "var(--river-blue)" }} className="text-xl font-bold mb-1">{value}</p>
                <p style={{ color: "#6B7A99" }} className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
