import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Plus, 
  Play, 
  Pause, 
  Search, 
  Award, 
  Volume2, 
  BookOpen, 
  Users, 
  Layers, 
  AlertTriangle, 
  Activity, 
  Sparkles,
  CheckCircle,
  FileText,
  Mic,
  Square,
  UploadCloud
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { API_BASE_URL } from "../config";

interface AdminPageProps {
  user: any;
}

export function AdminPage({ user }: AdminPageProps) {
  // Navigation tabs: 'contributions' | 'dictionary' | 'add' | 'stats'
  const [activeTab, setActiveTab] = useState<"contributions" | "dictionary" | "add" | "stats">("contributions");
  
  // Data lists
  const [contributions, setContributions] = useState<any[]>([]);
  const [dictionary, setDictionary] = useState<any[]>([]);
  
  // Loading states
  const [loadingContribs, setLoadingContribs] = useState(false);
  const [loadingDict, setLoadingDict] = useState(false);
  
  // Search query for dictionary management
  const [dictSearch, setDictSearch] = useState("");
  
  // Active playing audio tracking
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Action Modals State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // New Word Form fields (for Add Word tab)
  const [newButuanon, setNewButuanon] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [newPos, setNewPos] = useState("noun");
  const [newPronunciation, setNewPronunciation] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExampleButuanon, setNewExampleButuanon] = useState("");
  const [newExampleEnglish, setNewExampleEnglish] = useState("");
  const [newVerified, setNewVerified] = useState("native-speaker");
  const [newAudioUrl, setNewAudioUrl] = useState("");

  const token = localStorage.getItem("auth_token");

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Clean up recording timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingPlaybackRef.current) {
        recordingPlaybackRef.current.pause();
        recordingPlaybackRef.current = null;
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
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedAudioUrl(null);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      toast.error("Could not access microphone. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const toggleRecordingPlayback = () => {
    if (!recordedAudioUrl) return;

    if (!recordingPlaybackRef.current) {
      recordingPlaybackRef.current = new Audio(recordedAudioUrl);
      recordingPlaybackRef.current.onended = () => setIsPlayingRecording(false);
    }

    if (isPlayingRecording) {
      recordingPlaybackRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      recordingPlaybackRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  const deleteRecording = () => {
    if (recordingPlaybackRef.current) {
      recordingPlaybackRef.current.pause();
      recordingPlaybackRef.current = null;
    }
    setRecordedAudioUrl(null);
    setIsPlayingRecording(false);
    setRecordingTime(0);
  };

  const uploadRecording = async (target: "add" | "edit" | "review") => {
    if (!recordedAudioUrl || !token) return;
    setIsUploading(true);
    try {
      const audioResponse = await fetch(recordedAudioUrl);
      const audioBlob = await audioResponse.blob();
      const formData = new FormData();
      formData.append("audio", audioBlob, "pronunciation.webm");

      const res = await fetch(`${API_BASE_URL}/api/admin/upload-audio`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Audio upload failed");
      const data = await res.json();
      const uploadedUrl = data.audio_url;

      if (target === "add") {
        setNewAudioUrl(uploadedUrl);
        toast.success("Voice recording uploaded and attached to new word!");
      } else if (target === "edit" && editItem) {
        setEditItem({ ...editItem, audio: uploadedUrl });
        toast.success("Voice recording uploaded and attached to dictionary entry!");
      } else if (target === "review" && reviewItem) {
        setReviewItem({ ...reviewItem, audio_url: uploadedUrl });
        toast.success("Voice recording uploaded and attached to contribution!");
      }
      
      // Clean up the recording state after successful upload
      deleteRecording();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload recording to Supabase Storage.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const renderVoiceRecorder = (target: "add" | "edit" | "review") => {
    return (
      <div style={{ backgroundColor: "#F7F2EB" }} className="rounded-2xl p-4 border border-[rgba(28,43,74,0.06)] mt-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span style={{ color: "#1C2B4A" }} className="text-xs font-bold uppercase tracking-wider block">Record Native Voice Pronunciation</span>
          {isRecording && (
            <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Recording: {formatTime(recordingTime)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {!isRecording && !recordedAudioUrl && (
            <button
              type="button"
              onClick={startRecording}
              style={{ backgroundColor: "rgba(196,98,45,0.08)", color: "#C4622D" }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all"
            >
              <Mic size={14} />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all"
            >
              <Square size={14} fill="#fff" />
              Stop Recording
            </button>
          )}

          {recordedAudioUrl && (
            <>
              <button
                type="button"
                onClick={toggleRecordingPlayback}
                style={{ backgroundColor: isPlayingRecording ? "#C4622D" : "rgba(28,43,74,0.08)", color: isPlayingRecording ? "#FFFDF9" : "#1C2B4A" }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all"
              >
                {isPlayingRecording ? <Pause size={14} fill={isPlayingRecording ? "#FFFDF9" : "#1C2B4A"} /> : <Play size={14} fill="#1C2B4A" />}
                {isPlayingRecording ? "Pause Preview" : "Play Preview"}
              </button>

              <button
                type="button"
                onClick={deleteRecording}
                style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                className="flex items-center justify-center p-2.5 rounded-xl hover:bg-red-50 transition-all"
                title="Delete recording"
              >
                <Trash2 size={14} />
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => uploadRecording(target)}
                style={{ backgroundColor: "#1C2B4A" }}
                className="flex items-center gap-1.5 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all disabled:opacity-50"
              >
                <UploadCloud size={14} />
                {isUploading ? "Uploading..." : "Upload & Attach"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Fetch admin resources on mount and tab change
  useEffect(() => {
    fetchContributions();
    fetchDictionary();
    return () => {
      stopAudio();
    };
  }, []);

  const fetchContributions = async () => {
    if (!token) return;
    setLoadingContribs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/contributions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContributions(data);
      } else {
        toast.error("Failed to load contributions from API.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading contributions.");
    } finally {
      setLoadingContribs(false);
    }
  };

  const fetchDictionary = async () => {
    setLoadingDict(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dictionary`);
      if (res.ok) {
        const data = await res.json();
        // Filter out the 'pending' contributions that endpoints.py merges in
        const trueDictionary = data.filter((item: any) => item.verified !== "pending");
        setDictionary(trueDictionary);
      } else {
        toast.error("Failed to load dictionary entries.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading dictionary.");
    } finally {
      setLoadingDict(false);
    }
  };

  // Audio Playback Helpers
  const playAudio = (url: string, id: string) => {
    if (!url) return;

    if (playingAudioId === id && audioRef.current) {
      // Toggle pause
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }

    stopAudio();

    const audioObj = new Audio(url);
    audioRef.current = audioObj;
    setPlayingAudioId(id);
    audioObj.play().catch(err => {
      console.error(err);
      toast.error("Could not play recorded pronunciation clip.");
      setPlayingAudioId(null);
    });

    audioObj.onended = () => {
      setPlayingAudioId(null);
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudioId(null);
  };

  // Moderation Logic
  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/contributions/${reviewItem.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          butuanon: reviewItem.butuanon,
          english: reviewItem.english,
          pos: reviewItem.pos,
          pronunciation: reviewItem.pronunciation,
          definition: reviewItem.definition,
          example_butuanon: reviewItem.example_butuanon || null,
          example_english: reviewItem.example_english || null,
          verified: reviewItem.verified || "community",
          audio_url: reviewItem.audio_url || null
        })
      });

      if (res.ok) {
        toast.success(`Word "${reviewItem.butuanon}" approved and published successfully!`);
        setIsReviewModalOpen(false);
        setReviewItem(null);
        fetchContributions();
        fetchDictionary();
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to approve contribution.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while approving word.");
    }
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/contributions/${id}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Contribution rejected.");
        fetchContributions();
      } else {
        toast.error("Failed to reject contribution.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    }
  };

  // Direct Dictionary CRUD Operations
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newButuanon.trim() || !newEnglish.trim() || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dictionary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          butuanon: newButuanon.trim(),
          english: newEnglish.trim(),
          pos: newPos,
          pronunciation: newPronunciation.trim() || newButuanon.trim(),
          definition: newDefinition.trim(),
          example_butuanon: newExampleButuanon.trim() || null,
          example_english: newExampleEnglish.trim() || null,
          verified: newVerified,
          rating: 5,
          audio_url: newAudioUrl.trim() || null
        })
      });

      if (res.ok) {
        toast.success("New vocabulary entry added directly!");
        // Clear fields
        setNewButuanon("");
        setNewEnglish("");
        setNewPos("noun");
        setNewPronunciation("");
        setNewDefinition("");
        setNewExampleButuanon("");
        setNewExampleEnglish("");
        setNewAudioUrl("");
        setNewVerified("native-speaker");
        
        fetchDictionary();
        setActiveTab("dictionary");
      } else {
        toast.error("Failed to create entry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating entry.");
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dictionary/${editItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          butuanon: editItem.butuanon,
          english: editItem.english,
          pos: editItem.pos,
          pronunciation: editItem.pronunciation,
          definition: editItem.definition,
          example_butuanon: editItem.exampleButuanon || null,
          example_english: editItem.exampleEnglish || null,
          verified: editItem.verified || "community",
          rating: editItem.rating || 5,
          audio_url: editItem.audio || null
        })
      });

      if (res.ok) {
        toast.success(`Entry "${editItem.butuanon}" updated successfully.`);
        setIsEditModalOpen(false);
        setEditItem(null);
        fetchDictionary();
      } else {
        toast.error("Failed to update dictionary entry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending update request.");
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteItemId || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dictionary/${deleteItemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Dictionary entry deleted permanently.");
        setIsDeleteModalOpen(false);
        setDeleteItemId(null);
        fetchDictionary();
      } else {
        toast.error("Failed to delete entry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending delete request.");
    }
  };

  // Helper Stats Calcs
  const pendingCount = contributions.filter(c => c.status === "pending").length;
  const approvedCount = contributions.filter(c => c.status === "approved").length;
  const rejectedCount = contributions.filter(c => c.status === "rejected").length;
  const dictionaryCount = dictionary.length;

  const filteredDict = dictionary.filter(item => {
    const q = dictSearch.toLowerCase();
    return item.butuanon.toLowerCase().includes(q) || item.english.toLowerCase().includes(q);
  });

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }} className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-right" richColors />

      {/* Dashboard Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ backgroundColor: "#C4622D" }} className="w-2.5 h-6 rounded-full inline-block"></span>
            <h1 style={{ color: "#1C2B4A" }} className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Moderation Console</h1>
          </div>
          <p style={{ color: "#6B7A99" }} className="text-sm">
            Good day, <strong>{user?.username}</strong>. Verify vocabulary suggestions, record audio, and manage the live database.
          </p>
        </div>
        
        {/* Quick info chip */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.06)" }} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-sm">
          <Activity size={18} className="text-[#C4622D] animate-pulse" />
          <div className="text-xs">
            <span style={{ color: "#6B7A99" }} className="block">Status Connection</span>
            <span style={{ color: "#2F6B38" }} className="font-bold block">Secure DB Online</span>
          </div>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} className="p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div style={{ backgroundColor: "rgba(196,98,45,0.08)", color: "#C4622D" }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <span style={{ color: "#6B7A99" }} className="text-[10px] sm:text-xs font-semibold block leading-tight">Total Dictionary</span>
            <span style={{ color: "#1C2B4A" }} className="text-base sm:text-xl font-extrabold block leading-tight mt-0.5">{dictionaryCount} words</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} className="p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div 
            style={{ 
              backgroundColor: pendingCount > 0 ? "rgba(245,158,11,0.08)" : "rgba(28,43,74,0.06)", 
              color: pendingCount > 0 ? "#D97706" : "#6B7A99" 
            }} 
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${pendingCount > 0 ? "animate-pulse" : ""}`}
          >
            <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <span style={{ color: "#6B7A99" }} className="text-[10px] sm:text-xs font-semibold block leading-tight">Pending Approvals</span>
            <span style={{ color: pendingCount > 0 ? "#D97706" : "#1C2B4A" }} className="text-base sm:text-xl font-extrabold block leading-tight mt-0.5">{pendingCount} submissions</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} className="p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div style={{ backgroundColor: "rgba(16,185,129,0.08)", color: "#10B981" }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <span style={{ color: "#6B7A99" }} className="text-[10px] sm:text-xs font-semibold block leading-tight">Approved Suggestions</span>
            <span style={{ color: "#10B981" }} className="text-base sm:text-xl font-extrabold block leading-tight mt-0.5">{approvedCount} entries</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} className="p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#EF4444" }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
            <X size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <span style={{ color: "#6B7A99" }} className="text-[10px] sm:text-xs font-semibold block leading-tight">Rejected Items</span>
            <span style={{ color: "#EF4444" }} className="text-base sm:text-xl font-extrabold block leading-tight mt-0.5">{rejectedCount} entries</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#EBE4D8] border border-[rgba(28,43,74,0.06)] max-w-lg mb-8 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
        <button
          onClick={() => { stopAudio(); setActiveTab("contributions"); }}
          style={{
            backgroundColor: activeTab === "contributions" ? "#FFFDF9" : "transparent",
            color: activeTab === "contributions" ? "#C4622D" : "#6B7A99",
            fontWeight: activeTab === "contributions" ? "700" : "500"
          }}
          className="flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0"
        >
          <FileText size={14} />
          Moderation Queue {pendingCount > 0 && <span className="bg-[#D97706] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
        </button>

        <button
          onClick={() => { stopAudio(); setActiveTab("dictionary"); }}
          style={{
            backgroundColor: activeTab === "dictionary" ? "#FFFDF9" : "transparent",
            color: activeTab === "dictionary" ? "#C4622D" : "#6B7A99",
            fontWeight: activeTab === "dictionary" ? "700" : "500"
          }}
          className="flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0"
        >
          <BookOpen size={14} />
          Manage Database
        </button>

        <button
          onClick={() => { stopAudio(); setActiveTab("add"); }}
          style={{
            backgroundColor: activeTab === "add" ? "#FFFDF9" : "transparent",
            color: activeTab === "add" ? "#C4622D" : "#6B7A99",
            fontWeight: activeTab === "add" ? "700" : "500"
          }}
          className="flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0"
        >
          <Plus size={14} />
          Publish Entry
        </button>

        <button
          onClick={() => { stopAudio(); setActiveTab("stats"); }}
          style={{
            backgroundColor: activeTab === "stats" ? "#FFFDF9" : "transparent",
            color: activeTab === "stats" ? "#C4622D" : "#6B7A99",
            fontWeight: activeTab === "stats" ? "700" : "500"
          }}
          className="flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0"
        >
          <Users size={14} />
          System Stats
        </button>
      </div>

      {/* Tab Panels */}
      
      {/* 1. CONTRIBUTIONS TAB */}
      {activeTab === "contributions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(28,43,74,0.06)] pb-3">
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-bold">Pending Word Suggestions</h2>
            <span style={{ color: "#6B7A99" }} className="text-xs">{pendingCount} submissions awaiting approval</span>
          </div>

          {loadingContribs ? (
            <div className="flex flex-col items-center py-16 text-[#6B7A99]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4622D] mb-4"></div>
              <span>Fetching community contributions database...</span>
            </div>
          ) : contributions.filter(c => c.status === "pending").length === 0 ? (
            <div style={{ backgroundColor: "#FFFDF9", border: "1px dashed rgba(28,43,74,0.12)" }} className="rounded-3xl p-12 text-center">
              <CheckCircle size={40} className="text-[#10B981] mx-auto mb-3" />
              <h3 style={{ color: "#1C2B4A" }} className="text-base font-bold mb-1">Moderation Queue is Empty!</h3>
              <p style={{ color: "#6B7A99" }} className="text-xs max-w-sm mx-auto">
                No users have suggested words recently. All contributions have been approved or rejected.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributions.filter(c => c.status === "pending").map((c) => (
                <div 
                  key={c.id} 
                  style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} 
                  className="rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Badge row */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-orange-100 text-[#C4622D]">
                        {c.pos}
                      </span>
                      <span style={{ color: "#8B9DC3" }} className="text-[10px]">
                        {new Date(c.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </span>
                    </div>

                    {/* Word Spelling */}
                    <h3 style={{ color: "#1C2B4A" }} className="text-lg font-bold mb-1">
                      {c.butuanon} <span style={{ color: "#8B9DC3" }} className="text-xs font-normal">({c.pronunciation})</span>
                    </h3>
                    <p style={{ color: "#C4622D" }} className="text-xs font-semibold mb-2">
                      Translation: {c.english}
                    </p>
                    <p style={{ color: "#6B7A99" }} className="text-xs line-clamp-3 mb-4 italic">
                      "{c.definition}"
                    </p>

                    {/* Examples if present */}
                    {(c.example_butuanon || c.example_english) && (
                      <div style={{ backgroundColor: "#F7F2EB" }} className="rounded-2xl p-3 border border-[rgba(28,43,74,0.04)] mb-4 space-y-1">
                        <span style={{ color: "#8B9DC3" }} className="text-[9px] font-bold block uppercase tracking-wider">Example Usage</span>
                        {c.example_butuanon && <p style={{ color: "#1C2B4A" }} className="text-xs font-medium">{c.example_butuanon}</p>}
                        {c.example_english && <p style={{ color: "#6B7A99" }} className="text-xs italic">{c.example_english}</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-[rgba(28,43,74,0.06)] pt-3 mt-2">
                    {/* Audio Preview */}
                    {c.audio_url ? (
                      <button
                        onClick={() => playAudio(c.audio_url, `c_${c.id}`)}
                        style={{
                          backgroundColor: playingAudioId === `c_${c.id}` ? "#C4622D" : "rgba(196,98,45,0.08)",
                          color: playingAudioId === `c_${c.id}` ? "#FFFDF9" : "#C4622D"
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                      >
                        {playingAudioId === `c_${c.id}` ? <Pause size={12} fill="#FFFDF9" /> : <Play size={12} fill="#C4622D" />}
                        Listen Clip
                      </button>
                    ) : (
                      <span style={{ color: "#8B9DC3" }} className="text-[10px] flex items-center gap-1">
                        <Volume2 size={12} /> No audio
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(c.id)}
                        style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}
                        className="p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                        title="Reject suggestion"
                      >
                        <X size={15} />
                      </button>
                      
                      <button
                        onClick={() => {
                          setReviewItem({ ...c, verified: "community" });
                          setIsReviewModalOpen(true);
                        }}
                        style={{ backgroundColor: "#1C2B4A" }}
                        className="flex items-center gap-1 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Check size={14} /> Review & Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MANAGE DATABASE TAB */}
      {activeTab === "dictionary" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(28,43,74,0.06)] pb-3">
            <div>
              <h2 style={{ color: "#1C2B4A" }} className="text-lg font-bold">Live Dictionary Database</h2>
              <p style={{ color: "#6B7A99" }} className="text-xs">Publish direct edits, change verification flags, or delete entries.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9DC3]" />
              <input
                type="text"
                placeholder="Search database words..."
                value={dictSearch}
                onChange={(e) => setDictSearch(e.target.value)}
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
              />
            </div>
          </div>

          {loadingDict ? (
            <div className="flex flex-col items-center py-16 text-[#6B7A99]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4622D] mb-4"></div>
              <span>Reading SQL tables...</span>
            </div>
          ) : filteredDict.length === 0 ? (
            <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-12 text-center border border-[rgba(28,43,74,0.06)]">
              <Search size={32} className="text-[#8B9DC3] mx-auto mb-3" />
              <h3 style={{ color: "#1C2B4A" }} className="text-base font-bold mb-1">No Results Found</h3>
              <p style={{ color: "#6B7A99" }} className="text-xs max-w-sm mx-auto">
                No active dictionary entries match your search text "{dictSearch}". Try a different spelling.
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl border border-[rgba(28,43,74,0.06)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#1C2B4A", color: "#F7F2EB" }} className="font-semibold">
                      <th className="p-3.5 pl-5">Butuanon Word</th>
                      <th className="p-3.5">English Translation</th>
                      <th className="p-3.5 hidden sm:table-cell">Part of Speech</th>
                      <th className="p-3.5 hidden md:table-cell">Pronunciation</th>
                      <th className="p-3.5 hidden sm:table-cell">Verification</th>
                      <th className="p-3.5 text-center">Audio</th>
                      <th className="p-3.5 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(28,43,74,0.06)]">
                    {filteredDict.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 pl-5 font-bold" style={{ color: '#1C2B4A' }}>{item.butuanon}</td>
                        <td className="p-3.5 text-[#6B7A99] font-medium">{item.english}</td>
                        <td className="p-3.5 hidden sm:table-cell">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-600">
                            {item.pos}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#8B9DC3] hidden md:table-cell">{item.pronunciation}</td>
                        <td className="p-3.5 hidden sm:table-cell">
                          <span 
                            style={{ 
                              backgroundColor: 
                                item.verified === "native-speaker" ? "rgba(16,185,129,0.12)" : 
                                item.verified === "academic" ? "rgba(79,70,229,0.12)" : "rgba(28,43,74,0.08)",
                              color: 
                                item.verified === "native-speaker" ? "#10B981" : 
                                item.verified === "academic" ? "#4F46E5" : "#6B7A99"
                            }} 
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max"
                          >
                            <Award size={10} />
                            {item.verified || "unverified"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {item.audio ? (
                            <button
                              onClick={() => playAudio(item.audio, `d_${item.id}`)}
                              style={{ 
                                backgroundColor: playingAudioId === `d_${item.id}` ? "#C4622D" : "rgba(28,43,74,0.05)",
                                color: playingAudioId === `d_${item.id}` ? "#FFFDF9" : "#1C2B4A"
                              }}
                              className="w-7 h-7 rounded-full inline-flex items-center justify-center transition-all hover:scale-110"
                            >
                              {playingAudioId === `d_${item.id}` ? <Pause size={10} fill="#FFFDF9" /> : <Play size={10} className="ml-0.5" fill="#1C2B4A" />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#8B9DC3] italic">None</span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditItem(item);
                                setIsEditModalOpen(true);
                              }}
                              style={{ color: "#1C2B4A" }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit word details"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteItemId(item.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete word entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ADD / PUBLISH ENTRY TAB */}
      {activeTab === "add" && (
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(28,43,74,0.05)" }} className="rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
          <div className="border-b border-[rgba(28,43,74,0.06)] pb-4 mb-6">
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-bold flex items-center gap-1.5">
              <Sparkles size={18} className="text-[#C4622D]" />
              Publish a New Dictionary Word
            </h2>
            <p style={{ color: "#6B7A99" }} className="text-xs">Create and publish an entry directly to the SQL database immediately.</p>
          </div>

          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="add-butuanon" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Butuanon Word *</label>
                <input
                  id="add-butuanon"
                  name="butuanon"
                  type="text"
                  required
                  value={newButuanon}
                  onChange={(e) => setNewButuanon(e.target.value)}
                  placeholder="e.g. Suwang"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="add-english" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">English Meaning *</label>
                <input
                  id="add-english"
                  name="english"
                  type="text"
                  required
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="e.g. Sun"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="add-pos" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Part of Speech</label>
                <select
                  id="add-pos"
                  name="pos"
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors cursor-pointer"
                >
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="phrase">Phrase</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="add-pronunciation" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Pronunciation Guide</label>
                <input
                  id="add-pronunciation"
                  name="pronunciation"
                  type="text"
                  value={newPronunciation}
                  onChange={(e) => setNewPronunciation(e.target.value)}
                  placeholder="e.g. soo-WANG"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="add-definition" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Definition *</label>
              <textarea
                id="add-definition"
                name="definition"
                required
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="Definition of the word in English..."
                rows={3}
                style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)", resize: "none" }}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
              />
            </div>

            {/* Examples */}
            <div className="border border-[rgba(28,43,74,0.04)] rounded-2xl p-4 bg-[#F7F2EB]/50 space-y-3">
              <span style={{ color: "#1C2B4A" }} className="text-xs font-bold uppercase tracking-wider block">Example Usage (Optional)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="add-example-butuanon"
                  name="exampleButuanon"
                  type="text"
                  placeholder="Butuanon Example Sentence..."
                  value={newExampleButuanon}
                  onChange={(e) => setNewExampleButuanon(e.target.value)}
                  style={{ backgroundColor: "#FFFDF9", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="text-xs px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
                <input
                  id="add-example-english"
                  name="exampleEnglish"
                  type="text"
                  placeholder="English Translation..."
                  value={newExampleEnglish}
                  onChange={(e) => setNewExampleEnglish(e.target.value)}
                  style={{ backgroundColor: "#FFFDF9", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="text-xs px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            {/* Extra Metadata (verified & audio URL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="add-verified" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Verification Badge</label>
                <select
                  id="add-verified"
                  name="verified"
                  value={newVerified}
                  onChange={(e) => setNewVerified(e.target.value)}
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors cursor-pointer"
                >
                  <option value="native-speaker">Verified: Native Speaker</option>
                  <option value="academic">Verified: Academic Vetted</option>
                  <option value="community">Verified: Community Checked</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="add-audio-url" style={{ color: "#1C2B4A" }} className="text-xs font-semibold">Audio URL (Optional)</label>
                <input
                  id="add-audio-url"
                  name="audioUrl"
                  type="url"
                  placeholder="Link to hosted audio mp3/webm..."
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none focus:border-[#C4622D] transition-colors"
                />
              </div>
            </div>

            {renderVoiceRecorder("add")}

            {/* Submit btn */}
            <div className="flex justify-end pt-3 border-t border-[rgba(28,43,74,0.06)]">
              <button
                type="submit"
                disabled={!newButuanon.trim() || !newEnglish.trim() || !newDefinition.trim()}
                style={{ backgroundColor: "#C4622D" }}
                className="w-full sm:w-max px-8 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Word Directly
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. SYSTEM STATS TAB */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="border-b border-[rgba(28,43,74,0.06)] pb-3">
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-bold">System Health & Metrics</h2>
            <p style={{ color: "#6B7A99" }} className="text-xs">Database statistics and performance summaries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 border border-[rgba(28,43,74,0.05)] shadow-sm">
              <h3 style={{ color: "#1C2B4A" }} className="text-sm font-bold mb-4 flex items-center gap-1.5">
                <FileText size={16} className="text-[#C4622D]" />
                Contribution Metrics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Submissions Total</span>
                  <span className="font-semibold text-[#1C2B4A]">{contributions.length}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Awaiting Approval</span>
                  <span className="font-bold text-[#D97706]">{pendingCount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Approved Words</span>
                  <span className="font-semibold text-emerald-600">{approvedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#6B7A99" }}>Rejection Ratio</span>
                  <span className="font-semibold text-red-500">
                    {contributions.length > 0 ? Math.round((rejectedCount / contributions.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 border border-[rgba(28,43,74,0.05)] shadow-sm">
              <h3 style={{ color: "#1C2B4A" }} className="text-sm font-bold mb-4 flex items-center gap-1.5">
                <Award size={16} className="text-[#C4622D]" />
                Verification Status Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Academic Verified</span>
                  <span className="font-semibold text-[#4F46E5]">
                    {dictionary.filter(i => i.verified === "academic").length} entries
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Native Speaker Verified</span>
                  <span className="font-semibold text-[#10B981]">
                    {dictionary.filter(i => i.verified === "native-speaker").length} entries
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span style={{ color: "#6B7A99" }}>Community Checked</span>
                  <span className="font-semibold text-[#C4622D]">
                    {dictionary.filter(i => i.verified === "community" || !i.verified).length} entries
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#6B7A99" }}>Audio Pronunciations Uploaded</span>
                  <span className="font-semibold text-[#1C2B4A]">
                    {dictionary.filter(i => i.audio).length} clips
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 border border-[rgba(28,43,74,0.05)] shadow-sm flex flex-col justify-between">
              <div>
                <h3 style={{ color: "#1C2B4A" }} className="text-sm font-bold mb-2 flex items-center gap-1.5">
                  <Users size={16} className="text-[#C4622D]" />
                  Gamification Info
                </h3>
                <p style={{ color: "#6B7A99" }} className="text-xs mb-4">
                  Approved user submissions automatically credit XP points to contributors. This is tracked inside the PostgreSQL users table.
                </p>
              </div>
              <div style={{ backgroundColor: "#F7F2EB" }} className="p-3.5 rounded-2xl text-[11px] text-[#6B7A99] border">
                <span className="font-bold text-[#1C2B4A] block mb-1">XP Scaling Formula</span>
                Approval gives <strong>+50 XP</strong>. Every user quiz answers correctly awards <strong>+5-10 XP</strong>. Admins can adjust rates manually in endpoints.py.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING ACTION MODALS --- */}

      {/* MODAL A: MODERATION REVIEW & APPROVAL FORM */}
      {isReviewModalOpen && reviewItem && (
        <div style={{ backgroundColor: "rgba(28,43,74,0.4)" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[rgba(28,43,74,0.06)] animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 style={{ color: "#1C2B4A" }} className="font-bold text-base flex items-center gap-1.5">
                <FileText size={18} className="text-[#C4622D]" />
                Review & Publish Contribution
              </h3>
              <button 
                onClick={() => { setIsReviewModalOpen(false); setReviewItem(null); }}
                className="p-1 rounded-full hover:bg-slate-100 text-[#8B9DC3] hover:text-black transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <p style={{ color: "#6B7A99" }} className="text-xs">
                Correct any spelling mistakes or definitions below. Clicking "Approve & Publish" will upload the word permanently.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Butuanon Word *</label>
                  <input
                    type="text"
                    required
                    value={reviewItem.butuanon}
                    onChange={(e) => setReviewItem({ ...reviewItem, butuanon: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">English Meaning *</label>
                  <input
                    type="text"
                    required
                    value={reviewItem.english}
                    onChange={(e) => setReviewItem({ ...reviewItem, english: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Part of Speech</label>
                  <select
                    value={reviewItem.pos}
                    onChange={(e) => setReviewItem({ ...reviewItem, pos: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="phrase">Phrase</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Pronunciation Guide</label>
                  <input
                    type="text"
                    value={reviewItem.pronunciation}
                    onChange={(e) => setReviewItem({ ...reviewItem, pronunciation: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#1C2B4A]">Definition *</label>
                <textarea
                  required
                  value={reviewItem.definition}
                  onChange={(e) => setReviewItem({ ...reviewItem, definition: e.target.value })}
                  rows={2}
                  style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)", resize: "none" }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Butuanon Example Usage</label>
                  <input
                    type="text"
                    value={reviewItem.example_butuanon || ""}
                    onChange={(e) => setReviewItem({ ...reviewItem, example_butuanon: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">English Example Translation</label>
                  <input
                    type="text"
                    value={reviewItem.example_english || ""}
                    onChange={(e) => setReviewItem({ ...reviewItem, example_english: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Vetting Badge Category</label>
                  <select
                    value={reviewItem.verified}
                    onChange={(e) => setReviewItem({ ...reviewItem, verified: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
                  >
                    <option value="community">Verified: Community Checked</option>
                    <option value="native-speaker">Verified: Native Speaker</option>
                    <option value="academic">Verified: Academic Vetted</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Pronunciation clip</label>
                  <div className="pt-1.5">
                    {reviewItem.audio_url ? (
                      <button
                        type="button"
                        onClick={() => playAudio(reviewItem.audio_url, `rev_${reviewItem.id}`)}
                        style={{ backgroundColor: playingAudioId === `rev_${reviewItem.id}` ? "#C4622D" : "rgba(196,98,45,0.08)", color: "#C4622D" }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                      >
                        {playingAudioId === `rev_${reviewItem.id}` ? <Pause size={10} fill="#FFFDF9" /> : <Play size={10} fill="#C4622D" />}
                        Play Audio File
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#8B9DC3] italic">No audio recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {renderVoiceRecorder("review")}

              <div className="flex gap-2 justify-end border-t pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsReviewModalOpen(false); setReviewItem(null); }}
                  style={{ color: "#6B7A99" }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "#C4622D" }}
                  className="text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90"
                >
                  Approve & Publish Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL B: DIRECT DICTIONARY ITEM EDIT FORM */}
      {isEditModalOpen && editItem && (
        <div style={{ backgroundColor: "rgba(28,43,74,0.4)" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[rgba(28,43,74,0.06)] animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 style={{ color: "#1C2B4A" }} className="font-bold text-base flex items-center gap-1.5">
                <Edit2 size={16} className="text-[#C4622D]" />
                Modify Dictionary Entry
              </h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditItem(null); }}
                className="p-1 rounded-full hover:bg-slate-100 text-[#8B9DC3] hover:text-black transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Butuanon Spelling *</label>
                  <input
                    type="text"
                    required
                    value={editItem.butuanon}
                    onChange={(e) => setEditItem({ ...editItem, butuanon: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">English Translation *</label>
                  <input
                    type="text"
                    required
                    value={editItem.english}
                    onChange={(e) => setEditItem({ ...editItem, english: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Part of Speech</label>
                  <select
                    value={editItem.pos}
                    onChange={(e) => setEditItem({ ...editItem, pos: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="phrase">Phrase</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Pronunciation Guide</label>
                  <input
                    type="text"
                    value={editItem.pronunciation}
                    onChange={(e) => setEditItem({ ...editItem, pronunciation: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#1C2B4A]">Definition *</label>
                <textarea
                  required
                  value={editItem.definition}
                  onChange={(e) => setEditItem({ ...editItem, definition: e.target.value })}
                  rows={2}
                  style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)", resize: "none" }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Butuanon Example Sentence</label>
                  <input
                    type="text"
                    value={editItem.exampleButuanon || ""}
                    onChange={(e) => setEditItem({ ...editItem, exampleButuanon: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">English Example Translation</label>
                  <input
                    type="text"
                    value={editItem.exampleEnglish || ""}
                    onChange={(e) => setEditItem({ ...editItem, exampleEnglish: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Verification Status</label>
                  <select
                    value={editItem.verified || "community"}
                    onChange={(e) => setEditItem({ ...editItem, verified: e.target.value })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
                  >
                    <option value="community">Verified: Community Checked</option>
                    <option value="native-speaker">Verified: Native Speaker</option>
                    <option value="academic">Verified: Academic Vetted</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1C2B4A]">Rating (0-5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={editItem.rating}
                    onChange={(e) => setEditItem({ ...editItem, rating: parseInt(e.target.value) || 0 })}
                    style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#1C2B4A]">Audio Stream Link</label>
                <input
                  type="text"
                  placeholder="URL to pronunciation mp3/webm"
                  value={editItem.audio || ""}
                  onChange={(e) => setEditItem({ ...editItem, audio: e.target.value })}
                  style={{ backgroundColor: "#F7F2EB", borderColor: "rgba(28,43,74,0.08)" }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                />
              </div>

              {renderVoiceRecorder("edit")}

              <div className="flex gap-2 justify-end border-t pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditItem(null); }}
                  style={{ color: "#6B7A99" }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "#1C2B4A" }}
                  className="text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90"
                >
                  Update Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL C: DELETE CONFIRMATION OVERLAY */}
      {isDeleteModalOpen && (
        <div style={{ backgroundColor: "rgba(28,43,74,0.4)" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div style={{ backgroundColor: "#FFFDF9" }} className="rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[rgba(28,43,74,0.06)] animate-fade-in text-center">
            <div style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#EF4444" }} className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            
            <h3 style={{ color: "#1C2B4A" }} className="font-extrabold text-base mb-2">Delete Vocabulary Entry?</h3>
            <p style={{ color: "#6B7A99" }} className="text-xs mb-6">
              Are you sure? This operation will remove the word from the database permanently. Standard users will no longer find this translation.
            </p>

            <div className="flex gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeleteItemId(null); }}
                style={{ color: "#6B7A99" }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                No, Keep It
              </button>
              
              <button
                type="button"
                onClick={handleDeleteEntry}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Yes, Delete Word
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
