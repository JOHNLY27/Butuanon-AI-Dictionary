import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { DictionaryPage } from "./components/DictionaryPage";
import { TranslatePage } from "./components/TranslatePage";
import { AboutPage } from "./components/AboutPage";
import { QuizPage } from "./components/QuizPage";
import { AuthModal } from "./components/AuthModal";
import { AdminPage } from "./components/AdminPage";
import { API_BASE_URL } from "./config";
import { X, Share } from "lucide-react";
import "../styles/fonts.css";

type Page = "home" | "dictionary" | "translate" | "quiz" | "about" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // PWA custom install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIosPromptVisible, setIsIosPromptVisible] = useState(false);

  // Check if app is running in standalone (installed) mode
  const getIsInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  };

  // Load user session on mount
  useEffect(() => {
    const guest = localStorage.getItem("guest_user");
    if (guest) {
      try {
        setUser(JSON.parse(guest));
      } catch (e) {
        console.error(e);
      }
    } else {
      const token = localStorage.getItem("auth_token");
      if (token) {
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            setUser(null);
          } else {
            return res.json();
          }
        })
        .then((data) => {
          if (data) {
            setUser(data);
            localStorage.setItem("auth_user", JSON.stringify(data));
          }
        })
        .catch((err) => {
          console.error("Me profile fetch error:", err);
        });
      }
    }
  }, []);

  // Listen for installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!getIsInstalled()) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it's iOS and not installed/standalone, show custom tooltip instructions
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos && !getIsInstalled()) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem("ios_install_prompt_dismissed");
        if (!dismissed) {
          setIsIosPromptVisible(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  const handleDismissIosPrompt = () => {
    setIsIosPromptVisible(false);
    localStorage.setItem("ios_install_prompt_dismissed", "true");
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.removeItem("guest_user");
    setUser(userData);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("guest_user");
    navigate("home");
  };

  const handleUpdateUserXp = (points: number) => {
    setUser((u: any) => {
      if (!u) return null;
      const updated = { ...u, xp_points: u.xp_points + points };
      if (u.is_guest) {
        localStorage.setItem("guest_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  function navigate(page: string) {
    if (page === "admin" && !user?.isAdmin) {
      setCurrentPage("home");
    } else {
      setCurrentPage(page as Page);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F2EB" }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === "home" && <HomePage onNavigate={navigate} />}
        {currentPage === "dictionary" && <DictionaryPage />}
        {currentPage === "translate" && <TranslatePage />}
        {currentPage === "quiz" && (
          <QuizPage
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onUpdateUserXp={handleUpdateUserXp}
          />
        )}
        {currentPage === "about" && <AboutPage />}
        {currentPage === "admin" && (
          user?.isAdmin ? (
            <AdminPage user={user} />
          ) : (
            <HomePage onNavigate={navigate} />
          )
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PWA Install Banner for Android/Chrome/Edge */}
      {showInstallBanner && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[9999] w-[92%] max-w-sm rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in shadow-2xl border border-amber-900/10"
          style={{ backgroundColor: "#FFFDF9", fontFamily: "Poppins, sans-serif" }}
        >
          <button 
            onClick={() => setShowInstallBanner(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-3.5">
            <img 
              src="/icon-192.png" 
              alt="App Icon" 
              className="w-12 h-12 rounded-xl object-cover shadow-md border border-gray-100 flex-shrink-0" 
            />
            <div className="text-left">
              <p style={{ color: "#1C2B4A" }} className="font-bold text-sm leading-tight">Butuanon Dictionary</p>
              <p style={{ color: "#6B7A99" }} className="text-[10px] leading-snug mt-0.5 max-w-[170px]">Install as a mobile app for offline access and fast launches!</p>
            </div>
          </div>
          
          <button 
            onClick={handleInstallClick}
            style={{ backgroundColor: "#C4622D" }}
            className="text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
          >
            Install
          </button>
        </div>
      )}

      {/* iOS Installation Instruction Popup */}
      {isIosPromptVisible && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-sm rounded-2xl p-4 flex flex-col gap-3.5 animate-fade-in shadow-2xl border border-amber-900/10"
          style={{ backgroundColor: "#FFFDF9", fontFamily: "Poppins, sans-serif" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <img 
                src="/icon-192.png" 
                alt="App Icon" 
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-gray-100 flex-shrink-0" 
              />
              <div className="text-left">
                <p style={{ color: "#1C2B4A" }} className="font-bold text-sm leading-tight">Install on iPhone</p>
                <p style={{ color: "#6B7A99" }} className="text-[10px] leading-snug mt-0.5">Add to your Home Screen in 2 easy steps:</p>
              </div>
            </div>
            <button 
              onClick={handleDismissIosPrompt}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
          
          <div style={{ backgroundColor: "#F7F2EB" }} className="rounded-xl p-3 text-xs text-left leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span style={{ backgroundColor: "#C4622D" }} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</span>
              <p style={{ color: "#1C2B4A" }} className="m-0 leading-tight">
                Tap the <strong className="font-bold">Share</strong> button <span className="inline-flex items-center justify-center p-0.5 rounded border border-gray-300 bg-white"><Share size={12} className="text-[#C4622D] inline" /></span> in Safari.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ backgroundColor: "#C4622D" }} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</span>
              <p style={{ color: "#1C2B4A" }} className="m-0 leading-tight">
                Scroll down and select <strong className="font-bold">Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
