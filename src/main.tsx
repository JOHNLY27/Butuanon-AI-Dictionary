import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker for installable offline PWA support
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);