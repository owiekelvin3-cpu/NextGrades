"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Menu, X, ChevronDown } from "lucide-react";
import { MobileDrawer } from "@/components/mobile/MobileDrawer";
import { Button } from "./ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import { getCachedSession, updateSessionCache, invalidateSessionCache } from "@/lib/supabase/session-cache";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/auth/redirect";
import { isPublicSignupEnabled } from "@/lib/auth/public-signup";
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

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSecondaryNavActive(pathname: string): boolean {
  return secondaryNavLinks.some((link) => isNavLinkActive(pathname, link.href));
}

function navLinkClass(active: boolean, onDark: boolean) {
  return cn(
    "relative shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-[12px] font-medium transition-colors lg:px-2.5 lg:text-[13px] 2xl:px-3 2xl:text-sm",
    active
      ? "font-semibold text-[var(--brand-gold)]"
      : onDark
        ? "text-[var(--nav-text)] hover:bg-white/5 hover:text-[var(--nav-text-active)]"
        : "text-foreground/75 hover:bg-surface-subtle hover:text-foreground"
  );
}

function navLabel(t: (key: string) => string, key: string) {
  return t(`navBar.${key}`);
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
  const { t } = useTranslation();

  const onDark = theme === "dark";
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
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
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

  const secondaryActive = isSecondaryNavActive(pathname);

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[background-color,box-shadow,border-color]",
          onDark
            ? cn("site-header-dark bg-[var(--brand-navy)]", isScrolled && "shadow-lg shadow-black/25")
            : cn("theme-nav-bar bg-[var(--nav-background)]", isScrolled && "shadow-sm"),
          onDark ? "text-white" : "text-foreground"
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-5 xl:px-6 2xl:px-8">
          <div className="flex h-[var(--site-nav-height)] items-center justify-between gap-2 lg:gap-3 2xl:gap-5">
            <div className="flex shrink-0 items-center">
              <BrandLogo size="navbar" priority={pathname === "/"} onDarkBackground={onDark} className="2xl:hidden" />
              <BrandLogo
                size="navbarWide"
                priority={pathname === "/"}
                onDarkBackground={onDark}
                className="hidden 2xl:block"
              />
            </div>

            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-0 md:flex md:gap-0.5 lg:gap-1 xl:gap-0.5 2xl:gap-1"
              aria-label={t("marketingNav.bottomLabel")}
              data-animate="nav-stagger"
            >
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(isNavLinkActive(pathname, link.href), onDark)}
                  title={t(`common.${link.key}`)}
                  data-animate="nav-item"
                >
                  {navLabel(t, link.key)}
                </Link>
              ))}

              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(navLinkClass(isNavLinkActive(pathname, link.href), onDark), "hidden 2xl:inline-flex")}
                  title={t(`common.${link.key}`)}
                  data-animate="nav-item"
                >
                  {navLabel(t, link.key)}
                </Link>
              ))}

              <div ref={moreRef} className="relative 2xl:hidden">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((open) => !open)}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                  className={cn(
                    navLinkClass(secondaryActive || isMoreOpen, onDark),
                    "inline-flex items-center gap-1"
                  )}
                >
                  {t("marketingNav.more")}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-200", isMoreOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-2 min-w-[11rem] -translate-x-1/2 rounded-xl border border-border-default bg-[var(--nav-dropdown)] p-1 shadow-lg">
                    {secondaryNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={cn(
                          "flex rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isNavLinkActive(pathname, link.href)
                            ? "bg-[var(--brand-gold-muted)] font-semibold text-[var(--brand-gold)]"
                            : onDark
                              ? "text-white/90 hover:bg-white/5"
                              : "text-foreground hover:bg-[var(--table-row-hover)]"
                        )}
                      >
                        {t(`common.${link.key}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="hidden shrink-0 items-center gap-1.5 md:flex 2xl:gap-2">
              <LanguageSwitcher compact onDark={onDark} />

              <div
                className={cn("mx-0.5 hidden h-5 w-px 2xl:block", onDark ? "bg-white/10" : "bg-border-default")}
                aria-hidden
              />

              {session && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={dashboardHref}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors hover:text-[var(--brand-gold)]",
                      onDark ? "text-white/90" : "text-foreground"
                    )}
                  >
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-[var(--brand-gold)]/30"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)]">
                        <UserIcon className="h-4 w-4 text-[var(--brand-gold)]" />
                      </span>
                    )}
                    <span className="hidden 2xl:inline">{t("common.dashboard")}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors",
                      onDark
                        ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                        : "border-border-default bg-surface-subtle text-foreground hover:bg-surface-muted"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden 2xl:inline">{t("common.logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-semibold transition-colors hover:text-[var(--brand-gold)] 2xl:px-2.5 2xl:text-sm",
                      onDark ? "text-white/85" : "text-foreground/80"
                    )}
                  >
                    {t("common.login")}
                  </Link>
                  {isPublicSignupEnabled() && (
                    <Link
                      href="/signup"
                      className={cn(
                        "hidden shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-2 text-[13px] font-semibold transition-colors 2xl:inline-flex 2xl:text-sm",
                        onDark
                          ? "border-white/12 text-white/90 hover:border-[var(--brand-gold)]/40"
                          : "border-border-default text-foreground hover:border-[var(--brand-gold)]/40"
                      )}
                    >
                      {t("navbar.signupShort")}
                    </Link>
                  )}
                  <Button
                    variant="gold"
                    size="sm"
                    className="shrink-0 whitespace-nowrap rounded-lg px-3 text-[13px] 2xl:px-4 2xl:text-sm"
                    href="/consultation"
                  >
                    {t("navbar.consultationShort")}
                  </Button>
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center md:hidden">
              <button
                type="button"
                className={cn(
                  "flex min-h-11 min-w-11 items-center justify-center rounded-xl border transition-colors touch-manipulation active:scale-95",
                  onDark
                    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "border-border-default bg-surface-elevated text-foreground hover:bg-surface-subtle"
                )}
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? t("marketingNav.closeMenu") : t("marketingNav.openMenu")}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <MobileDrawer
          open={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          ariaLabel="Site navigation"
          header={<BrandLogo size="navbar" onDarkBackground={onDark} />}
          footer={
            <div className="space-y-3">
              {session && user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border-default bg-surface-subtle text-sm font-semibold text-foreground touch-manipulation"
                  >
                    {t("common.dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border-default text-sm font-semibold text-foreground touch-manipulation hover:bg-surface-subtle"
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
                    className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border-default text-base font-semibold text-foreground touch-manipulation hover:bg-surface-subtle"
                  >
                    {t("common.login")}
                  </Link>
                  <Button variant="gold" size="md" className="w-full min-h-[48px] py-4 text-base font-semibold" href="/consultation">
                    {t("navbar.consultationShort")}
                  </Button>
                </>
              )}
            </div>
          }
        >
          <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            <ul className="space-y-1">
              {primaryNavLinks.map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={t(`common.${link.key}`)}
                  active={isNavLinkActive(pathname, link.href)}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </ul>

            <div className="my-6 h-px bg-border-default/60" aria-hidden />

            <LanguageSwitcher layout="drawer" />

            <div className="mt-6 space-y-1 border-t border-border-default/60 pt-4">
              {secondaryNavLinks.map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={t(`common.${link.key}`)}
                  active={isNavLinkActive(pathname, link.href)}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
          </nav>
        </MobileDrawer>
      </header>
    </>
  );
}

function MobileNavItem({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex min-h-[44px] items-center rounded-lg px-3 text-[15px] font-medium transition-colors touch-manipulation",
          active
            ? "bg-[var(--brand-gold-muted)] font-semibold text-[var(--brand-gold)]"
            : "text-foreground hover:bg-surface-subtle active:bg-surface-muted"
        )}
      >
        <span suppressHydrationWarning>{label}</span>
      </Link>
    </li>
  );
}
