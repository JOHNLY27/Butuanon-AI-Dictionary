import { useState, useEffect } from "react";
import { BookOpen, Globe, Users, Award, Heart, Mic } from "lucide-react";
import { dictionaryEntries } from "./DictionaryPage";
import { API_BASE_URL } from "../config";

const team = [
  {
    name: "John Patrick Gura",
    role: "Project Leader & Team Head",
    description:
      "Leads the capstone project initiative, overseeing research coordination, project management, and strategic development.",
  },
  {
    name: "John Lydrick H. Remitar",
    role: "Full-Stack Developer & AI Systems Engineer",
    description:
      "Designed and built the full-stack web application, database architecture, API backend, and AI translation pipeline integration.",
  },
  {
    name: "Fei Yi",
    role: "Research & Data Curator Specialist",
    description:
      "Specializes in Butuanon lexicography, language data collection, entry validation, and linguistic research.",
  },
  {
    name: "Calvin Zack Alvizo",
    role: "UI/UX & Multimedia Specialist",
    description:
      "Focuses on user interface design, user experience optimization, media assets, and frontend component layout.",
  },
];

const milestones = [
  { year: "Phase 1", event: "Capstone Inception & Research Planning at Father Saturnino Urios University (FSUU)" },
  { year: "Phase 2", event: "Butuanon Lexicon Data Curation & Database Schema Architecture" },
  { year: "Phase 3", event: "Full-Stack Web Development & Google Gemini RAG Translation Integration" },
  { year: "Phase 4", event: "Native Audio Streaming, Web Platform Deployment & Capstone Presentation" },
];

export function AboutPage() {
  const [entryCount, setEntryCount] = useState<number>(dictionaryEntries.length);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dictionary`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEntryCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{ backgroundColor: "var(--background)", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--river-blue) 0%, #103E56 100%)",
        }}
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            style={{ backgroundColor: "rgba(212, 175, 55, 0.18)" }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 border border-[var(--golden-heritage)]/30"
          >
            <img src="/logo.png" alt="Balanghay Logo" className="w-5 h-5 rounded-full object-cover border border-[var(--golden-heritage)]" />
            <span style={{ color: "var(--golden-heritage)" }} className="text-xs font-bold">
              Butuan Balanghay Heritage & Language Initiative
            </span>
          </div>
          <h1 style={{ color: "var(--ivory-sail)" }} className="text-3xl font-bold mb-4">
            About This Project
          </h1>
          <p style={{ color: "#8B9DC3" }} className="text-sm leading-relaxed max-w-2xl mx-auto">
            A collaborative effort between Father Saturnino Urios University and the Butuanon
            community to document, preserve, and promote an endangered indigenous language through
            modern technology.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <div
          style={{ backgroundColor: "var(--card)", borderColor: "rgba(28,43,74,0.08)" }}
          className="rounded-2xl border p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{ backgroundColor: "rgba(212, 175, 55, 0.15)" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <Globe size={18} style={{ color: "var(--river-blue)" }} />
            </div>
            <h2 style={{ color: "var(--river-blue)" }} className="text-lg font-bold">
              Our Mission
            </h2>
          </div>
          <p style={{ color: "#334155" }} className="text-sm leading-relaxed mb-4">
            The Butuanon language is spoken by the indigenous Butuanon people of Butuan City,
            Agusan del Norte, in the Caraga region of Mindanao, Philippines. Like many minority
            languages in Southeast Asia, Butuanon faces the risk of decline as younger generations
            shift toward dominant languages such as Cebuano and Filipino.
          </p>
          <p style={{ color: "#334155" }} className="text-sm leading-relaxed mb-4">
            This platform was created to bridge the gap between oral tradition and digital access —
            providing a comprehensive dictionary, AI-powered translation tools, and audio recordings
            that capture authentic Butuanon pronunciation from native speakers.
          </p>
          <p style={{ color: "#334155" }} className="text-sm leading-relaxed">
            We believe that language is the foundation of culture. By making Butuanon accessible
            online, we empower learners, researchers, and the diaspora community to connect with
            their heritage — and ensure this language thrives for generations to come.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, value: `${entryCount}+`, label: "Dictionary Entries" },
            { icon: Mic, value: `${entryCount}+`, label: "Audio Pronunciations" },
            { icon: Users, value: "50+", label: "Native Speaker Contributors" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              style={{ backgroundColor: "var(--card)", borderColor: "rgba(28,43,74,0.08)" }}
              className="rounded-2xl border p-5 text-center shadow-sm"
            >
              <div
                style={{ backgroundColor: "rgba(212, 175, 55, 0.15)" }}
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              >
                <Icon size={18} style={{ color: "var(--river-blue)" }} />
              </div>
              <p style={{ color: "var(--river-blue)" }} className="text-xl font-bold">
                {value}
              </p>
              <p style={{ color: "#6B7A99" }} className="text-xs mt-1 font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-1.5 h-6 rounded-full" />
            <h2 style={{ color: "var(--river-blue)" }} className="text-lg font-bold">
              Project Timeline
            </h2>
          </div>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    style={{ backgroundColor: "var(--golden-heritage)", color: "#0F1D30" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm"
                  >
                    {i + 1}
                  </div>
                  {i < milestones.length - 1 && (
                    <div
                      style={{ backgroundColor: "rgba(212, 175, 55, 0.3)" }}
                      className="w-0.5 h-8 mt-1"
                    />
                  )}
                </div>
                <div className="pt-1">
                  <span
                    style={{ color: "var(--river-blue)" }}
                    className="text-xs font-bold"
                  >
                    {m.year}
                  </span>
                  <p style={{ color: "#334155" }} className="text-sm mt-0.5 font-medium">
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-1.5 h-6 rounded-full" />
            <h2 style={{ color: "var(--river-blue)" }} className="text-lg font-bold">
              Research Team
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{ backgroundColor: "var(--river-blue)" }}
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <span style={{ color: "var(--golden-heritage)" }} className="text-sm font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: "var(--river-blue)" }} className="text-sm font-bold">
                      {member.name}
                    </p>
                    <p style={{ color: "var(--golden-heritage)" }} className="text-xs mb-2 font-bold">
                      {member.role}
                    </p>
                    <p style={{ color: "#6B7A99" }} className="text-xs leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FSUU Credit */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--river-blue) 0%, #162942 100%)",
          }}
          className="rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden mt-10"
        >
          <p style={{ color: "#8B9DC3" }} className="text-xs leading-relaxed max-w-md mx-auto font-medium">
            This research project was conducted under the auspices of the FSUU Research Center
            with support from the National Commission for Culture and the Arts (NCCA) and the
            Commission on the Filipino Language (KWF).
          </p>
        </div>
      </div>
    </div>
  );
}
