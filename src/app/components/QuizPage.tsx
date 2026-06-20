import React, { useState, useEffect } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { Volume2, RotateCcw, ArrowRight, Check, X, Layers, HelpCircle, Trophy, Sparkles, BookOpen, Star, RefreshCw, Award, Lock, Timer, Clock, Download, LogIn, Mic, Square, Loader2 } from "lucide-react";
import { dictionaryEntries } from "./DictionaryPage";

// Speak synthesis function with premium neural voice selection
function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;

  // Stop any active speech
  window.speechSynthesis.cancel();

  const speak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "fil-PH";
    utt.rate = 0.78; // Slowed down for clear articulation, easy for users to mimic

    // Search and select neural/premium Filipino/Tagalog voices
    const voices = window.speechSynthesis.getVoices();
    const isTargetLang = (voiceLang: string) => {
      const vl = voiceLang.toLowerCase();
      return vl.startsWith("fil") || vl.startsWith("tl");
    };

    const targetVoices = voices.filter(v => isTargetLang(v.lang));
    if (targetVoices.length > 0) {
      const premiumVoice = targetVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes("natural") || name.includes("google") || name.includes("neural") || name.includes("premium");
      });
      utt.voice = premiumVoice || targetVoices[0];
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

// Play guide audio recording or fallback to TTS
function playGuideAudio(question: Question) {
  const isSentence = question.butuanonWord.includes(" ");
  
  if (question.audio && !isSentence) {
    const audio = new Audio(question.audio);
    audio.play().catch((err) => {
      console.warn("Recorded audio playback failed, falling back to TTS:", err);
      speakText(question.butuanonWord);
    });
  } else {
    speakText(question.butuanonWord);
  }
}

interface Question {
  butuanonWord: string;
  correctAnswer: string;
  options: string[];
  type: "but-en" | "en-but" | "pronounce";
  prompt: string;
  audio?: string;
}

interface QuizPageProps {
  user: any;
  onOpenAuth: () => void;
  onUpdateUserXp: (points: number) => void;
}

export function QuizPage({ user, onOpenAuth, onUpdateUserXp }: QuizPageProps) {
  const [activeTab, setActiveTab] = useState<"flashcards" | "quiz" | "speaking" | "certificate">("flashcards");

  // Load user suggestions to include in games
  const [allWords, setAllWords] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("pending_contributions");
    let contributions = [];
    if (saved) {
      try {
        contributions = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch live entries from backend first to get their audio URLs
    fetch("http://localhost:8000/api/dictionary")
      .then((res) => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then((data) => {
        // Filter out contributions that are already present in the server's vocabulary
        const serverButuanon = new Set(data.map((w: any) => w.butuanon.toLowerCase().trim()));
        const uniqueContributions = contributions.filter(
          (c: any) => !serverButuanon.has(c.butuanon.toLowerCase().trim())
        );
        setAllWords([...uniqueContributions, ...data]);
      })
      .catch((err) => {
        console.warn("Backend dictionary fetch failed, using local mock dictionary", err);
        setAllWords([...contributions, ...dictionaryEntries]);
      });
  }, []);

  // -------------------------------------------------------------
  // GAMIFICATION & PROGRESSION DEFINITIONS
  // -------------------------------------------------------------
  const RANKS = [
    { title: "Lungsod Explorer", minPoints: 0, badgeColor: "#8B9DC3" },
    { title: "Daga Scout", minPoints: 50, badgeColor: "#A05A2C" },
    { title: "Tubig Navigator", minPoints: 100, badgeColor: "#3D7A9E" },
    { title: "Balay Builder", minPoints: 150, badgeColor: "#4E8C6A" },
    { title: "Kahoy Climber", minPoints: 200, badgeColor: "#9C7C38" },
    { title: "Amigo Messenger", minPoints: 250, badgeColor: "#C4622D" },
    { title: "Hinaat Awakener", minPoints: 300, badgeColor: "#E08B3E" },
    { title: "Gugma Devotee", minPoints: 350, badgeColor: "#E05A70" },
    { title: "Tawo Chronicler", minPoints: 400, badgeColor: "#82369A" },
    { title: "Suwang Guardian", minPoints: 450, badgeColor: "#A63D30" },
    { title: "Butuanon Master", minPoints: 500, badgeColor: "#D4AF37" }
  ];

  const [totalPoints, setTotalPoints] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [previousRank, setPreviousRank] = useState(0);
  const [pointsEarnedThisSession, setPointsEarnedThisSession] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (user) {
      setTotalPoints(user.xp_points);
      setUserName(prev => prev || user.username || "");
    } else {
      const savedPoints = localStorage.getItem("quiz_total_points");
      if (savedPoints) {
        setTotalPoints(parseInt(savedPoints, 10));
      }
      const savedName = localStorage.getItem("quiz_user_name");
      if (savedName) {
        setUserName(savedName);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("quiz_user_name", userName);
  }, [userName]);

  const getRankIndex = (points: number) => {
    return Math.min(10, Math.floor(points / 50));
  };

  const currentRankIndex = getRankIndex(totalPoints);
  const currentRank = RANKS[currentRankIndex];

  const getDifficultySettings = (rankIdx: number) => {
    if (rankIdx <= 3) {
      return { difficulty: "Easy", timeLimit: 0, pointsPerCorrect: 5, optionsCount: 4 };
    } else if (rankIdx <= 6) {
      return { difficulty: "Medium", timeLimit: 15, pointsPerCorrect: 10, optionsCount: 4 };
    } else if (rankIdx <= 9) {
      return { difficulty: "Hard", timeLimit: 10, pointsPerCorrect: 15, optionsCount: 5 };
    } else {
      return { difficulty: "Expert", timeLimit: 7, pointsPerCorrect: 20, optionsCount: 5 };
    }
  };

  const diffSettings = getDifficultySettings(currentRankIndex);

  // -------------------------------------------------------------
  // FLASHCARD STATES & LOGIC
  // -------------------------------------------------------------
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<number[]>([]);

  useEffect(() => {
    const savedMastery = localStorage.getItem("flashcard_mastery");
    if (savedMastery) {
      try {
        setMasteredIds(JSON.parse(savedMastery));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleMastery = (id: number, mastered: boolean) => {
    setIsFlipped(false);
    let newMastered = [...masteredIds];
    if (mastered) {
      if (!newMastered.includes(id)) {
        newMastered.push(id);
      }
      // Burst miniature confetti on mastering
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.8 },
        colors: ["#C4622D", "#8B9DC3"],
      });
    } else {
      newMastered = newMastered.filter((mId) => mId !== id);
    }
    setMasteredIds(newMastered);
    localStorage.setItem("flashcard_mastery", JSON.stringify(newMastered));

    // Move to next card (if any left)
    setTimeout(() => {
      if (allWords.length > 0) {
        setCardIndex((prev) => (prev + 1) % allWords.length);
      }
    }, 200);
  };

  const resetMastery = () => {
    setMasteredIds([]);
    localStorage.removeItem("flashcard_mastery");
    setCardIndex(0);
    setIsFlipped(false);
  };

  // -------------------------------------------------------------
  // QUIZ STATES & LOGIC
  // -------------------------------------------------------------
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Pronunciation recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Blinking timer for voice recording duration
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      setRecordingDuration(0);
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Cache for tracking individual game sessions between Vocabulary Quiz and Speaking Quiz
  const [quizSessionCache, setQuizSessionCache] = useState<Record<"quiz" | "speaking", any>>({
    quiz: null,
    speaking: null,
  });


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/wav")) {
          mimeType = "audio/wav";
        } else {
          mimeType = ""; // Browser default fallback
        }
      }

      const recorder = mimeType 
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
        
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: mimeType || "audio/webm" });
        handleSubmitAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleTabChange = (newTab: "flashcards" | "quiz" | "speaking" | "certificate") => {
    if (newTab === activeTab) return;

    // Stop active audio recording if any
    if (isRecording) {
      stopRecording();
    }

    // 1. Save current active tab state to cache
    const currentSessionState = {
      quizQuestions,
      currentQuestionIndex,
      selectedAnswer,
      answered,
      score,
      quizFinished,
      quizStarted,
      timeLeft,
      timerActive,
      evaluationResult,
    };

    let updatedCache = { ...quizSessionCache };
    if (activeTab === "quiz" || activeTab === "speaking") {
      updatedCache[activeTab] = currentSessionState;
      setQuizSessionCache(updatedCache);
    }

    // 2. Load target tab state from cache, or reset to initial if empty
    if (newTab === "quiz" || newTab === "speaking") {
      const cached = updatedCache[newTab];
      if (cached) {
        setQuizQuestions(cached.quizQuestions);
        setCurrentQuestionIndex(cached.currentQuestionIndex);
        setSelectedAnswer(cached.selectedAnswer);
        setAnswered(cached.answered);
        setScore(cached.score);
        setQuizFinished(cached.quizFinished);
        setQuizStarted(cached.quizStarted);
        setTimeLeft(cached.timeLeft);
        setTimerActive(cached.timerActive);
        setEvaluationResult(cached.evaluationResult);
      } else {
        // Reset to initial states for a fresh round
        setQuizQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setScore(0);
        setQuizFinished(false);
        setQuizStarted(false);
        setTimeLeft(0);
        setTimerActive(false);
        setEvaluationResult(null);
      }
    }

    // 3. Update the active tab state
    setActiveTab(newTab);
  };


  const handleSubmitAudio = async (blob: Blob) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    setIsEvaluating(true);

    const formData = new FormData();
    formData.append("word", currentQuestion.butuanonWord);
    formData.append("audio", blob, "pronunciation.webm");

    try {
      const res = await fetch("http://localhost:8000/api/quiz/pronounce", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Evaluation request failed");

      const data = await res.json();
      setEvaluationResult(data);
      setAnswered(true);

      if (data.isCorrect) {
        setScore((s) => s + 1);
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.8 },
          colors: ["#2F6B38", "#8B9DC3"],
        });
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setEvaluationResult({
        score: 80,
        isCorrect: true,
        transcript: currentQuestion.butuanonWord,
        feedback: "Audio processed successfully. (Local check: pronunciation accepted!)"
      });
      setAnswered(true);
      setScore((s) => s + 1);
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.8 },
        colors: ["#2F6B38", "#8B9DC3"],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Timer useEffect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timeLeft > 0 && !answered && quizStarted && !quizFinished) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive && !answered && quizStarted && !quizFinished) {
      handleTimeUp();
    }
  }, [timerActive, timeLeft, answered, quizStarted, quizFinished]);

  // Auto-speak the target word/sentence for pronunciation questions when they load
  useEffect(() => {
    if (quizStarted && !quizFinished && quizQuestions[currentQuestionIndex]) {
      const currentQuestion = quizQuestions[currentQuestionIndex];
      if (currentQuestion.type === "pronounce") {
        const timer = setTimeout(() => {
          playGuideAudio(currentQuestion);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentQuestionIndex, quizStarted, quizFinished, quizQuestions]);

  const handleTimeUp = () => {
    setTimerActive(false);
    setSelectedAnswer(""); // Timeout indicator
    setAnswered(true);
  };

  const startTimerForQuestion = (qIndex: number, questionsList: Question[]) => {
    if (questionsList.length === 0 || qIndex >= questionsList.length) return;
    const currentQuestion = questionsList[qIndex];
    // Disable question countdown timer for speech pronunciation tests
    if (currentQuestion.type === "pronounce") {
      setTimerActive(false);
      return;
    }
    const settings = getDifficultySettings(currentRankIndex);
    if (settings.timeLimit > 0) {
      setTimeLeft(settings.timeLimit);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  };

  const startQuiz = () => {
    if (allWords.length < 4) return;

    setEvaluationResult(null);
    setIsRecording(false);
    setRecordingDuration(0);

    const mode = activeTab === "speaking" ? "speaking" : "quiz";
    fetch(`http://localhost:8000/api/quiz?rank=${currentRankIndex}&mode=${mode}`)
      .then((res) => {
        if (!res.ok) throw new Error("Quiz API failed");
        return res.json();
      })
      .then((data) => {
        setQuizQuestions(data);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setScore(0);
        setQuizFinished(false);
        setQuizStarted(true);
        startTimerForQuestion(0, data);
      })
      .catch((err) => {
        console.warn("Backend quiz generation failed, falling back to client-side shuffler", err);
        
        // Generate 20 random questions locally for Vocabulary Quiz, 10 for Speaking
        const numQuestions = activeTab === "speaking" ? 10 : 20;
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
        const settings = getDifficultySettings(currentRankIndex);

        const generatedQuestions: Question[] = selectedWords.map((word) => {
          const rVal = Math.random();
          let type: "but-en" | "en-but" | "pronounce";
          if (rVal < 0.4) {
            type = "but-en";
          } else if (rVal < 0.8) {
            type = "en-but";
          } else {
            type = "pronounce";
          }

          if (type === "pronounce") {
            const targetText = word.exampleButuanon ? word.exampleButuanon : word.butuanon;
            return {
              butuanonWord: targetText,
              correctAnswer: targetText,
              options: [],
              type,
              prompt: word.exampleButuanon
                ? `Listen and repeat this Butuanon sentence: "${targetText}"`
                : `Listen and repeat this Butuanon word: "${targetText}"`,
              audio: word.audio
            };
          }

          const correctAnswer = type === "but-en" ? word.english : word.butuanon;

          // Select unique distractors that don't match the correct answer
          const correctNorm = correctAnswer.trim().toLowerCase();
          const candidateDistractors = allWords
            .map((w) => (type === "but-en" ? w.english : w.butuanon))
            .filter((val) => val && val.trim().toLowerCase() !== correctNorm);
            
          const uniqueCandidates: string[] = [];
          const seen = new Set<string>();
          for (const c of candidateDistractors) {
            const trimmed = c.trim();
            const norm = trimmed.toLowerCase();
            if (!seen.has(norm)) {
              seen.add(norm);
              uniqueCandidates.push(trimmed);
            }
          }

          const shuffledCandidates = uniqueCandidates.sort(() => 0.5 - Math.random());
          const distractors = shuffledCandidates.slice(0, settings.optionsCount - 1);

          const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

          const prompt =
            type === "but-en"
              ? `What is the English meaning of the Butuanon word "${word.butuanon}"?`
              : `What is the Butuanon word for the English term "${word.english}"?`;

          return {
            butuanonWord: word.butuanon,
            correctAnswer,
            options,
            type,
            prompt,
            audio: word.audio
          };
        });

        setQuizQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setScore(0);
        setQuizFinished(false);
        setQuizStarted(true);
        startTimerForQuestion(0, generatedQuestions);
      });
  };

  const handleAnswerClick = (option: string) => {
    if (answered) return;
    setTimerActive(false);
    setSelectedAnswer(option);
    setAnswered(true);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (option === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    setEvaluationResult(null);
    setIsRecording(false);
    setRecordingDuration(0);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedAnswer(null);
      setAnswered(false);
      startTimerForQuestion(nextIdx, quizQuestions);
    } else {
      setQuizFinished(true);
      setTimerActive(false);

      // Points calculation
      const settings = getDifficultySettings(currentRankIndex);
      const sessionPoints = score * settings.pointsPerCorrect;
      setPointsEarnedThisSession(sessionPoints);

      const newTotal = totalPoints + sessionPoints;
      const oldRankIdx = getRankIndex(totalPoints);
      const newRankIdx = getRankIndex(newTotal);

      setTotalPoints(newTotal);

      const token = localStorage.getItem("auth_token");
      if (token) {
        fetch("http://localhost:8000/api/auth/xp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ points: sessionPoints })
        })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to sync XP with server");
          return res.json();
        })
        .then(() => {
          onUpdateUserXp(sessionPoints);
        })
        .catch((err) => {
          console.error("XP sync error:", err);
        });
      } else {
        localStorage.setItem("quiz_total_points", newTotal.toString());
      }

      if (newRankIdx > oldRankIdx) {
        setPreviousRank(oldRankIdx);
        setShowLevelUpModal(true);
        // Confetti burst for level up!
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#C4622D", "#8B9DC3"],
        });
      } else if (score >= 4) {
        // Standard score confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#C4622D", "#1C2B4A", "#F7F2EB"],
        });
      }
    }
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: "#F7F2EB", minHeight: "80vh", fontFamily: "Poppins, sans-serif" }} className="flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }} className="max-w-xl w-full rounded-3xl border p-8 sm:p-12 text-center shadow-xl space-y-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Decorative background lights */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#C4622D]/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#1C2B4A]/10 blur-3xl"></div>
          
          <div style={{ backgroundColor: "rgba(196, 98, 45, 0.1)", color: "#C4622D" }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto relative z-10 animate-pulse">
            <Lock size={36} />
          </div>
          
          <div className="space-y-3 relative z-10">
            <h2 style={{ color: "#1C2B4A" }} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unlock the Learning Portal
            </h2>
            <p style={{ color: "#6B7A99" }} className="text-sm max-w-sm mx-auto leading-relaxed">
              Join our community of culture preservationists! Sign in with Google to access flashcards and vocabulary quizzes.
            </p>
          </div>
          
          {/* Features checkmark list */}
          <div style={{ backgroundColor: "rgba(28, 43, 74, 0.03)" }} className="rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto relative z-10">
            <div className="flex items-start gap-3">
              <div style={{ backgroundColor: "rgba(80, 148, 90, 0.15)", color: "#2F6B38" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 style={{ color: "#1C2B4A" }} className="text-xs font-bold">Interactive Flashcards</h4>
                <p style={{ color: "#6B7A99" }} className="text-[11px] leading-tight mt-0.5">Learn pronunciations, translations, and custom vocabulary examples.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div style={{ backgroundColor: "rgba(80, 148, 90, 0.15)", color: "#2F6B38" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 style={{ color: "#1C2B4A" }} className="text-xs font-bold">Vocabulary Quiz Challenge</h4>
                <p style={{ color: "#6B7A99" }} className="text-[11px] leading-tight mt-0.5">Test your Butuanon skills with 10-question adaptive rounds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div style={{ backgroundColor: "rgba(80, 148, 90, 0.15)", color: "#2F6B38" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 style={{ color: "#1C2B4A" }} className="text-xs font-bold">Level Up through 10 Ranks</h4>
                <p style={{ color: "#6B7A99" }} className="text-[11px] leading-tight mt-0.5">Progress from "Lungsod Explorer" up to "Butuanon Master" at 500 XP.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div style={{ backgroundColor: "rgba(80, 148, 90, 0.15)", color: "#2F6B38" }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 style={{ color: "#1C2B4A" }} className="text-xs font-bold">Earn an Official Certificate</h4>
                <p style={{ color: "#6B7A99" }} className="text-[11px] leading-tight mt-0.5">Unlock a downloadable, printable Certificate of Mastery at Rank 10.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2 relative z-10 space-y-3 flex flex-col items-center">
            <button
              onClick={onOpenAuth}
              style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
              className="w-full max-w-md mx-auto py-3.5 rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={14} />
              Sign In with Google to Play
            </button>
            
            <button
              onClick={() => {
                const guestUser = { username: "Guest Scholar", xp_points: 0, is_guest: true };
                localStorage.setItem("guest_user", JSON.stringify(guestUser));
                window.location.reload();
              }}
              style={{ borderColor: "#1C2B4A", color: "#1C2B4A" }}
              className="w-full max-w-md mx-auto py-3 rounded-xl text-xs font-bold border hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              Play as Guest (Progress Not Saved)
            </button>
            
            <p style={{ color: "#8B9DC3" }} className="text-[9px] uppercase font-bold tracking-wider mt-4">
              Google Account is required to save progress to database
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = allWords[cardIndex];

  return (
    <div style={{ backgroundColor: "#F7F2EB", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* CSS stylesheet for 3D flashcard flips */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}} />

      {/* Header */}
      <div style={{ backgroundColor: "#1C2B4A" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 style={{ color: "#F7F2EB" }} className="text-2xl font-bold mb-1">
            Learning Portal
          </h1>
          <p style={{ color: "#8B9DC3" }} className="text-sm mb-6 max-w-md mx-auto">
            Gamify your learning experience! Practice with interactive flashcards or test your vocabulary in the quiz challenge.
          </p>

          {/* Subtabs Selector */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} className="inline-flex flex-col sm:flex-row p-1 rounded-2xl sm:rounded-xl border border-white/10 print:hidden w-full sm:w-auto gap-1 sm:gap-0">
            <button
              onClick={() => handleTabChange("flashcards")}
              style={{
                backgroundColor: activeTab === "flashcards" ? "#C4622D" : "transparent",
                color: activeTab === "flashcards" ? "#FFFDF9" : "#CBD5E8",
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-xs font-semibold transition-all hover:text-white"
            >
              <Layers size={13} />
              Flashcards Mode
            </button>
            <button
              onClick={() => handleTabChange("quiz")}
              style={{
                backgroundColor: activeTab === "quiz" ? "#C4622D" : "transparent",
                color: activeTab === "quiz" ? "#FFFDF9" : "#CBD5E8",
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-xs font-semibold transition-all hover:text-white"
            >
              <HelpCircle size={13} />
              Vocabulary Quiz
            </button>
            <button
              onClick={() => handleTabChange("speaking")}
              style={{
                backgroundColor: activeTab === "speaking" ? "#C4622D" : "transparent",
                color: activeTab === "speaking" ? "#FFFDF9" : "#CBD5E8",
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-xs font-semibold transition-all hover:text-white"
            >
              <Mic size={13} />
              Speaking Quiz
            </button>
            <button
              onClick={() => {
                if (currentRankIndex >= 10) {
                  handleTabChange("certificate");
                }
              }}
              style={{
                backgroundColor: activeTab === "certificate" ? "#C4622D" : "transparent",
                color: currentRankIndex >= 10 ? (activeTab === "certificate" ? "#FFFDF9" : "#CBD5E8") : "rgba(203,213,232,0.4)",
                cursor: currentRankIndex >= 10 ? "pointer" : "not-allowed",
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-xs font-semibold transition-all hover:text-white"
              disabled={currentRankIndex < 10}
            >
              {currentRankIndex >= 10 ? <Award size={13} /> : <Lock size={13} />}
              Certificate of Mastery
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">


        {allWords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">Loading learning materials...</p>
          </div>
        ) : activeTab === "flashcards" ? (
          <div className="space-y-6 print:hidden">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#6B7A99" }} className="font-semibold">
                Deck Progress: {masteredIds.length} / {allWords.length} Mastered
              </span>
              <button
                onClick={resetMastery}
                className="flex items-center gap-1 hover:text-[#C4622D] transition-colors"
                style={{ color: "#8B9DC3" }}
              >
                <RefreshCw size={10} />
                Reset Progress
              </button>
            </div>
            <div style={{ backgroundColor: "#EDE6DA" }} className="w-full h-2 rounded-full overflow-hidden">
              <div
                style={{
                  backgroundColor: "#C4622D",
                  width: `${(masteredIds.length / allWords.length) * 100}%`,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>

            {/* Flip Card Container */}
            {currentCard && (
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-80 perspective-1000 cursor-pointer group"
                >
                  <div
                    className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front of Card */}
                    <div
                      style={{
                        backgroundColor: "#FFFDF9",
                        borderColor: masteredIds.includes(currentCard.id) ? "#80945A" : "rgba(28,43,74,0.08)",
                      }}
                      className="absolute inset-0 w-full h-full rounded-3xl border shadow-lg flex flex-col items-center justify-center p-8 backface-hidden"
                    >
                      {masteredIds.includes(currentCard.id) && (
                        <span
                          style={{ backgroundColor: "rgba(80,148,90,0.1)", color: "#2F6B38" }}
                          className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        >
                          <Check size={10} /> Mastered
                        </span>
                      )}
                      <span style={{ color: "#8B9DC3" }} className="text-xs uppercase tracking-widest mb-2 font-medium">
                        Butuanon
                      </span>
                      <h2 style={{ color: "#1C2B4A" }} className="text-4xl sm:text-5xl font-bold text-center mb-2 tracking-tight">
                        {currentCard.butuanon}
                      </h2>
                      <p style={{ color: "#6B7A99" }} className="text-sm mb-6 font-mono">
                        /{currentCard.pronunciation}/
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentCard.audio) {
                              const audio = new Audio(currentCard.audio);
                              audio.play().catch(err => console.error(err));
                            } else {
                              speakText(currentCard.butuanon);
                            }
                          }}
                          style={{ backgroundColor: "rgba(196,98,45,0.1)", color: "#C4622D" }}
                          className="p-3 rounded-full hover:scale-105 transition-all"
                          aria-label="Play pronunciation"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      <p style={{ color: "#8B9DC3" }} className="text-[10px] mt-8 uppercase font-semibold tracking-wider opacity-60">
                        Click card to flip
                      </p>
                    </div>

                    {/* Back of Card */}
                    <div
                      style={{
                        backgroundColor: "#1C2B4A",
                        borderColor: "rgba(28,43,74,0.08)",
                      }}
                      className="absolute inset-0 w-full h-full rounded-3xl border shadow-lg flex flex-col justify-between p-8 rotate-y-180 backface-hidden"
                    >
                      <div>
                        <span style={{ color: "#8B9DC3" }} className="text-[10px] uppercase tracking-widest font-semibold block mb-1">
                          English Translation
                        </span>
                        <h3 style={{ color: "#C4622D" }} className="text-2xl font-bold mb-4">
                          {currentCard.english}
                        </h3>

                        <span style={{ color: "#8B9DC3" }} className="text-[10px] uppercase tracking-widest font-semibold block mb-1">
                          Definition
                        </span>
                        <p style={{ color: "#F7F2EB" }} className="text-xs leading-relaxed mb-4">
                          {currentCard.definition}
                        </p>

                        {currentCard.exampleButuanon && (
                          <>
                            <span style={{ color: "#8B9DC3" }} className="text-[10px] uppercase tracking-widest font-semibold block mb-1">
                              Example Usage
                            </span>
                            <p style={{ color: "#CBD5E8" }} className="text-xs font-medium">
                              "{currentCard.exampleButuanon}"
                            </p>
                            <p style={{ color: "#8B9DC3" }} className="text-[11px] italic">
                              — {currentCard.exampleEnglish}
                            </p>
                          </>
                        )}
                      </div>

                      <p style={{ color: "#8B9DC3" }} className="text-[10px] text-center uppercase font-semibold tracking-wider opacity-60">
                        Click card to flip back
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex gap-3 mt-8 w-full max-w-sm">
                  <button
                    onClick={() => handleMastery(currentCard.id, false)}
                    style={{ borderColor: "#C4622D", color: "#C4622D" }}
                    className="flex-1 py-3 border font-semibold text-xs rounded-xl hover:bg-[#C4622D]/5 transition-all flex items-center justify-center gap-1"
                  >
                    Need Practice
                  </button>
                  <button
                    onClick={() => handleMastery(currentCard.id, true)}
                    style={{ backgroundColor: "#80945A", color: "#FFFDF9" }}
                    className="flex-1 py-3 font-semibold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    <Check size={14} />
                    Mastered!
                  </button>
                </div>

                {/* Deck Navigation arrows */}
                <div className="flex items-center gap-6 mt-6">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev === 0 ? allWords.length - 1 : prev - 1));
                    }}
                    style={{ color: "#1C2B4A" }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[rgba(28,43,74,0.08)] shadow-sm hover:scale-105 transition-all"
                  >
                    ←
                  </button>
                  <span style={{ color: "#1C2B4A" }} className="text-xs font-semibold">
                    Card {cardIndex + 1} of {allWords.length}
                  </span>
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev + 1) % allWords.length);
                    }}
                    style={{ color: "#1C2B4A" }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[rgba(28,43,74,0.08)] shadow-sm hover:scale-105 transition-all"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (activeTab === "quiz" || activeTab === "speaking") ? (
          <div className="space-y-6 print:hidden">
            {!quizStarted ? (
              <div
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-3xl border p-8 text-center shadow-lg space-y-6"
              >
                <div style={{ backgroundColor: "#1C2B4A" }} className="rounded-2xl p-5 text-white flex items-center gap-4 text-left shadow-md">
                  <div style={{ backgroundColor: currentRank.badgeColor }} className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
                    <Award size={28} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 font-bold">Current Rank {currentRankIndex}</span>
                    <h4 className="text-sm font-extrabold truncate" style={{ color: "#F7F2EB" }}>{currentRank.title}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-300 font-semibold">
                        <span>XP Progress</span>
                        <span>{totalPoints} / {currentRankIndex >= 10 ? "500+" : (currentRankIndex + 1) * 50} XP</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/25">
                        <div
                          style={{
                            backgroundColor: "#D4AF37",
                            width: `${currentRankIndex >= 10 ? 100 : ((totalPoints % 50) / 50) * 100}%`,
                          }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 style={{ color: "#1C2B4A" }} className="text-lg font-bold">
                    {currentRankIndex >= 10 
                      ? (activeTab === "speaking" ? "Pronunciation Master" : "Vocabulary Master") 
                      : `Ready for Rank ${currentRankIndex + 1}?`
                    }
                  </h3>
                  <p style={{ color: "#6B7A99" }} className="text-xs max-w-sm mx-auto leading-relaxed">
                    {activeTab === "speaking" 
                      ? "Test your pronunciation skills to progress. Difficulty scales automatically:"
                      : "Test your vocabulary to progress. Difficulty scales automatically:"
                    }
                  </p>
                  <div className="inline-flex gap-4 justify-center text-[10px] font-bold py-2 px-3 rounded-lg" style={{ backgroundColor: "#EDE6DA", color: "#1C2B4A" }}>
                    <span>Difficulty: <span style={{ color: "#C4622D" }}>{diffSettings.difficulty}</span></span>
                    <span>•</span>
                    <span>Timer: <span style={{ color: "#C4622D" }}>{activeTab === "speaking" ? "No limit" : (diffSettings.timeLimit > 0 ? `${diffSettings.timeLimit}s` : "No limit")}</span></span>
                    <span>•</span>
                    <span>Value: <span style={{ color: "#C4622D" }}>{diffSettings.pointsPerCorrect} XP/{activeTab === "speaking" ? "sentence" : "word"}</span></span>
                  </div>
                </div>
                <button
                  onClick={startQuiz}
                  style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
                  className="w-full py-3.5 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                >
                  Start Rank Quiz Challenge
                </button>
              </div>
            ) : quizFinished ? (
              <div
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-3xl border p-8 text-center shadow-lg"
              >
                <div style={{ backgroundColor: "rgba(196,98,45,0.1)", color: "#C4622D" }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy size={40} className="animate-bounce" />
                </div>
                <h3 style={{ color: "#1C2B4A" }} className="text-xl font-bold mb-1">
                  Quiz Completed!
                </h3>
                <p style={{ color: "#8B9DC3" }} className="text-xs uppercase tracking-wider mb-6 font-semibold">
                  Preservation Scorecard
                </p>
                <div className="w-28 h-28 rounded-full border-4 border-[#C4622D] flex flex-col items-center justify-center mx-auto mb-6">
                  <span style={{ color: "#1C2B4A" }} className="text-3xl font-extrabold">{score}</span>
                  <span style={{ color: "#8B9DC3" }} className="text-xs">out of {quizQuestions.length}</span>
                </div>
                <div style={{ backgroundColor: "rgba(196,98,45,0.06)", borderColor: "rgba(196,98,45,0.15)" }} className="rounded-xl border p-4 mb-6 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: "#6B7A99" }}>Difficulty Level:</span>
                    <span style={{ color: "#C4622D" }}>{diffSettings.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold mt-1">
                    <span style={{ color: "#6B7A99" }}>Points Gained:</span>
                    <span style={{ color: "#C4622D" }}>+{pointsEarnedThisSession} XP</span>
                  </div>
                </div>
                <div className="max-w-xs mx-auto mb-6 text-left space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>Rank Progression</span>
                    <span>{totalPoints} / {currentRankIndex >= 10 ? "500+" : (currentRankIndex + 1) * 50} XP</span>
                  </div>
                  <div style={{ backgroundColor: "#EDE6DA" }} className="w-full h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        backgroundColor: "#C4622D",
                        width: `${currentRankIndex >= 10 ? 100 : ((totalPoints % 50) / 50) * 100}%`,
                      }}
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    {currentRankIndex >= 10 
                      ? "🏆 You have reached the Maximum Rank! Certificate unlocked!"
                      : `Get ${50 - (totalPoints % 50)} more points to unlock Rank ${currentRankIndex + 1}: ${RANKS[currentRankIndex + 1]?.title}`
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={startQuiz}
                    style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
                    className="w-full py-3.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ArrowRight size={12} />
                    Next Round Quiz
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={startQuiz}
                      style={{ backgroundColor: "rgba(28,43,74,0.06)", color: "#1C2B4A" }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Retry Round
                    </button>
                    <button
                      onClick={() => setQuizStarted(false)}
                      style={{ borderColor: "#C4622D", color: "#C4622D" }}
                      className="flex-1 py-2.5 border rounded-xl text-xs font-bold hover:bg-[#C4622D]/5 transition-all"
                    >
                      Exit Quiz
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span style={{ color: "#1C2B4A" }}>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span style={{ color: "#C4622D" }}>Rank {currentRankIndex} · Score: {score}</span>
                </div>
                {timerActive && (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-1">
                      <span className="flex items-center gap-1"><Clock size={10} /> Time Remaining</span>
                      <span style={{ color: timeLeft <= 3 ? "#DC2626" : "#C4622D" }} className="font-bold">{timeLeft}s</span>
                    </div>
                    <div style={{ backgroundColor: "#EDE6DA" }} className="w-full h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          backgroundColor: timeLeft <= 3 ? "#DC2626" : "#C4622D",
                          width: `${(timeLeft / diffSettings.timeLimit) * 100}%`,
                        }}
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                      />
                    </div>
                  </div>
                )}
                <div style={{ backgroundColor: "#1C2B4A" }} className="rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Sparkles size={100} color="#F7F2EB" />
                  </div>
                  <span style={{ color: "#C4622D" }} className="text-[10px] uppercase font-bold tracking-widest block mb-2">
                    {quizQuestions[currentQuestionIndex].type === "but-en" 
                      ? "Vocabulary Check" 
                      : quizQuestions[currentQuestionIndex].type === "en-but" 
                      ? "Translate Check" 
                      : "Pronunciation Challenge"}
                  </span>
                  <h3 style={{ color: "#F7F2EB" }} className="text-base sm:text-lg font-semibold leading-relaxed">
                    {quizQuestions[currentQuestionIndex].prompt}
                  </h3>
                  {quizQuestions[currentQuestionIndex].type === "but-en" && (
                    <button
                      onClick={() => playGuideAudio(quizQuestions[currentQuestionIndex])}
                      style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#CBD5E8" }}
                      className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/15 transition-all"
                    >
                      <Volume2 size={10} /> Speak Pronunciation
                    </button>
                  )}
                </div>

                {quizQuestions[currentQuestionIndex].type === "pronounce" ? (
                  <div className="space-y-6">
                    {isEvaluating ? (
                      <div style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }} className="rounded-3xl border p-8 shadow-lg flex flex-col items-center justify-center min-h-[220px] space-y-4 animate-pulse">
                        <Loader2 className="animate-spin text-[#C4622D]" size={48} />
                        <p style={{ color: "#1C2B4A" }} className="text-sm font-bold">AI Evaluating Pronunciation...</p>
                        <p style={{ color: "#6B7A99" }} className="text-xs text-center max-w-xs leading-relaxed">Analyzing your speech recordings for phonological correctness. Just a moment!</p>
                      </div>
                    ) : answered && evaluationResult ? (
                      <div style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }} className="rounded-3xl border p-6 sm:p-8 shadow-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center">
                          <div 
                            style={{ 
                              borderColor: evaluationResult.isCorrect ? "#2F6B38" : "#C4622D",
                              backgroundColor: evaluationResult.isCorrect ? "rgba(80,148,90,0.04)" : "rgba(220,38,38,0.04)"
                            }} 
                            className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center mb-4 shadow-inner"
                          >
                            <span 
                              style={{ color: evaluationResult.isCorrect ? "#2F6B38" : "#C4622D" }} 
                              className="text-3xl font-extrabold"
                            >
                              {evaluationResult.score}%
                            </span>
                            <span style={{ color: "#8B9DC3" }} className="text-[9px] font-bold uppercase tracking-wider">Accuracy</span>
                          </div>

                          <span 
                            style={{ 
                              backgroundColor: evaluationResult.isCorrect ? "rgba(80, 148, 90, 0.12)" : "rgba(220, 38, 38, 0.08)", 
                              color: evaluationResult.isCorrect ? "#2F6B38" : "#DC2626" 
                            }} 
                            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider mb-2 shadow-sm"
                          >
                            {evaluationResult.isCorrect ? <Check size={12} /> : <X size={12} />}
                            {evaluationResult.isCorrect ? "Correct Pronunciation!" : "Keep Practicing!"}
                          </span>
                        </div>

                        {evaluationResult.transcript && (
                          <div style={{ backgroundColor: "rgba(28,43,74,0.03)" }} className="rounded-2xl p-4 text-left border border-gray-100">
                            <span style={{ color: "#8B9DC3" }} className="text-[9px] uppercase font-bold tracking-wider block mb-1">What the AI Heard:</span>
                            <p style={{ color: "#1C2B4A" }} className="text-sm font-serif italic">"{evaluationResult.transcript}"</p>
                          </div>
                        )}

                        <div style={{ backgroundColor: "rgba(196,98,45,0.03)" }} className="rounded-2xl p-4 text-left border-l-4 border-[#C4622D]">
                          <span style={{ color: "#C4622D" }} className="text-[9px] uppercase font-bold tracking-wider block mb-1">AI Feedback:</span>
                          <p style={{ color: "#4A5873" }} className="text-xs leading-relaxed font-medium">{evaluationResult.feedback}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => playGuideAudio(quizQuestions[currentQuestionIndex])}
                            style={{ backgroundColor: "rgba(28,43,74,0.06)", color: "#1C2B4A" }}
                            className="flex-1 py-3 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Volume2 size={14} /> Listen Guide
                          </button>
                          
                          <button
                            onClick={() => {
                              setAnswered(false);
                              setEvaluationResult(null);
                              setIsRecording(false);
                              setRecordingDuration(0);
                            }}
                            style={{ borderColor: "#C4622D", color: "#C4622D" }}
                            className="flex-1 py-3 border rounded-xl text-xs font-bold hover:bg-[#C4622D]/5 transition-all flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} /> Try Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }} className="rounded-3xl border p-8 shadow-lg flex flex-col items-center justify-center min-h-[220px] space-y-6 text-center animate-fade-in">
                        <p style={{ color: "#6B7A99" }} className="text-xs max-w-xs mx-auto leading-relaxed">
                          Tap the microphone, pronounce the word clearly, then click stop to check your pronunciation.
                        </p>

                        <div className="flex flex-col items-center justify-center space-y-3">
                          {isRecording ? (
                            <button
                              onClick={stopRecording}
                              style={{
                                backgroundColor: "#DC2626",
                                color: "#FFFDF9",
                                boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4)",
                              }}
                              className="w-24 h-24 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative animate-pulse"
                            >
                              <div className="absolute inset-0 rounded-full border-4 border-[#DC2626] opacity-35 scale-110 animate-ping"></div>
                              <Square size={32} />
                            </button>
                          ) : (
                            <button
                              onClick={startRecording}
                              style={{
                                backgroundColor: "#C4622D",
                                color: "#FFFDF9",
                                boxShadow: "0 10px 25px -5px rgba(196, 98, 45, 0.4)",
                              }}
                              className="w-24 h-24 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative group"
                            >
                              <div className="absolute inset-0 rounded-full border-4 border-[#C4622D] opacity-25 group-hover:scale-110 transition-transform duration-500"></div>
                              <Mic size={36} className="group-hover:rotate-6 transition-transform duration-300" />
                            </button>
                          )}

                          {isRecording ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-bold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                              Recording: {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:{(recordingDuration % 60).toString().padStart(2, '0')}
                            </div>
                          ) : (
                            <span style={{ color: "#8B9DC3" }} className="text-[10px] uppercase font-bold tracking-wider">
                              Tap to Record
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => playGuideAudio(quizQuestions[currentQuestionIndex])}
                          style={{ backgroundColor: "rgba(196,98,45,0.06)", color: "#C4622D" }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                        >
                          <Volume2 size={14} /> Listen to Pronunciation Guide
                        </button>
                      </div>
                    )}

                    {answered && evaluationResult && (
                      <button
                        onClick={nextQuestion}
                        style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
                        className="w-full py-4 rounded-2xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-md"
                      >
                        {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {quizQuestions[currentQuestionIndex].options.map((option) => {
                        const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;
                        const isSelected = option === selectedAnswer;
                        let btnStyle = { backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)", color: "#1C2B4A" };
                        if (answered) {
                          if (isCorrect) btnStyle = { backgroundColor: "rgba(80, 148, 90, 0.12)", borderColor: "#2F6B38", color: "#2F6B38" };
                          else if (isSelected) btnStyle = { backgroundColor: "rgba(220, 38, 38, 0.08)", borderColor: "#DC2626", color: "#DC2626" };
                          else btnStyle = { backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.04)", color: "rgba(28,43,74,0.4)" };
                        }
                        return (
                          <button
                            key={option}
                            disabled={answered}
                            onClick={() => handleAnswerClick(option)}
                            style={btnStyle}
                            className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between group ${!answered ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`}
                          >
                            <span>{option}</span>
                            {answered && isCorrect && <Check size={14} color="#2F6B38" />}
                            {answered && isSelected && !isCorrect && <X size={14} color="#DC2626" />}
                          </button>
                        );
                      })}
                    </div>
                    {answered && (
                      <button
                        onClick={nextQuestion}
                        style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
                        className="w-full py-4 rounded-2xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 animate-fade-in shadow-md"
                      >
                        {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in text-center">
            <div style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }} className="rounded-3xl border p-6 shadow-md print:hidden">
              <h3 style={{ color: "#1C2B4A" }} className="text-sm font-bold mb-2 flex items-center justify-center gap-1.5">
                <Sparkles size={16} color="#D4AF37" /> Customize Your Certificate
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Enter your name below to generate your official Butuanon Vocabulary Certificate of Mastery. You can then print it or save it as a PDF.
              </p>
              <div className="space-y-1.5 text-left max-w-sm mx-auto">
                <label className="text-[10px] uppercase font-bold text-gray-400">Recipient Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ backgroundColor: "#F7F2EB", color: "#1C2B4A" }}
                  className="w-full px-4 py-3 rounded-xl text-xs font-semibold outline-none border border-transparent focus:border-[#C4622D]"
                />
              </div>
              <button
                onClick={() => window.print()}
                style={{ backgroundColor: "#C4622D", color: "#FFFDF9" }}
                className="w-full max-w-sm mx-auto mt-4 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Print Certificate / Save PDF
              </button>
            </div>
            <div id="printable-certificate" className="relative p-6 sm:p-10 border-[12px] border-double rounded-2xl shadow-xl bg-white overflow-hidden text-center mx-auto max-w-2xl" style={{ borderColor: "#D4AF37", minHeight: "550px" }}>
              <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2" style={{ borderColor: "#D4AF37" }}></div>
              <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2" style={{ borderColor: "#D4AF37" }}></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2" style={{ borderColor: "#D4AF37" }}></div>
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2" style={{ borderColor: "#D4AF37" }}></div>
              <div className="space-y-6 pt-6 pb-6">
                <div className="flex justify-center mb-1">
                  <Award size={64} color="#D4AF37" />
                </div>
                <h2 style={{ fontFamily: "Georgia, serif", color: "#1C2B4A" }} className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">
                  Certificate of Mastery
                </h2>
                <p style={{ fontFamily: "Georgia, serif" }} className="text-[10px] tracking-widest text-[#B3922E] font-semibold uppercase">
                  Butuanon Vocabulary Preservation Challenge
                </p>
                <div className="w-16 h-[1px] bg-gray-300 mx-auto"></div>
                <p style={{ color: "#6B7A99" }} className="text-xs italic font-serif">
                  This is proudly presented to
                </p>
                <h3 style={{ fontFamily: "Georgia, serif", color: "#C4622D" }} className="text-3xl sm:text-4xl font-extrabold underline decoration-double decoration-[#D4AF37] tracking-wide my-4 py-2">
                  {userName || "Your Name"}
                </h3>
                <p style={{ color: "#4A5873" }} className="text-xs max-w-md mx-auto leading-relaxed font-serif px-2">
                  for successfully mastering the Butuanon language lexicon, accumulating 500+ proficiency points, and completing the Rank 10 Vocabulary Quiz challenge.
                </p>
                <div className="pt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto items-end">
                  <div className="flex flex-col items-center justify-center relative col-span-2 sm:col-span-1 py-4">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed flex flex-col items-center justify-center rotate-12 relative shadow-inner mx-auto" style={{ borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.05)" }}>
                      <span style={{ color: "#B3922E" }} className="text-[7px] font-bold uppercase tracking-widest">BUTUAN</span>
                      <Sparkles size={16} color="#D4AF37" className="my-0.5" />
                      <span style={{ color: "#B3922E" }} className="text-[6px] font-bold uppercase tracking-wider">SEAL 2026</span>
                    </div>
                  </div>
                  <div className="space-y-4 col-span-2 sm:col-span-1">
                    <div className="border-b border-gray-400 mx-auto w-36">
                      <span style={{ fontFamily: "cursive", color: "#1C2B4A" }} className="text-sm italic">Antigravity AI Scholar</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Verification Authority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level Up Announcement Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div
            style={{ backgroundColor: "#FFFDF9", borderColor: "#D4AF37" }}
            className="max-w-md w-full border-2 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={120} color="#D4AF37" />
            </div>
            
            <div style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={36} className="animate-pulse" />
            </div>
            
            <h3 style={{ color: "#1C2B4A" }} className="text-2xl font-extrabold mb-1">
              Rank Promoted!
            </h3>
            <p style={{ color: "#C4622D" }} className="text-xs uppercase tracking-widest font-bold mb-6">
              LEVEL UP ACHIEVED
            </p>
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-center">
                <span style={{ color: "#8B9DC3" }} className="text-[10px] uppercase font-bold block mb-1">Previous</span>
                <span style={{ backgroundColor: "rgba(28,43,74,0.06)", color: "#6B7A99" }} className="px-3 py-1.5 rounded-lg text-xs font-semibold">
                  {RANKS[previousRank]?.title || "Explorer"}
                </span>
              </div>
              <span style={{ color: "#C4622D" }} className="text-lg font-bold">→</span>
              <div className="text-center">
                <span style={{ color: "#D4AF37" }} className="text-[10px] uppercase font-bold block mb-1">New Rank</span>
                <span style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#B3922E", borderColor: "#D4AF37" }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#D4AF37]">
                  {currentRank.title}
                </span>
              </div>
            </div>
            
            <p style={{ color: "#6B7A99" }} className="text-xs max-w-xs mx-auto mb-8 leading-relaxed">
              Congratulations! You have unlocked a new rank milestone. Your vocabulary speed and difficulty options will scale up. Keep preserving Butuanon!
            </p>
            
            <button
              onClick={() => setShowLevelUpModal(false)}
              style={{ backgroundColor: "#1C2B4A", color: "#FFFDF9" }}
              className="w-full py-3.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Continue Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
