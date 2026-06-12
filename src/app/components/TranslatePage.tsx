import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Volume2, Trash2, Clock, Sparkles } from "lucide-react";

const MOCK_TRANSLATIONS: Record<string, string> = {
  "maayong buntag": "Good morning",
  "good morning": "Maayong buntag",
  "maayong hapon": "Good afternoon",
  "good afternoon": "Maayong hapon",
  "kumusta ka": "How are you?",
  "how are you": "Kumusta ka?",
  "salamat": "Thank you",
  "thank you": "Salamat",
  "palihug": "Please",
  "please": "Palihug",
  "oo": "Yes",
  "yes": "Oo",
  "dili": "No",
  "no": "Dili",
  "gugma": "Love",
  "love": "Gugma",
  "balay": "House",
  "house": "Balay",
  "daga": "Land / Earth",
  "land": "Daga",
  "tubig": "Water",
  "water": "Tubig",
  "adlaw": "Sun / Day",
  "sun": "Adlaw",
  "tawo": "Person / People",
  "person": "Tawo",
  "pamilya": "Family",
  "family": "Pamilya",
};

interface Translation {
  id: number;
  from: string;
  to: string;
  sourceText: string;
  result: string;
  direction: "but-en" | "en-but";
  timestamp: Date;
}

function speakText(text: string, lang = "fil-PH") {
  if ("speechSynthesis" in window) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
}

function getMockTranslation(text: string, direction: "but-en" | "en-but"): string {
  const lower = text.trim().toLowerCase();
  if (MOCK_TRANSLATIONS[lower]) return MOCK_TRANSLATIONS[lower];
  if (direction === "but-en") {
    return `[Translation of "${text}" — This is an AI-generated result. For demo purposes, try common words like "gugma", "balay", or "salamat".]`;
  }
  return `[Paghubad sa "${text}" — Kini usa ka AI-generated nga resulta. Para sa demo, sulayi ang mga komon nga pulong sama sa "love", "house", o "thank you".]`;
}

function TranslatingAnimation({ direction }: { direction: "but-en" | "en-but" }) {
  const [dots, setDots] = useState(0);
  const [step, setStep] = useState(0);
  const steps = ["Tokenizing input...", "Analyzing syntax...", "Generating translation...", "Finalizing output..."];
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setDots((d) => (d + 1) % 4);
      setStep((s) => (s + 1) % steps.length);
    }, 500);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  return (
    <div className="h-36 flex flex-col items-center justify-center gap-4">
      {/* Animated word-flow graphic */}
      <div className="flex items-center gap-3">
        <div
          style={{ backgroundColor: "rgba(28,43,74,0.1)", color: "#1C2B4A" }}
          className="px-3 py-1 rounded-lg text-xs font-semibold"
        >
          {direction === "but-en" ? "BUT" : "ENG"}
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#C4622D",
                opacity: dots === i ? 1 : 0.25,
                width: 6,
                height: 6,
                borderRadius: "50%",
                transition: "opacity 0.2s",
              }}
            />
          ))}
        </div>
        <div
          style={{ backgroundColor: "rgba(196,98,45,0.15)", color: "#C4622D" }}
          className="px-3 py-1 rounded-lg text-xs font-semibold"
        >
          {direction === "but-en" ? "ENG" : "BUT"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Sparkles size={14} color="#C4622D" className="animate-pulse" />
        <p style={{ color: "#8B9DC3" }} className="text-xs font-medium">
          {steps[step]}
        </p>
      </div>
      {/* Progress bar */}
      <div style={{ backgroundColor: "#EDE6DA" }} className="w-40 h-1.5 rounded-full overflow-hidden">
        <div
          style={{ backgroundColor: "#C4622D" }}
          className="h-full rounded-full animate-pulse"
          // width cycles via animation
        />
      </div>
    </div>
  );
}

export function TranslatePage() {
  const [direction, setDirection] = useState<"but-en" | "en-but">("but-en");
  const [sourceText, setSourceText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [playingSource, setPlayingSource] = useState(false);
  const [playingResult, setPlayingResult] = useState(false);
  const [history, setHistory] = useState<Translation[]>([
    {
      id: 1,
      from: "Butuanon",
      to: "English",
      sourceText: "Maayong buntag",
      result: "Good morning",
      direction: "but-en",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: 2,
      from: "English",
      to: "Butuanon",
      sourceText: "Thank you",
      result: "Salamat",
      direction: "en-but",
      timestamp: new Date(Date.now() - 300000),
    },
  ]);

  function swapDirection() {
    setDirection(direction === "but-en" ? "en-but" : "but-en");
    setSourceText(result);
    setResult(sourceText);
  }

  function handleTranslate() {
    if (!sourceText.trim()) return;
    setLoading(true);

    fetch("http://localhost:8000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sourceText,
        direction: direction,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        setResult(data.result);
        setLoading(false);
        setHistory((prev) => [
          {
            id: Date.now(),
            from: direction === "but-en" ? "Butuanon" : "English",
            to: direction === "but-en" ? "English" : "Butuanon",
            sourceText,
            result: data.result,
            direction,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
      })
      .catch((err) => {
        console.warn("Backend translation failed, falling back to mock client", err);
        // Fallback simulation
        const translated = getMockTranslation(sourceText, direction);
        setResult(translated);
        setLoading(false);
        setHistory((prev) => [
          {
            id: Date.now(),
            from: direction === "but-en" ? "Butuanon" : "English",
            to: direction === "but-en" ? "English" : "Butuanon",
            sourceText,
            result: translated,
            direction,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
      });
  }

  function handleSourceAudio() {
    setPlayingSource(true);
    speakText(sourceText, direction === "but-en" ? "fil-PH" : "en-US");
    setTimeout(() => setPlayingSource(false), 1500);
  }

  function handleResultAudio() {
    setPlayingResult(true);
    speakText(result, direction === "but-en" ? "en-US" : "fil-PH");
    setTimeout(() => setPlayingResult(false), 1500);
  }

  function timeAgo(date: Date) {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  }

  return (
    <div
      style={{ backgroundColor: "#F7F2EB", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <div style={{ backgroundColor: "#1C2B4A" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 style={{ color: "#F7F2EB" }} className="text-2xl font-bold mb-1">
            AI Translator
          </h1>
          <p style={{ color: "#8B9DC3" }} className="text-sm">
            Translate between Butuanon and English using AI-assisted technology.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Translator Card */}
        <div
          style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
          className="rounded-2xl border shadow-md overflow-hidden mb-6"
        >
          {/* Language labels + swap */}
          <div
            style={{
              backgroundColor: "#1C2B4A",
              borderBottomColor: "rgba(255,255,255,0.08)",
            }}
            className="flex items-center border-b"
          >
            <div className="flex-1 px-5 py-3 text-center">
              <span
                style={{ color: direction === "but-en" ? "#C4622D" : "#8B9DC3" }}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                {direction === "but-en" ? "Butuanon" : "English"}
              </span>
            </div>
            <button
              onClick={swapDirection}
              style={{ backgroundColor: "rgba(196, 98, 45, 0.15)", color: "#C4622D" }}
              className="mx-3 p-2 rounded-lg hover:bg-[#C4622D]/25 transition-all"
            >
              <ArrowLeftRight size={16} />
            </button>
            <div className="flex-1 px-5 py-3 text-center">
              <span
                style={{ color: direction === "but-en" ? "#8B9DC3" : "#C4622D" }}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                {direction === "but-en" ? "English" : "Butuanon"}
              </span>
            </div>
          </div>

          {/* Text areas */}
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(28,43,74,0.08)]">
            {/* Source */}
            <div className="p-5">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleTranslate();
                }}
                placeholder={
                  direction === "but-en"
                    ? "Enter Butuanon text..."
                    : "Enter English text..."
                }
                style={{
                  color: "#1C2B4A",
                  fontFamily: "Poppins, sans-serif",
                  resize: "none",
                }}
                className="w-full h-36 text-sm outline-none bg-transparent placeholder:text-gray-400"
              />
              <div className="flex items-center justify-between mt-3">
                <span style={{ color: "#8B9DC3" }} className="text-xs">
                  {sourceText.length} chars · Ctrl+Enter to translate
                </span>
                {sourceText && (
                  <button
                    onClick={handleSourceAudio}
                    style={{
                      backgroundColor: playingSource
                        ? "#C4622D"
                        : "rgba(196, 98, 45, 0.1)",
                      color: playingSource ? "#FFFDF9" : "#C4622D",
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <Volume2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Result */}
            <div className="p-5 relative" style={{ backgroundColor: "#F7F2EB" }}>
              {loading ? (
                <TranslatingAnimation direction={direction} />
              ) : (
                <div className="h-36 overflow-y-auto">
                  <p
                    style={{
                      color: result ? "#1C2B4A" : "#B0BAC8",
                      fontFamily: "Poppins, sans-serif",
                    }}
                    className="text-sm leading-relaxed"
                  >
                    {result || "Translation will appear here..."}
                  </p>
                </div>
              )}
              {result && (
                <div className="flex items-center justify-between mt-3">
                  <span style={{ color: "#8B9DC3" }} className="text-xs">
                    AI-generated translation
                  </span>
                  <button
                    onClick={handleResultAudio}
                    style={{
                      backgroundColor: playingResult
                        ? "#C4622D"
                        : "rgba(196, 98, 45, 0.1)",
                      color: playingResult ? "#FFFDF9" : "#C4622D",
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Translate button */}
          <div
            style={{ borderTopColor: "rgba(28,43,74,0.08)" }}
            className="border-t p-4 flex items-center gap-4"
          >
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || loading}
              style={{
                backgroundColor:
                  sourceText.trim() && !loading ? "#C4622D" : "#EDE6DA",
                color: sourceText.trim() && !loading ? "#FFFDF9" : "#8B9DC3",
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:cursor-not-allowed"
            >
              {loading ? "Translating..." : "Translate"}
            </button>
            {sourceText && (
              <button
                onClick={() => {
                  setSourceText("");
                  setResult("");
                }}
                style={{ color: "#8B9DC3" }}
                className="p-2 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* AI disclaimer */}
        <div
          style={{
            backgroundColor: "rgba(196, 98, 45, 0.08)",
            borderColor: "rgba(196, 98, 45, 0.2)",
          }}
          className="rounded-xl border px-4 py-3 mb-8 flex items-start gap-3"
        >
          <span style={{ color: "#C4622D" }} className="text-lg leading-none mt-0.5">
            ⚠
          </span>
          <p style={{ color: "#7A4020" }} className="text-xs leading-relaxed">
            <strong>AI-generated translation — may not be perfect.</strong> The Butuanon language
            has nuanced dialects and expressions. Always verify important translations with a
            native speaker or language expert.
          </p>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{ backgroundColor: "#C4622D" }}
                className="w-1 h-5 rounded-full"
              />
              <h2 style={{ color: "#1C2B4A" }} className="text-base font-semibold">
                Recent Translations
              </h2>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDirection(item.direction);
                    setSourceText(item.sourceText);
                    setResult(item.result);
                  }}
                  style={{
                    backgroundColor: "#FFFDF9",
                    borderColor: "rgba(28,43,74,0.08)",
                  }}
                  className="w-full text-left rounded-xl border p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      style={{
                        backgroundColor: "rgba(28,43,74,0.07)",
                        color: "#6B7A99",
                      }}
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {item.from} → {item.to}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Clock size={10} color="#8B9DC3" />
                      <span style={{ color: "#8B9DC3" }} className="text-xs">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: "#1C2B4A" }} className="text-sm font-medium mb-1">
                    {item.sourceText}
                  </p>
                  <p style={{ color: "#C4622D" }} className="text-sm">
                    {item.result}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
