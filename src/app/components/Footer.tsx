import { ExternalLink, MapPin } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleProjectClick = (item: string) => {
    if (!onNavigate) return;
    if (item === "Dictionary") {
      onNavigate("dictionary");
    } else if (item === "AI Translator") {
      onNavigate("translate");
    } else if (item === "Word of the Day") {
      onNavigate("home");
      setTimeout(() => {
        const el = document.getElementById("word-of-the-day");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else if (item === "About") {
      onNavigate("about");
    }
  };

  return (
    <footer style={{ backgroundColor: "var(--river-blue)" }} className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div 
              onClick={() => onNavigate?.("home")}
              className="flex items-center gap-2 mb-3 cursor-pointer group w-fit"
            >
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden border border-[var(--golden-heritage)]/40 shadow-sm bg-[#0F1D30] group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Butuanon Dictionary Logo with Balanghay Boat" className="w-full h-full object-cover scale-105" />
              </div>
              <span
                style={{ color: "var(--ivory-sail)", fontFamily: "Poppins, sans-serif" }}
                className="font-semibold group-hover:text-[var(--golden-heritage)] transition-colors"
              >
                Butuanon Dictionary
              </span>
            </div>
            <p
              style={{ color: "#A0B2D6", fontFamily: "Poppins, sans-serif" }}
              className="text-sm leading-relaxed"
            >
              Preserving and promoting the Butuanon language through technology
              and community.
            </p>
          </div>

          {/* Project */}
          <div>
            <h4
              style={{ color: "var(--golden-heritage)", fontFamily: "Poppins, sans-serif" }}
              className="text-sm font-semibold mb-3 uppercase tracking-wider"
            >
              Project
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Dictionary", page: "dictionary" },
                { name: "AI Translator", page: "translate" },
                { name: "Word of the Day", page: "home" },
                { name: "About", page: "about" }
              ].map(({ name }) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => handleProjectClick(name)}
                    style={{
                      color: "#A0B2D6",
                      fontFamily: "Poppins, sans-serif",
                    }}
                    className="text-sm hover:text-white transition-colors cursor-pointer text-left block hover:translate-x-1 duration-200"
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institution */}
          <div>
            <h4
              style={{ color: "var(--golden-heritage)", fontFamily: "Poppins, sans-serif" }}
              className="text-sm font-semibold mb-3 uppercase tracking-wider"
            >
              Institution
            </h4>
            <div className="space-y-2">
              <a
                href="https://urios.edu.ph/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#A0B2D6", fontFamily: "Poppins, sans-serif" }}
                className="text-sm leading-relaxed hover:text-white transition-colors flex items-center gap-1.5 group w-fit"
                title="Visit Father Saturnino Urios University Website"
              >
                <span className="group-hover:underline">Father Saturnino Urios University</span>
                <ExternalLink size={13} className="text-[var(--golden-heritage)] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>

              <a
                href="https://maps.google.com/?q=Father+Saturnino+Urios+University,+Butuan+City"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#8396BA", fontFamily: "Poppins, sans-serif" }}
                className="text-xs leading-relaxed hover:text-[#A0B2D6] transition-colors flex items-start gap-1.5 group w-fit"
                title="View on Google Maps"
              >
                <MapPin size={13} className="mt-0.5 text-[var(--golden-heritage)] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <span className="group-hover:underline">
                  Butuan City, Agusan del Norte<br />
                  Philippines
                </span>
              </a>
            </div>
          </div>
        </div>

        <div
          style={{ borderColor: "rgba(160, 178, 214, 0.2)" }}
          className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <p
            style={{ color: "#A0B2D6", fontFamily: "Poppins, sans-serif" }}
            className="text-xs"
          >
            © {new Date().getFullYear()} Butuanon-English AI Dictionary ·{" "}
            <a
              href="https://urios.edu.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:underline transition-colors"
            >
              Father Saturnino Urios University (FSUU)
            </a>
          </p>
          <p
            style={{ color: "#8396BA", fontFamily: "Poppins, sans-serif" }}
            className="text-xs"
          >
            A language preservation initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
