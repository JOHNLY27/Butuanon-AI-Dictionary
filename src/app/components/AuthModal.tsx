import React, { useState, useEffect } from "react";
import { Sparkles, LogIn, AlertCircle, Gamepad2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { API_BASE_URL } from "../config";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  onPlayAsGuest?: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, onPlayAsGuest }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch Google Client ID from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.google_client_id) {
          setClientId(data.google_client_id);
        }
      })
      .catch((err) => {
        console.error("Failed fetching auth config:", err);
      });
  }, []);

  // Dynamically load Google script when modal opens
  useEffect(() => {
    if (!isOpen || !clientId) return;

    // Remove any existing script to avoid duplication
    const existingScript = document.getElementById("google-gis-script");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const initializeGoogleBtn = () => {
      const g = (window as any).google;
      if (g && g.accounts) {
        g.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        g.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            width: 280,
            text: "signin_with",
            shape: "pill",
          }
        );
      }
    };

    // Poll until Google API is loaded on window
    const pollInterval = setInterval(() => {
      if ((window as any).google && (window as any).google.accounts) {
        initializeGoogleBtn();
        clearInterval(pollInterval);
      }
    }, 150);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isOpen, clientId]);

  const handleCredentialResponse = (response: any) => {
    setLoading(true);
    setError(null);

    // Send Google credential token to backend
    fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Google login exchange failed.");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        onLoginSuccess(data.user, data.token);
        onClose();
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setError("Failed to sign in with Google. Please check your credentials and try again.");
        setLoading(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent style={{ backgroundColor: "#FFFDF9", fontFamily: "Poppins, sans-serif" }} className="max-w-md rounded-3xl border-none p-8 shadow-2xl text-center">
        <DialogHeader className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--golden-heritage)] shadow-md mb-3 bg-[#0F1D30]">
            <img src="/logo.png" alt="Butuanon Balanghay Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <DialogTitle style={{ color: "var(--river-blue)" }} className="text-xl font-bold flex items-center gap-1.5 justify-center">
            <Sparkles size={20} style={{ color: "var(--golden-heritage)" }} /> Sign In / Sign Up
          </DialogTitle>
          <DialogDescription style={{ color: "#6B7A99" }} className="text-xs mt-1 max-w-xs leading-relaxed mx-auto">
            Preserve Butuanon history and compete with others. Connect your Google account to unlock flashcards and vocabulary quizzes.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div style={{ backgroundColor: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.18)", color: "#DC2626" }} className="rounded-xl border p-3.5 mb-6 text-xs flex items-start gap-2 text-left">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-4 min-h-[70px]">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div style={{ borderTopColor: "var(--golden-heritage)" }} className="w-6 h-6 border-2 border-gray-300 rounded-full animate-spin"></div>
              <span style={{ color: "#6B7A99" }} className="text-xs font-semibold">Exchanging Google session...</span>
            </div>
          ) : clientId === "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com" || !clientId ? (
            <div style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", borderColor: "rgba(212, 175, 55, 0.25)", color: "#0F1D30" }} className="rounded-xl border p-4 text-xs text-left max-w-sm mb-2">
              <p className="font-bold mb-1">Configuration Needed</p>
              <p className="leading-relaxed">
                Google Client ID is not configured yet. Please edit <code>backend/.env</code> and replace the placeholder value with your Google Cloud OAuth client credentials to enable Google Sign-In.
              </p>
            </div>
          ) : (
            <div id="google-signin-btn" className="hover:scale-102 transition-transform"></div>
          )}
        </div>

        <div className="flex items-center my-3 w-full max-w-xs mx-auto">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <button
          onClick={() => {
            if (onPlayAsGuest) {
              onPlayAsGuest();
            }
          }}
          style={{ backgroundColor: "var(--river-blue)", color: "#FFFFFF" }}
          className="w-full max-w-xs mx-auto py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Gamepad2 size={16} /> Play as Guest & Go to Quiz
        </button>

        <p style={{ color: "#8B9DC3" }} className="text-[10px] uppercase font-bold tracking-wider mt-4">
          SECURE LOG-IN POWERED BY GOOGLE
        </p>
      </DialogContent>
    </Dialog>
  );
}
