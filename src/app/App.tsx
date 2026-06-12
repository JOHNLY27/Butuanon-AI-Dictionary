import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { DictionaryPage } from "./components/DictionaryPage";
import { TranslatePage } from "./components/TranslatePage";
import { AboutPage } from "./components/AboutPage";
import { QuizPage } from "./components/QuizPage";
import { AuthModal } from "./components/AuthModal";
import "../styles/fonts.css";

type Page = "home" | "dictionary" | "translate" | "quiz" | "about";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("http://localhost:8000/api/auth/me", {
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
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("home");
  };

  const handleUpdateUserXp = (points: number) => {
    setUser((u: any) => u ? { ...u, xp_points: u.xp_points + points } : null);
  };

  function navigate(page: string) {
    setCurrentPage(page as Page);
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
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
