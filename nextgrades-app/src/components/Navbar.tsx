
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } bg-[#0D1B2A]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NextGrades Logo"
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/" active>Home</NavLink>
            <NavLink href="/programs">Programs</NavLink>
            <NavLink href="/subjects">Subjects</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/resources">Resources</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-white font-medium hover:text-[#D4AF37] transition-colors">
              Login
            </Link>
            <Button variant="gold" size="md">
              <Link href="/consultation">Book Free Consultation</Link>
            </Button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0D1B2A] border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/programs"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programs
              </Link>
              <Link
                href="/subjects"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Subjects
              </Link>
              <Link
                href="/about"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/resources"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/contact"
                className="block py-3 text-lg font-medium text-white border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="py-2">
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center py-3 border border-white text-white rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button
                  variant="gold"
                  size="md"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Free Consultation
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
      className={`font-medium transition-colors relative group ${
        active ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />
      )}
      {!active && (
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
      )}
    </Link>
  );
}
