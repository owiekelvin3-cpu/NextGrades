"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { MobileDrawer } from "@/components/mobile/MobileDrawer";
import { MarketingBottomNav } from "@/components/marketing/MarketingBottomNav";
import { MARKETING_OPEN_MENU_EVENT } from "@/lib/marketing-nav";
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
import { buildLoginUrl, getDashboardPathForRole } from "@/lib/auth/redirect";
import type { AppRole } from "@/lib/auth/roles";

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
] as const;

const exploreNavKeys = ["home", "programs", "subjects", "resources"] as const;
const companyNavKeys = ["about", "pricing", "contact"] as const;

function navLinkByKey(key: (typeof navLinks)[number]["key"]) {
  return navLinks.find((l) => l.key === key)!;
}

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
  }, [pathname]);

  useEffect(() => {
    const open = () => setIsMobileMenuOpen(true);
    window.addEventListener(MARKETING_OPEN_MENU_EVENT, open);
    return () => window.removeEventListener(MARKETING_OPEN_MENU_EVENT, open);
  }, []);

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
            const t = window.setTimeout(start, 600);
            return () => window.clearTimeout(t);
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
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 max-w-[100vw] overflow-x-clip transition-all duration-300",
        headerBg
      )}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] min-w-0 items-center justify-between gap-2 md:h-20">
          <div className="min-w-0 shrink">
            <BrandLogo size="md" priority={pathname === "/"} />
          </div>

          {/* Desktop — lg+ only so tablet uses drawer (avoids cramped nav overflow) */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-hidden lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} active={pathname === link.href} theme={theme}>
                <span suppressHydrationWarning>{t(`common.${link.key}`)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex lg:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {session && user ? (
              <>
                <Link
                  href={dashboardHref}
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
                <Button variant="gold" size="md" className="rounded-lg text-sm font-semibold" href={buildLoginUrl(null, "signup")}>
                  {t("common.signup")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile — Coursera-style: Login + Join + menu */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">
            {session && user ? (
              <Link
                href={dashboardHref}
                className={cn(
                  "flex min-h-10 min-w-10 items-center justify-center rounded-xl border touch-manipulation",
                  theme === "dark" ? "border-white/15 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-[#0D1B2A]"
                )}
                aria-label={t("common.dashboard")}
              >
                <UserIcon className="h-5 w-5 text-[#D4AF37]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-sm font-semibold touch-manipulation sm:px-3",
                    theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                  )}
                >
                  {t("common.login")}
                </Link>
                <Button
                  variant="gold"
                  size="sm"
                  className="!min-h-10 rounded-lg px-3 text-xs font-semibold sm:text-sm"
                  href={buildLoginUrl(null, "signup")}
                >
                  {t("common.signup")}
                </Button>
              </>
            )}
            <button
              type="button"
              className={cn(
                "flex min-h-10 min-w-10 items-center justify-center rounded-xl touch-manipulation active:scale-95",
                theme === "dark" ? "text-white" : "text-[#0D1B2A]"
              )}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? t("marketingNav.closeMenu") : t("marketingNav.openMenu")}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <MobileDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        ariaLabel="Site navigation"
        panelClassName={theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}
        header={<BrandLogo size="md" />}
        footer={
          <div className="space-y-3">
            <LanguageSwitcher layout="drawer" />
            <ThemeToggle variant="full" />
            {session && user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex min-h-[52px] w-full items-center justify-center rounded-2xl border font-semibold touch-manipulation",
                    theme === "dark" ? "border-white/20 text-white" : "border-gray-200 text-[#0D1B2A]"
                  )}
                >
                  {t("common.login")}
                </Link>
                <Button variant="gold" size="lg" className="w-full min-h-[52px]" href={buildLoginUrl(null, "signup")}>
                  {t("common.signup")}
                </Button>
              </>
            )}
          </div>
        }
      >
        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <Button
            variant="gold"
            size="lg"
            className="mb-6 w-full min-h-[52px] text-base"
            href="/consultation"
          >
            {t("navbar.freeConsultation")}
          </Button>

          <MobileNavSection title={t("marketingNav.explore")} theme={theme}>
            {exploreNavKeys.map((key) => {
              const link = navLinkByKey(key);
              return (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={t(`common.${link.key}`)}
                  active={pathname === link.href}
                  theme={theme}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              );
            })}
          </MobileNavSection>

          <MobileNavSection title={t("marketingNav.company")} theme={theme} className="mt-6">
            {companyNavKeys.map((key) => {
              const link = navLinkByKey(key);
              return (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={t(`common.${link.key}`)}
                  active={pathname === link.href}
                  theme={theme}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              );
            })}
          </MobileNavSection>
        </nav>
      </MobileDrawer>

    </header>
    <MarketingBottomNav />
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
  return (
    <Link
      href={href}
      className={cn(
        "relative shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-200 md:text-sm",
        "after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-[#D4AF37] after:transition-opacity after:duration-200",
        active ? "font-semibold text-[#D4AF37] after:opacity-100" : "after:opacity-0",
        !active &&
          (theme === "dark"
            ? "text-white/90 hover:text-[#D4AF37]"
            : "text-[#0D1B2A]/85 hover:text-[#B8962E]")
      )}
    >
      {children}
    </Link>
  );
}
