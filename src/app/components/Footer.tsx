import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1C2B4A" }} className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{ backgroundColor: "#C4622D" }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
              >
                <BookOpen size={16} color="#FFFDF9" />
              </div>
              <span
                style={{ color: "#F7F2EB", fontFamily: "Poppins, sans-serif" }}
                className="font-semibold"
              >
                Butuanon Dictionary
              </span>
            </div>
            <p
              style={{ color: "#8B9DC3", fontFamily: "Poppins, sans-serif" }}
              className="text-sm leading-relaxed"
            >
              Preserving and promoting the Butuanon language through technology
              and community.
            </p>
          </div>

          {/* Project */}
          <div>
            <h4
              style={{ color: "#C4622D", fontFamily: "Poppins, sans-serif" }}
              className="text-sm font-semibold mb-3 uppercase tracking-wider"
            >
              Project
            </h4>
            <ul className="space-y-2">
              {["Dictionary", "AI Translator", "Word of the Day", "About"].map(
                (item) => (
                  <li key={item}>
                    <span
                      style={{
                        color: "#8B9DC3",
                        fontFamily: "Poppins, sans-serif",
                      }}
                      className="text-sm hover:text-white transition-colors cursor-pointer"
                    >
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Institution */}
          <div>
            <h4
              style={{ color: "#C4622D", fontFamily: "Poppins, sans-serif" }}
              className="text-sm font-semibold mb-3 uppercase tracking-wider"
            >
              Institution
            </h4>
            <p
              style={{ color: "#8B9DC3", fontFamily: "Poppins, sans-serif" }}
              className="text-sm leading-relaxed"
            >
              Father Saturnino Urios University
              <br />
              Butuan City, Agusan del Norte
              <br />
              Philippines
            </p>
          </div>
        </div>

        <div
          style={{ borderColor: "rgba(139, 157, 195, 0.15)" }}
          className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <p
            style={{ color: "#8B9DC3", fontFamily: "Poppins, sans-serif" }}
            className="text-xs"
          >
            © 2024 Butuanon-English AI Dictionary · Father Saturnino Urios
            University (FSUU)
          </p>
          <p
            style={{ color: "#6B7A99", fontFamily: "Poppins, sans-serif" }}
            className="text-xs"
          >
            A language preservation initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
