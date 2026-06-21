"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Menu, X, ChevronDown } from "lucide-react";
import { MobileDrawer } from "@/components/mobile/MobileDrawer";
import { Button } from "./ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import { getCachedSession, updateSessionCache, invalidateSessionCache } from "@/lib/supabase/session-cache";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/auth/redirect";
import { isPublicSignupEnabled } from "@/lib/auth/public-signup";
import { isPublicMarketingPath } from "@/lib/marketing/public-routes";
import { changeAppLanguage } from "@/components/I18nProvider";
import { normalizeLanguage } from "@/lib/i18n/locales";
import type { AppRole } from "@/lib/auth/roles";

type NavProfile = {
  full_name: string | null;
  role: string;
  avatar_url: string | null;
};

const primaryNavLinks = [
  { href: "/", key: "home" },
  { href: "/programs", key: "programs" },
  { href: "/subjects", key: "subjects" },
  { href: "/resources", key: "resources" },
  { href: "/pricing", key: "pricing" },
] as const;

const secondaryNavLinks = [
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks] as const;

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSecondaryNavActive(pathname: string): boolean {
  return secondaryNavLinks.some((link) => isNavLinkActive(pathname, link.href));
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const marketingGermanOnly = isPublicMarketingPath(pathname);

  useEffect(() => {
    if (marketingGermanOnly && normalizeLanguage(i18n.language) !== "de") {
      void changeAppLanguage("de");
    }
  }, [marketingGermanOnly, i18n.language]);

  const dashboardHref = profile?.role
    ? getDashboardPathForRole(profile.role as AppRole)
    : "/dashboard/student";

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
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    if (!isSupabaseEnvConfigured()) return;

    let subscription: { unsubscribe: () => void } | undefined;

    const start = () => {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
        updateSessionCache(newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) void fetchProfile(newSession.user.id);
        else setProfile(null);
      });

      subscription = sub;

      void getCachedSession().then((currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) void fetchProfile(currentSession.user.id);
      });
    };

    const cancelIdle =
      typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
        ? (() => {
            const id = window.requestIdleCallback(start, { timeout: 2000 });
            return () => window.cancelIdleCallback(id);
          })()
        : (() => {
            const tid = window.setTimeout(start, 600);
            return () => window.clearTimeout(tid);
          })();

    return () => {
      cancelIdle();
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    invalidateSessionCache();
    router.push("/");
    router.refresh();
  };

  const isDark = theme === "dark";
  const secondaryActive = isSecondaryNavActive(pathname);

  const headerBg = isDark
    ? cn(
        "border-b border-white/[0.06] bg-[#0D1B2A]",
        isScrolled && "shadow-xl shadow-black/25 backdrop-blur-xl bg-[#0D1B2A]/98"
      )
    : cn(
        "border-b border-[#0D1B2A]/[0.06] bg-white",
        isScrolled && "shadow-[0_4px_24px_rgba(13,27,42,0.08)] backdrop-blur-xl bg-white/98"
      );

  const guestAuthDesktop = (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:text-[#D4AF37]",
          isDark ? "text-white/90" : "text-[#0D1B2A]"
        )}
      >
        {t("common.login")}
      </Link>
      {isPublicSignupEnabled() && (
        <Link
          href="/signup"
          className={cn(
            "rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors",
            isDark
              ? "border-white/15 text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
              : "border-[#0D1B2A]/10 text-[#0D1B2A] hover:border-[#D4AF37]/50 hover:text-[#B8962E]"
          )}
        >
          {t("navbar.signupShort")}
        </Link>
      )}
      <Button variant="gold" size="sm" className="rounded-xl px-4 text-sm font-semibold" href="/consultation">
        {t("navbar.consultationShort")}
      </Button>
    </div>
  );

  return (
    <>
      <header
        className={cn("site-header fixed inset-x-0 top-0 z-50 transition-all duration-300", headerBg)}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[var(--site-nav-height)] items-center gap-3 lg:gap-4">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <BrandLogo size="nav" priority={pathname === "/"} />
            </div>

            {/* Desktop navigation */}
            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
              aria-label={t("marketingNav.bottomLabel")}
            >
              {primaryNavLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  active={isNavLinkActive(pathname, link.href)}
                  theme={theme}
                >
                  {t(`common.${link.key}`)}
                </NavLink>
              ))}

              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((open) => !open)}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    secondaryActive || isMoreOpen
                      ? "bg-[#D4AF37]/12 font-semibold text-[#D4AF37]"
                      : isDark
                        ? "text-white/90 hover:bg-white/5 hover:text-[#D4AF37]"
                        : "text-[#0D1B2A]/85 hover:bg-[#0D1B2A]/[0.04] hover:text-[#B8962E]"
                  )}
                >
                  {t("marketingNav.more")}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-200", isMoreOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>

                {isMoreOpen && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-full z-50 mt-2 min-w-[11rem] -translate-x-1/2 rounded-2xl border p-1.5 shadow-xl",
                      isDark
                        ? "border-white/10 bg-[#112240] shadow-black/40"
                        : "border-[#0D1B2A]/[0.08] bg-white shadow-[0_12px_40px_rgba(13,27,42,0.12)]"
                    )}
                  >
                    {secondaryNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={cn(
                          "flex rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                          isNavLinkActive(pathname, link.href)
                            ? "bg-[#D4AF37]/15 font-semibold text-[#D4AF37]"
                            : isDark
                              ? "text-white hover:bg-white/5"
                              : "text-[#0D1B2A] hover:bg-[#0D1B2A]/[0.04]"
                        )}
                      >
                        {t(`common.${link.key}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-xl border px-1 py-1",
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-[#0D1B2A]/[0.06] bg-[#0D1B2A]/[0.02]"
                )}
              >
                {!marketingGermanOnly && <LanguageSwitcher />}
                <ThemeToggle size="sm" />
              </div>

              <div
                className={cn("mx-1 hidden h-6 w-px xl:block", isDark ? "bg-white/10" : "bg-[#0D1B2A]/10")}
                aria-hidden
              />

              {session && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={dashboardHref}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:text-[#D4AF37]",
                      isDark ? "text-white" : "text-[#0D1B2A]"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/12">
                      <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <span className="hidden xl:inline">{t("common.dashboard")}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                      isDark
                        ? "border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                        : "border-[#0D1B2A]/10 bg-[#0D1B2A]/[0.03] text-[#0D1B2A] hover:bg-[#0D1B2A]/[0.06]"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline">{t("common.logout")}</span>
                  </button>
                </div>
              ) : (
                guestAuthDesktop
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className={cn(
                "ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-xl touch-manipulation active:scale-95 lg:hidden",
                isDark ? "text-white" : "text-[#0D1B2A]"
              )}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? t("marketingNav.closeMenu") : t("marketingNav.openMenu")}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <MobileDrawer
          open={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          ariaLabel="Site navigation"
          panelClassName={isDark ? "bg-[#0D1B2A]" : "bg-white"}
          header={<BrandLogo size="nav" />}
          footer={
            <div className="space-y-3">
              {!marketingGermanOnly && <LanguageSwitcher layout="drawer" />}
              <ThemeToggle variant="full" />
              {session && user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                      isDark ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
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
                      isDark ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("common.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Button variant="gold" size="lg" className="w-full min-h-[52px]" href="/consultation">
                    {t("navbar.freeConsultation")}
                  </Button>
                  {isPublicSignupEnabled() && (
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                        isDark ? "border-[#D4AF37]/40 text-[#D4AF37]" : "border-[#D4AF37]/50 text-[#0D1B2A]"
                      )}
                    >
                      {t("navbar.signup")}
                    </Link>
                  )}
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                      isDark ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                    )}
                  >
                    {t("common.login")}
                  </Link>
                </>
              )}
            </div>
          }
        >
          <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <MobileNavSection title={t("marketingNav.explore")} theme={theme}>
              {allNavLinks.map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={t(`common.${link.key}`)}
                  active={isNavLinkActive(pathname, link.href)}
                  theme={theme}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </MobileNavSection>
          </nav>
        </MobileDrawer>
      </header>
    </>
  );
}

function MobileNavSection({
  title,
  theme,
  className,
  children,
}: {
  title: string;
  theme: "dark" | "light";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p
        className={cn(
          "mb-2 px-1 text-xs font-semibold uppercase tracking-wider",
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        )}
      >
        {title}
      </p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  active,
  theme,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  theme: "dark" | "light";
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-medium transition-colors touch-manipulation",
          active
            ? "bg-[#D4AF37]/15 font-semibold text-[#D4AF37]"
            : theme === "dark"
              ? "text-white active:bg-white/5"
              : "text-[#0D1B2A] active:bg-gray-50"
        )}
      >
        <span suppressHydrationWarning>{label}</span>
      </Link>
    </li>
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
  const isDark = theme === "dark";

  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-200 xl:px-3",
        active
          ? "bg-[#D4AF37]/12 font-semibold text-[#D4AF37]"
          : isDark
            ? "text-white/90 hover:bg-white/5 hover:text-[#D4AF37]"
            : "text-[#0D1B2A]/85 hover:bg-[#0D1B2A]/[0.04] hover:text-[#B8962E]"
      )}
    >
      {children}
    </Link>
  );
}
