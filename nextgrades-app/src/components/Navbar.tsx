
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/programs", key: "programs" },
  { href: "/subjects", key: "subjects" },
  { href: "/about", key: "about" },
  { href: "/resources", key: "resources" },
  { href: "/contact", key: "contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        theme === "dark"
          ? isScrolled
            ? "shadow-lg shadow-black/20 backdrop-blur-md bg-[#0D1B2A]/95"
            : "bg-[#0D1B2A]"
          : isScrolled
          ? "shadow-lg shadow-gray-200/20 backdrop-blur-md bg-white/95"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - fixed size */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
            <img
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="NextGrades Logo"
              className="h-14 w-auto"
              loading="eager"
            />
          </Link>

          {/* Desktop Nav - fixed gap, no wrapping */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.href} 
                href={link.href} 
                active={pathname === link.href}
                theme={theme}
              >
                {t(`common.${link.key}`)}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions - fixed gap, no wrapping */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0D1B2A] transition-all duration-300 border flex-shrink-0"
              style={{
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "#f3f4f6",
                borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                color: theme === "dark" ? "white" : "#0D1B2A"
              }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <Link 
              href="/login" 
              className="font-semibold hover:text-[#D4AF37] transition-colors py-2 px-3 flex-shrink-0 whitespace-nowrap"
              style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}
            >
              {t("common.login")}
            </Link>
            <div className="flex-shrink-0">
              <Button variant="gold" size="md">
                <Link href="/consultation">{t("common.freeConsultation")}</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors ${
              theme === "dark" ? "text-white" : "text-[#0D1B2A]"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X size={28} strokeWidth={2} />
            ) : (
              <Menu size={28} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`md:hidden border-t overflow-hidden ${
              theme === "dark"
                ? "bg-[#0D1B2A] border-white/10"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-3 px-4 rounded-xl text-lg font-medium transition-all ${
                    pathname === link.href
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border-l-2 border-[#D4AF37]"
                      : theme === "dark"
                      ? "text-white hover:bg-white/5"
                      : "text-[#0D1B2A] hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(`common.${link.key}`)}
                </Link>
              ))}
              
              <div className={`pt-6 mt-4 border-t space-y-3 ${
                theme === "dark" ? "border-white/10" : "border-gray-100"
              }`}>
                <div className="py-2">
                  <LanguageSwitcher />
                </div>
                <div className="py-2">
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-center gap-3 py-3 border rounded-xl font-semibold hover:bg-white/10 transition-all ${
                      theme === "dark"
                        ? "border-white/30 text-white"
                        : "border-gray-200 text-[#0D1B2A]"
                    }`}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-5 h-5" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>
                <Link
                  href="/login"
                  className={`block w-full text-center py-3 border rounded-xl font-semibold hover:bg-white/5 transition-all ${
                    theme === "dark"
                      ? "border-white/30 text-white"
                      : "border-gray-200 text-[#0D1B2A]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("common.login")}
                </Link>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("common.freeConsultation")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, children, active = false, theme }: { href: string; children: React.ReactNode; active?: boolean; theme: "dark" | "light" }) {
  return (
    <Link
      href={href}
      className={`font-semibold transition-all relative group py-2 px-2 whitespace-nowrap text-center min-w-[80px] ${
        active 
          ? "text-[#D4AF37]" 
          : theme === "dark" 
          ? "text-white hover:text-[#D4AF37]"
          : "text-[#0D1B2A] hover:text-[#D4AF37]"
      }`}
    >
      {children}
      <span 
        className={`absolute bottom-0 left-0 h-0.5 bg-[#D4AF37] transition-all ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`} 
      />
    </Link>
  );
}
