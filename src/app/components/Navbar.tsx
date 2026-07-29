import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, user, onOpenAuth, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: "home", label: "Home" },
    { id: "dictionary", label: "Dictionary" },
    { id: "translate", label: "Translate" },
    { id: "quiz", label: "Quiz" },
    { id: "about", label: "About" },
  ];

  if (user?.isAdmin) {
    links.push({ id: "admin", label: "Admin Panel" });
  }

  return (
    <nav
      style={{ backgroundColor: "var(--river-blue)" }}
      className="sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden border border-[var(--golden-heritage)]/40 shadow-sm group-hover:scale-105 transition-transform bg-[#0F1D30]">
              <img src="/logo.png" alt="Butuanon Dictionary Logo with Balanghay Boat" className="w-full h-full object-cover scale-105" />
            </div>
            <div className="text-left">
              <span
                style={{ color: "var(--ivory-sail)", fontFamily: "Poppins, sans-serif" }}
                className="text-sm font-semibold leading-tight block"
              >
                Butuanon
              </span>
              <span
                style={{ color: "var(--golden-heritage)", fontFamily: "Poppins, sans-serif" }}
                className="text-xs font-medium leading-tight block"
              >
                Dictionary
              </span>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: currentPage === link.id ? "var(--golden-heritage)" : "#CBD5E8",
                    backgroundColor:
                      currentPage === link.id
                        ? "rgba(212, 175, 55, 0.18)"
                        : "transparent",
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-white hover:bg-white/10"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Auth status desktop */}
            <div className="border-l border-white/15 h-6 pl-3 flex items-center">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt={user.username}
                        className="w-7 h-7 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 uppercase">
                        {user.username.charAt(0)}
                      </div>
                    )}
                    <div className="text-left leading-none">
                      <span style={{ color: "var(--ivory-sail)" }} className="text-xs font-semibold block max-w-[100px] truncate">{user.username}</span>
                      <span style={{ color: "var(--golden-heritage)" }} className="text-[10px] font-bold block mt-0.5">{user.xp_points} XP</span>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "#CBD5E8" }}
                    className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-white/5 hover:text-white transition-all"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  style={{ backgroundColor: "var(--golden-heritage)", color: "#1C252C" }}
                  className="px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            title="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu — animated slide-down */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: mobileOpen ? 380 : 0, opacity: mobileOpen ? 1 : 0 }}
        >
          <div className="pb-4 pt-2 border-t border-white/10 space-y-3">
            <div className="flex flex-col gap-1">
              {links.map((link, i) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileOpen(false);
                  }}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: currentPage === link.id ? "var(--golden-heritage)" : "#CBD5E8",
                    transitionDelay: mobileOpen ? `${i * 40}ms` : "0ms",
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {currentPage === link.id && (
                    <span
                      style={{ backgroundColor: "var(--golden-heritage)" }}
                      className="w-1.5 h-1.5 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Auth status mobile */}
            <div className="border-t border-white/10 pt-3 px-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <div style={{ backgroundColor: "var(--golden-heritage)" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 uppercase">
                        {user.username.charAt(0)}
                      </div>
                    )}
                    <div className="text-left leading-none">
                      <span style={{ color: "var(--ivory-sail)" }} className="text-xs font-semibold block">{user.username}</span>
                      <span style={{ color: "var(--golden-heritage)" }} className="text-[10px] font-bold block mt-1">{user.xp_points} XP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "#CBD5E8" }}
                    className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-white/5 hover:text-white transition-all"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                  style={{ backgroundColor: "var(--golden-heritage)", color: "#1C252C" }}
                  className="w-full py-3 rounded-xl text-xs font-bold text-center hover:opacity-90 transition-opacity"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
