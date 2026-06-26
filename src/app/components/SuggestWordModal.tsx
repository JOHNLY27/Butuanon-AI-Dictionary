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
      alert("Could not access your microphone. Please make sure microphone access is enabled in your browser.");
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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C4622D", "#1C2B4A", "#F7F2EB"],
      });

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
      }, 1500);

    } catch (err) {
      console.warn("Backend suggestion post failed, saving to local storage fallback", err);
      
      // Fallback local storage saving
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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C4622D", "#1C2B4A", "#F7F2EB"],
      });

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
      }, 1500);
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
    deleteRecording();
    setIsSubmitted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent style={{ backgroundColor: "#FFFDF9", fontFamily: "Poppins, sans-serif" }} className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-none p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle style={{ color: "#1C2B4A" }} className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-[#C4622D]" />
            Suggest a New Word
          </DialogTitle>
          <DialogDescription style={{ color: "#6B7A99" }} className="text-xs">
            Contribute to the preservation of Butuanon. Submitted words will be reviewed by native speakers and academics.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <div style={{ backgroundColor: "rgba(80, 148, 90, 0.1)", color: "#2F6B38" }} className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={36} />
            </div>
            <h3 style={{ color: "#1C2B4A" }} className="text-lg font-bold mb-2">Thank you!</h3>
            <p style={{ color: "#6B7A99" }} className="text-sm max-w-sm">
              Your suggestion for <strong>"{butuanon}"</strong> has been queued. It will appear under "My Contributions" shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Butuanon Word */}
              <div className="space-y-1">
                <label htmlFor="suggest-butuanon" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Butuanon Word <span className="text-[#C4622D]">*</span></label>
                <input
                  id="suggest-butuanon"
                  name="butuanon"
                  type="text"
                  required
                  value={butuanon}
                  onChange={(e) => setButuanon(e.target.value)}
                  placeholder="e.g. Daga"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>

              {/* English Meaning */}
              <div className="space-y-1">
                <label htmlFor="suggest-english" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">English Meaning <span className="text-[#C4622D]">*</span></label>
                <input
                  id="suggest-english"
                  name="english"
                  type="text"
                  required
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  placeholder="e.g. Land / Earth"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Part of Speech */}
              <div className="space-y-1">
                <label htmlFor="suggest-pos" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Part of Speech</label>
                <select
                  id="suggest-pos"
                  name="pos"
                  value={pos}
                  onChange={(e) => setPos(e.target.value)}
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors appearance-none cursor-pointer"
                >
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="phrase">Phrase</option>
                </select>
              </div>

              {/* Pronunciation */}
              <div className="space-y-1">
                <label htmlFor="suggest-pronunciation" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Pronunciation Guide</label>
                <input
                  id="suggest-pronunciation"
                  name="pronunciation"
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="e.g. DAH-gah"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            {/* Definition */}
            <div className="space-y-1">
              <label htmlFor="suggest-definition" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Definition <span className="text-[#C4622D]">*</span></label>
              <textarea
                id="suggest-definition"
                name="definition"
                required
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Write a clear definition of the word in English..."
                rows={3}
                style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)", resize: "none" }}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
              />
            </div>

            {/* Example Sentences */}
            <div className="border border-[rgba(28,43,74,0.05)] rounded-2xl p-4 bg-[#F7F2EB]/40 space-y-3">
              <p style={{ color: "#1C2B4A" }} className="text-xs font-bold uppercase tracking-wider">Example Usage (Optional)</p>
              <div className="space-y-2">
                <input
                  id="suggest-example-butuanon"
                  name="exampleButuanon"
                  type="text"
                  value={exampleButuanon}
                  onChange={(e) => setExampleButuanon(e.target.value)}
                  placeholder="Butuanon Example Sentence..."
                  style={{ backgroundColor: "#FFFDF9", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
                <input
                  id="suggest-example-english"
                  name="exampleEnglish"
                  type="text"
                  value={exampleEnglish}
                  onChange={(e) => setExampleEnglish(e.target.value)}
                  placeholder="English Example Translation..."
                  style={{ backgroundColor: "#FFFDF9", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            {/* Audio Voice Recorder */}
            <div style={{ backgroundColor: "#F7F2EB" }} className="rounded-2xl p-4 border border-[rgba(28,43,74,0.08)] flex flex-col items-center justify-center">
              <span style={{ color: "#1C2B4A" }} className="text-xs font-semibold mb-2 block w-full text-left">Record Pronunciation Audio</span>

              {isRecording ? (
                <div className="flex flex-col items-center gap-2 py-2 w-full">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span style={{ color: "#1C2B4A" }} className="text-sm font-semibold tracking-wider">{formatTime(recordingTime)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    style={{ backgroundColor: "#1C2B4A" }}
                    className="flex items-center gap-2 text-white px-5 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Square size={12} fill="white" />
                    Stop Recording
                  </button>
                </div>
              ) : audioUrl ? (
                <div className="flex items-center justify-between w-full bg-[#FFFDF9] border border-[rgba(28,43,74,0.08)] rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      style={{ backgroundColor: isPlaying ? "#C4622D" : "rgba(196,98,45,0.12)", color: "#C4622D" }}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause size={14} fill="#C4622D" /> : <Play size={14} className="ml-0.5" fill="#C4622D" />}
                    </button>
                    <div>
                      <span style={{ color: "#1C2B4A" }} className="text-xs font-semibold block">Pronunciation Playback</span>
                      <span style={{ color: "#8B9DC3" }} className="text-[10px]">Audio Recorded Successfully</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={deleteRecording}
                    style={{ color: "#8B9DC3" }}
                    className="p-2 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  style={{ backgroundColor: "rgba(196, 98, 45, 0.1)", color: "#C4622D" }}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-[#C4622D]/40 hover:bg-[#C4622D]/15 transition-all group"
                >
                  <Mic size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Start Recording Pronunciation</span>
                </button>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-[rgba(28,43,74,0.08)]">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
                style={{ color: "#6B7A99" }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!butuanon.trim() || !english.trim() || !definition.trim()}
                style={{
                  backgroundColor: butuanon.trim() && english.trim() && definition.trim() ? "#C4622D" : "#EDE6DA",
                  color: butuanon.trim() && english.trim() && definition.trim() ? "#FFFDF9" : "#8B9DC3",
                }}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:cursor-not-allowed hover:opacity-95 transition-all"
              >
                <UploadCloud size={14} />
                Submit Suggestion
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
