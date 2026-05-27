
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/subjects", label: "Subjects" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
        isScrolled
          ? "shadow-lg shadow-black/20 backdrop-blur-md bg-[#0D1B2A]/95"
          : "bg-[#0D1B2A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img
              src="/logo.png"
              alt="NextGrades Logo"
              className="h-14 w-auto"
              loading="eager"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink 
                key={link.href} 
                href={link.href} 
                active={pathname === link.href}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0D1B2A] transition-all duration-300 border border-white/10"
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
              className="text-white font-semibold hover:text-[#D4AF37] transition-colors py-2 px-3"
            >
              Login
            </Link>
            <Button variant="gold" size="md">
              <Link href="/consultation">Kostenloses Erstgespräch</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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
            className="md:hidden bg-[#0D1B2A] border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-3 px-4 rounded-xl text-lg font-medium transition-all ${
                    pathname === link.href
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border-l-2 border-[#D4AF37]"
                      : "text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
                <div className="py-2">
                  <LanguageSwitcher />
                </div>
                <div className="py-2">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
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
                  className="block w-full text-center py-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kostenloses Erstgespräch
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`font-semibold transition-all relative group py-2 ${
        active ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"
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
