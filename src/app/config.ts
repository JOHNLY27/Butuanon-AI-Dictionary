// Central configuration for API endpoint routing
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Supabase direct access (used when backend is offline or on Vercel)
export const SUPABASE_URL = "https://dfxiwarvtwdpppjahlhv.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGl3YXJ2dHdkcHBwamFobGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTk4NjQsImV4cCI6MjA5NjgzNTg2NH0.7s9PaSkY2HEvIROcWmsfuvo1-kBGnBOhTiQ9fwCEO2g";

export const isBackendUnreachable = (): boolean => {
  if (typeof window === "undefined") return false;
  // If deployed to Vercel/cloud and API_BASE_URL still points to localhost, backend cannot be reached
  return window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && API_BASE_URL.includes("localhost");
};
