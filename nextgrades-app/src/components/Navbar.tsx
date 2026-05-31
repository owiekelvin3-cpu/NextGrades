"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, X } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

type NavProfile = {
  full_name: string | null;
  role: string;
  avatar_url: string | null;
};

const navLinks = [
  { href: "/", key: "home" },
  { href: "/programs", key: "programs" },
  { href: "/subjects", key: "subjects" },
  { href: "/about", key: "about" },
  { href: "/resources", key: "resources" },
  { href: "/pricing", key: "pricing" },
  { href: "/contact", key: "contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", userId)
        .single();
      if (!error && data) setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isSupabaseEnvConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) void fetchProfile(newSession.user.id);
      else setProfile(null);
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) void fetchProfile(currentSession.user.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const headerBg =
    theme === "dark"
      ? cn(
          "border-b border-white/5 bg-[#0D1B2A]",
          isScrolled && "md:shadow-xl md:shadow-black/30 md:backdrop-blur-lg md:bg-[#0D1B2A]/97"
        )
      : cn(
          "border-b border-gray-100 bg-white",
          isScrolled && "md:shadow-lg md:shadow-gray-300/20 md:backdrop-blur-lg md:bg-white/98"
        );

  return (
    <header
      className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", headerBg)}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <BrandLogo className="h-8 w-auto md:h-10" />

          {/* Desktop */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} active={pathname === link.href} theme={theme}>
                {t(`common.${link.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            {session && user ? (
              <>
                <Link
                  href={`/dashboard/${profile?.role || "student"}`}
                  className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:text-[#D4AF37]"
                  style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/15">
                    <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  {t("common.dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "#f5f5f5",
                    borderColor: theme === "dark" ? "rgba(255,255,255,0.15)" : "#e5e7eb",
                    color: theme === "dark" ? "white" : "#0D1B2A",
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 text-sm font-semibold transition-colors hover:text-[#D4AF37]"
                  style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}
                >
                  {t("common.login")}
                </Link>
                <Button variant="gold" size="md" className="rounded-lg text-sm font-semibold" href="/register">
                  {t("common.signup")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle — minimal 2-line icon */}
          <button
            type="button"
            className={cn(
              "flex min-h-12 min-w-12 flex-col items-center justify-center gap-1.5 rounded-2xl md:hidden touch-manipulation active:scale-95",
              theme === "dark" ? "text-white" : "text-[#0D1B2A]"
            )}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-transform duration-200",
                isMobileMenuOpen && "translate-y-[5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-transform duration-200",
                isMobileMenuOpen && "-translate-y-[5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-[min(100%,320px)] flex-col shadow-2xl md:hidden",
                theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"
              )}
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <div className="flex h-16 items-center justify-between border-b px-5 border-white/10">
                <BrandLogo className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-2xl text-text-muted"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex min-h-[52px] items-center rounded-2xl px-4 text-base font-medium transition-colors touch-manipulation",
                          pathname === link.href
                            ? "bg-[#D4AF37]/15 text-[#D4AF37] font-semibold"
                            : theme === "dark"
                              ? "text-white active:bg-white/5"
                              : "text-[#0D1B2A] active:bg-gray-50"
                        )}
                      >
                        {t(`common.${link.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div
                className={cn(
                  "space-y-3 border-t px-5 py-5",
                  theme === "dark" ? "border-white/10" : "border-gray-100"
                )}
                style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
              >
                <LanguageSwitcher />
                <ThemeToggle variant="full" />
                {session && user ? (
                  <>
                    <Link
                      href={`/dashboard/${profile?.role || "student"}`}
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                        theme === "dark" ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                      )}
                    >
                      {t("common.dashboard")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border font-semibold touch-manipulation",
                        theme === "dark" ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("common.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                        theme === "dark" ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                      )}
                    >
                      {t("common.login")}
                    </Link>
                    <Button variant="gold" size="lg" className="w-full min-h-[52px]" href="/register">
                      {t("common.signup")}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  children,
  active = false,
  theme,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  theme: "dark" | "light";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300",
        active
          ? "border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#D4AF37]"
          : theme === "dark"
            ? "text-white hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            : "text-[#0D1B2A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
      )}
    >
      {children}
    </Link>
  );
}
