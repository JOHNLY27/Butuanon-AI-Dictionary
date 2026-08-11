import React, { useState, useRef, useEffect } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { Mic, Square, Play, Pause, Trash2, Sparkles, CheckCircle, Volume2, UploadCloud, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { API_BASE_URL } from "../config";

interface SuggestWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function SuggestWordModal({ isOpen, onClose, onSubmitSuccess }: SuggestWordModalProps) {
  // Form fields
  const [butuanon, setButuanon] = useState("");
  const [english, setEnglish] = useState("");
  const [pos, setPos] = useState("noun");
  const [pronunciation, setPronunciation] = useState("");
  const [definition, setDefinition] = useState("");
  const [exampleButuanon, setExampleButuanon] = useState("");
  const [exampleEnglish, setExampleEnglish] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Clean up recording timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Could not access your microphone. Please allow microphone access in your web browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlaybackRef.current) {
      audioPlaybackRef.current = new Audio(audioUrl);
      audioPlaybackRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlaybackRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlaybackRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        resolve("");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!butuanon.trim() || !english.trim() || !definition.trim()) return;

    try {
      const formData = new FormData();
      formData.append("butuanon", butuanon.trim());
      formData.append("english", english.trim());
      formData.append("pos", pos);
      formData.append("pronunciation", pronunciation.trim() || butuanon.trim());
      formData.append("definition", definition.trim());
      if (exampleButuanon.trim()) formData.append("exampleButuanon", exampleButuanon.trim());
      if (exampleEnglish.trim()) formData.append("exampleEnglish", exampleEnglish.trim());

      if (audioUrl) {
        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();
        formData.append("audio", audioBlob, "pronunciation.webm");
      }

      const res = await fetch(`${API_BASE_URL}/api/suggest`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Suggest API returned non-200");

      setIsSubmitted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#D4AF37", "#0F1D30", "#FAF6EE"],
      });

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
      }, 1800);

    } catch (err) {
      console.warn("Backend suggestion post failed, saving to local storage fallback", err);
      
      let base64Audio = "";
      if (audioUrl) {
        base64Audio = await convertBlobToBase64(audioUrl);
      }

      const newSuggestion = {
        id: Date.now(),
        butuanon: butuanon.trim(),
        english: english.trim(),
        pos,
        pronunciation: pronunciation.trim() || butuanon.trim(),
        definition: definition.trim(),
        exampleButuanon: exampleButuanon.trim(),
        exampleEnglish: exampleEnglish.trim(),
        audio: base64Audio,
        verified: "pending",
        rating: 0,
        timestamp: new Date().toISOString(),
      };

      const saved = localStorage.getItem("pending_contributions");
      const contributions = saved ? JSON.parse(saved) : [];
      contributions.unshift(newSuggestion);
      localStorage.setItem("pending_contributions", JSON.stringify(contributions));

      setIsSubmitted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#D4AF37", "#0F1D30", "#FAF6EE"],
      });

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
      }, 1800);
    }
  };

  const resetForm = () => {
    setButuanon("");
    setEnglish("");
    setPos("noun");
    setPronunciation("");
    setDefinition("");
    setExampleButuanon("");
    setExampleEnglish("");
    setShowOptionalFields(false);
    deleteRecording();
    setIsSubmitted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent style={{ backgroundColor: "#FFFDF9", fontFamily: "Poppins, sans-serif" }} className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-[var(--golden-heritage)] p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="mb-4 text-left border-b border-amber-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles size={24} style={{ color: "var(--golden-heritage)" }} />
            </div>
            <div>
              <DialogTitle style={{ color: "var(--river-blue)" }} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Suggest a Word
              </DialogTitle>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Contribute a new word to the Butuanon AI Dictionary
              </p>
            </div>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle size={48} />
            </div>
            <h3 style={{ color: "var(--river-blue)" }} className="text-2xl sm:text-3xl font-black">
              Thank You!
            </h3>
            <p style={{ color: "#334155" }} className="text-base sm:text-lg max-w-md font-medium leading-relaxed">
              Your suggestion for <strong className="text-amber-700 font-bold">"{butuanon}"</strong> has been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Quick Guide Banner */}
            <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
              <span className="text-xl shrink-0">💡</span>
              <div className="text-xs sm:text-sm text-amber-950 font-medium leading-normal">
                <strong className="font-bold text-amber-900">Quick Guide:</strong> Fill in the Butuanon Word, English Meaning, and Description. You can also record your voice!
              </div>
            </div>

            {/* Word & Meaning Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Butuanon Word */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 min-h-[28px]">
                  <label htmlFor="suggest-butuanon" style={{ color: "var(--river-blue)" }} className="text-sm sm:text-base font-bold whitespace-nowrap">
                    Butuanon Word
                  </label>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">
                    Required
                  </span>
                </div>
                <input
                  id="suggest-butuanon"
                  name="butuanon"
                  type="text"
                  required
                  value={butuanon}
                  onChange={(e) => setButuanon(e.target.value)}
                  placeholder="e.g. Daga"
                  style={{ color: "#0F1D30" }}
                  className="w-full text-base font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* English Meaning */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 min-h-[28px]">
                  <label htmlFor="suggest-english" style={{ color: "var(--river-blue)" }} className="text-sm sm:text-base font-bold whitespace-nowrap">
                    English Meaning
                  </label>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">
                    Required
                  </span>
                </div>
                <input
                  id="suggest-english"
                  name="english"
                  type="text"
                  required
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  placeholder="e.g. Land / Earth"
                  style={{ color: "#0F1D30" }}
                  className="w-full text-base font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 min-h-[28px]">
                <label htmlFor="suggest-definition" style={{ color: "var(--river-blue)" }} className="text-sm sm:text-base font-bold whitespace-nowrap">
                  Description or Meaning
                </label>
                <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">
                  Required
                </span>
              </div>
              <textarea
                id="suggest-definition"
                name="definition"
                required
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Write a clear description of what this word means..."
                rows={3}
                style={{ color: "#0F1D30", resize: "none" }}
                className="w-full text-base font-medium px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Voice Audio Recorder */}
            <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Record Voice Pronunciation</span>
                <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">Optional</span>
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center gap-3 py-3 bg-white rounded-xl border-2 border-red-400 p-3 shadow-md">
                  <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-200">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                    </span>
                    <span className="text-base font-extrabold text-red-700 tracking-wider">
                      Recording: {formatTime(recordingTime)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-xl text-base font-bold shadow transition-all active:scale-95"
                  >
                    <Square size={18} fill="white" />
                    Stop Recording
                  </button>
                </div>
              ) : audioUrl ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-2 border-emerald-400 rounded-xl p-3.5 shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-500 flex items-center justify-center shadow transition-all shrink-0"
                    >
                      {isPlaying ? <Pause size={20} fill="#1e293b" /> : <Play size={20} className="ml-0.5" fill="#1e293b" />}
                    </button>
                    <div className="text-left">
                      <span className="text-base font-bold text-slate-900 block">
                        {isPlaying ? "Playing Voice..." : "Voice Recorded"}
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold block">
                        ✓ Click play to listen back
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                    Delete & Re-record
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-500 border-2 border-amber-500 text-slate-950 font-bold text-base shadow-sm transition-all active:scale-98"
                >
                  <Mic size={20} className="text-slate-900" />
                  <span>Tap to Record Voice</span>
                </button>
              )}
            </div>

            {/* Optional Advanced Details Toggle */}
            <div className="border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full flex items-center justify-between text-left py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <span>➕ Add Category or Example Sentence (Optional)</span>
                <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                  {showOptionalFields ? "Hide" : "Show"}
                </span>
              </button>

              {showOptionalFields && (
                <div className="mt-3 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Part of Speech */}
                    <div className="space-y-1">
                      <label htmlFor="suggest-pos" className="text-sm font-bold text-slate-800">
                        Word Category
                      </label>
                      <select
                        id="suggest-pos"
                        name="pos"
                        value={pos}
                        onChange={(e) => setPos(e.target.value)}
                        className="w-full text-base font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="noun">Noun (Pangngalan)</option>
                        <option value="verb">Verb (Pandiwa)</option>
                        <option value="adjective">Adjective (Pang-uri)</option>
                        <option value="adverb">Adverb (Pang-abay)</option>
                        <option value="phrase">Phrase / Idiom</option>
                        <option value="pronoun">Pronoun</option>
                        <option value="preposition">Preposition</option>
                        <option value="conjunction">Conjunction</option>
                        <option value="interjection">Interjection</option>
                      </select>
                    </div>

                    {/* Pronunciation */}
                    <div className="space-y-1">
                      <label htmlFor="suggest-pronunciation" className="text-sm font-bold text-slate-800">
                        Pronunciation Guide
                      </label>
                      <input
                        id="suggest-pronunciation"
                        name="pronunciation"
                        type="text"
                        value={pronunciation}
                        onChange={(e) => setPronunciation(e.target.value)}
                        placeholder="e.g. DAH-gah"
                        className="w-full text-base font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Example Sentences */}
                  <div className="space-y-2 pt-1">
                    <label className="text-sm font-bold text-slate-800 block">
                      Example Sentence
                    </label>
                    <input
                      id="suggest-example-butuanon"
                      name="exampleButuanon"
                      type="text"
                      value={exampleButuanon}
                      onChange={(e) => setExampleButuanon(e.target.value)}
                      placeholder="Butuanon Example Sentence..."
                      className="w-full text-base font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-amber-500 transition-colors"
                    />
                    <input
                      id="suggest-example-english"
                      name="exampleEnglish"
                      type="text"
                      value={exampleEnglish}
                      onChange={(e) => setExampleEnglish(e.target.value)}
                      placeholder="English Translation..."
                      className="w-full text-base font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-3 border-t-2 border-slate-200">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-base font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!butuanon.trim() || !english.trim() || !definition.trim()}
                style={{
                  backgroundColor: butuanon.trim() && english.trim() && definition.trim() ? "var(--golden-heritage)" : "#E2E8F0",
                  color: butuanon.trim() && english.trim() && definition.trim() ? "#0F1D30" : "#94A3B8",
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-base font-black shadow-md disabled:cursor-not-allowed hover:opacity-95 transition-all order-1 sm:order-2"
              >
                <UploadCloud size={18} />
                <span>Submit Word</span>
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

