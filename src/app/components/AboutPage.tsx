import { BookOpen, Globe, Users, Award, Heart, Mic } from "lucide-react";

const team = [
  {
    name: "Dr. Maria Santos",
    role: "Lead Researcher, Linguistics",
    description:
      "Specializes in Austronesian languages with 15 years of field research in Butuan City.",
  },
  {
    name: "Prof. Jose Dela Cruz",
    role: "Cultural Heritage Consultant",
    description:
      "Expert in Mindanaoan indigenous cultures and oral traditions of the Butuanon people.",
  },
  {
    name: "Ana Reyes, M.A.",
    role: "Lexicographer & Data Curator",
    description:
      "Compiled and verified over 2,400 dictionary entries with native speaker validation.",
  },
  {
    name: "Carlo Mendoza",
    role: "AI/NLP Engineer",
    description:
      "Developed the neural translation model trained on Butuanon-English parallel corpora.",
  },
];

const milestones = [
  { year: "2021", event: "Project inception at FSUU College of Arts and Sciences" },
  { year: "2022", event: "Community field research and native speaker interviews" },
  { year: "2023", event: "First draft of Butuanon digital lexicon (1,200 entries)" },
  { year: "2024", event: "AI translation model trained; web platform launched" },
];

export function AboutPage() {
  return (
    <div
      style={{ backgroundColor: "#F7F2EB", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1C2B4A 0%, #243559 100%)",
        }}
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            style={{ backgroundColor: "rgba(196, 98, 45, 0.15)" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          >
            <Heart size={14} color="#C4622D" />
            <span style={{ color: "#C4622D" }} className="text-xs font-semibold">
              Language Preservation Initiative
            </span>
          </div>
          <h1 style={{ color: "#F7F2EB" }} className="text-3xl font-bold mb-4">
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
          style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
          className="rounded-2xl border p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{ backgroundColor: "rgba(196, 98, 45, 0.1)" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <Globe size={18} color="#C4622D" />
            </div>
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-semibold">
              Our Mission
            </h2>
          </div>
          <p style={{ color: "#4A5873" }} className="text-sm leading-relaxed mb-4">
            The Butuanon language is spoken by the indigenous Butuanon people of Butuan City,
            Agusan del Norte, in the Caraga region of Mindanao, Philippines. Like many minority
            languages in Southeast Asia, Butuanon faces the risk of decline as younger generations
            shift toward dominant languages such as Cebuano and Filipino.
          </p>
          <p style={{ color: "#4A5873" }} className="text-sm leading-relaxed mb-4">
            This platform was created to bridge the gap between oral tradition and digital access —
            providing a comprehensive dictionary, AI-powered translation tools, and audio recordings
            that capture authentic Butuanon pronunciation from native speakers.
          </p>
          <p style={{ color: "#4A5873" }} className="text-sm leading-relaxed">
            We believe that language is the foundation of culture. By making Butuanon accessible
            online, we empower learners, researchers, and the diaspora community to connect with
            their heritage — and ensure this language thrives for generations to come.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, value: "2,400+", label: "Dictionary Entries" },
            { icon: Mic, value: "800+", label: "Audio Recordings" },
            { icon: Users, value: "50+", label: "Native Speaker Contributors" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
              className="rounded-2xl border p-5 text-center"
            >
              <div
                style={{ backgroundColor: "rgba(196, 98, 45, 0.1)" }}
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              >
                <Icon size={18} color="#C4622D" />
              </div>
              <p style={{ color: "#1C2B4A" }} className="text-xl font-bold">
                {value}
              </p>
              <p style={{ color: "#8B9DC3" }} className="text-xs mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ backgroundColor: "#C4622D" }} className="w-1 h-6 rounded-full" />
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-semibold">
              Project Timeline
            </h2>
          </div>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    style={{ backgroundColor: "#C4622D" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <span style={{ color: "#FFFDF9" }} className="text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  {i < milestones.length - 1 && (
                    <div
                      style={{ backgroundColor: "rgba(196, 98, 45, 0.2)" }}
                      className="w-0.5 h-8 mt-1"
                    />
                  )}
                </div>
                <div className="pt-1">
                  <span
                    style={{ color: "#C4622D" }}
                    className="text-xs font-semibold"
                  >
                    {m.year}
                  </span>
                  <p style={{ color: "#4A5873" }} className="text-sm mt-0.5">
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
            <div style={{ backgroundColor: "#C4622D" }} className="w-1 h-6 rounded-full" />
            <h2 style={{ color: "#1C2B4A" }} className="text-lg font-semibold">
              Research Team
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                style={{ backgroundColor: "#FFFDF9", borderColor: "rgba(28,43,74,0.08)" }}
                className="rounded-2xl border p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{ backgroundColor: "#1C2B4A" }}
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <span style={{ color: "#F7F2EB" }} className="text-sm font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: "#1C2B4A" }} className="text-sm font-semibold">
                      {member.name}
                    </p>
                    <p style={{ color: "#C4622D" }} className="text-xs mb-2">
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
            background: "linear-gradient(135deg, #1C2B4A 0%, #243559 100%)",
          }}
          className="rounded-2xl p-8 text-center"
        >
          <div
            style={{ backgroundColor: "rgba(196, 98, 45, 0.15)" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          >
            <Award size={28} color="#C4622D" />
          </div>
          <h3 style={{ color: "#F7F2EB" }} className="text-lg font-semibold mb-2">
            Father Saturnino Urios University
          </h3>
          <p style={{ color: "#8B9DC3" }} className="text-sm mb-1">
            Butuan City, Agusan del Norte, Philippines
          </p>
          <p style={{ color: "#8B9DC3" }} className="text-xs mb-4">
            College of Arts, Sciences and Education · Department of Filipino and Literature
          </p>
          <p style={{ color: "#6B7A99" }} className="text-xs leading-relaxed max-w-md mx-auto">
            This research project was conducted under the auspices of the FSUU Research Center
            with support from the National Commission for Culture and the Arts (NCCA) and the
            Commission on the Filipino Language (KWF).
          </p>
        </div>
      </div>
    </div>
  );
}
