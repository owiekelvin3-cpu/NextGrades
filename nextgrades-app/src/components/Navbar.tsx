"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/programs", key: "programs" },
  { href: "/subjects", key: "subjects" },
  { href: "/pricing", key: "pricing" },
  { href: "/about", key: "about" },
  { href: "/resources", key: "resources" },
  { href: "/contact", key: "contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
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

  useEffect(() => {
    if (!isSupabaseEnvConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        theme === "dark"
          ? isScrolled
            ? "shadow-xl shadow-black/30 backdrop-blur-lg bg-[#0D1B2A]/97 border-b border-white/5"
            : "bg-[#0D1B2A] border-b border-white/5"
          : isScrolled
          ? "shadow-lg shadow-gray-300/20 backdrop-blur-lg bg-white/98 border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - fixed size */}
          <BrandLogo />

          {/* Desktop Nav - fixed gap, no wrapping */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
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
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-all duration-300 border flex-shrink-0 font-semibold"
              style={{
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "#f5f5f5",
                borderColor: theme === "dark" ? "rgba(255,255,255,0.15)" : "#e5e7eb",
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
            
            {session && user ? (
              <>
                <Link 
                  href={`/dashboard/${profile?.role || 'student'}`} 
                  className="font-semibold text-sm hover:text-[#D4AF37] transition-colors py-2 px-3 flex-shrink-0 whitespace-nowrap flex items-center gap-2 rounded-lg"
                  style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center border border-[#D4AF37]/40">
                    <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  {t("common.dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 border"
                  style={{
                    backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "#f5f5f5",
                    borderColor: theme === "dark" ? "rgba(255,255,255,0.15)" : "#e5e7eb",
                    color: theme === "dark" ? "white" : "#0D1B2A"
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {t("common.logout")}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="font-semibold text-sm hover:text-[#D4AF37] transition-colors py-2 px-4 flex-shrink-0 whitespace-nowrap"
                  style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}
                >
                  {t("common.login")}
                </Link>
                <div className="flex-shrink-0">
                  <Button variant="gold" size="md" className="rounded-lg text-sm font-semibold" href="/register">
                    {t("common.signup")}
                  </Button>
                </div>
              </>
            )}
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
          <motion.div key="mobile-menu-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sliding menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-4/5 max-w-sm z-50 md:hidden shadow-2xl ${
                theme === "dark"
                  ? "bg-[#0D1B2A]"
                  : "bg-white"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                      theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                    }`}
                  >
                    <X size={28} strokeWidth={2} />
                  </button>
                </div>

                <div className="space-y-3 mb-8">
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
                </div>

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
                          {t("common.lightMode")}
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5" />
                          {t("common.darkMode")}
                        </>
                      )}
                    </button>
                  </div>

                  {session && user ? (
                    <>
                      <Link
                        href={`/dashboard/${profile?.role || 'student'}`}
                        className={`block w-full text-center py-3 border rounded-xl font-semibold hover:bg-white/5 transition-all ${
                          theme === "dark"
                            ? "border-white/30 text-white"
                            : "border-gray-200 text-[#0D1B2A]"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t("common.dashboard")}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-center py-3 border rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2 ${
                          theme === "dark"
                            ? "border-white/30 text-white"
                            : "border-gray-200 text-[#0D1B2A]"
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("common.logout")}
                      </button>
                    </>
                  ) : (
                    <>
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
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t("common.signup")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
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
      className={`font-medium text-sm transition-all duration-300 relative px-4 py-2.5 rounded-lg ${
        active 
          ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30" 
          : theme === "dark" 
          ? "text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
          : "text-[#0D1B2A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
      }`}
    >
      {children}
    </Link>
  );
}
