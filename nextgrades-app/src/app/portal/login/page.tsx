"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { BrandLogo } from "@/components/BrandLogo";
import {
  AuthField,
  AuthPrimaryButton,
  AuthSplitCard,
} from "@/components/auth/AuthSplitCard";
import { authSurface } from "@/components/auth/auth-ui";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, sanitizeRedirect } from "@/lib/auth/redirect";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import {
  isAuthUserEmailVerified,
  isClientEmailVerificationRequired,
} from "@/lib/auth/config";
import { isEmailNotConfirmedError } from "@/lib/auth/auth-errors";
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/company";
import { cn } from "@/lib/utils";

function AdminPortalLoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const s = authSurface(theme === "dark");
  const heroImage = useMarketingHeroImage();

  const redirectTo = sanitizeRedirect(searchParams.get("redirect")) ?? ADMIN_PORTAL_HOME;

  const heroFeatures = useMemo(
    () => [t("adminPortal.handoffCms"), t("adminPortal.handoffUsers")],
    [t]
  );

  const finishLogin = async (userId: string) => {
    const role = await fetchProfileRole(userId);
    if (role !== "admin") {
      await supabase.auth.signOut();
      setError(t("adminPortal.accessDenied"));
      return;
    }
    router.replace(redirectTo.startsWith("/portal") ? redirectTo : ADMIN_PORTAL_HOME);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        if (isEmailNotConfirmedError(result.error)) {
          setError(t("login.emailNotVerified", { defaultValue: "This account is not verified yet. Contact support." }));
          return;
        }
        throw new Error(result.error.message);
      }
      if (!result.data.user) throw new Error("Authentication failed");

      if (isClientEmailVerificationRequired() && !isAuthUserEmailVerified(result.data.user)) {
        await supabase.auth.signOut();
        setError(t("login.emailNotVerified", { defaultValue: "This account is not verified yet. Contact support." }));
        return;
      }

      await finishLogin(result.data.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const heroPanel = (
    <div className="max-w-md">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
        <Shield className="h-3.5 w-3.5" />
        {t("adminPortal.badge")}
      </div>
      <h2 className="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {t("adminPortal.signInTitle")}
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-on-navy-muted">{t("adminPortal.handoffDesc")}</p>
      <ul className="space-y-3">
        {heroFeatures.map((text) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-white/90">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0D1B2A]">
      <header
        className="sticky top-0 z-40 border-b border-white/10 bg-[#0D1B2A]/95 backdrop-blur-md"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo size="lg" href="/" onDarkBackground />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-on-navy-muted transition-colors hover:text-[#D4AF37]"
          >
            {t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-6 sm:py-10">
        <AuthSplitCard heroImage={heroImage} heroPanel={heroPanel} className="!bg-transparent">
          <div className="mb-8">
            <div className="mb-6 lg:hidden">
              <BrandLogo size="lg" href="/" onDarkBackground />
            </div>
            <div className="hidden lg:block">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                <Shield className="h-3.5 w-3.5" />
                {t("adminPortal.badge")}
              </div>
            </div>
            <h1 className={cn("text-[1.75rem] font-bold tracking-tight sm:text-[2rem]", s.heading)}>
              {t("adminPortal.signInTitle")}
            </h1>
            <p className={cn("mt-2 text-sm sm:text-base", s.body)}>{t("adminPortal.signInSubtitle")}</p>
          </div>

          {error && (
            <div className={cn("mb-6 rounded-2xl border px-4 py-3 text-sm", s.errorBox)} role="alert">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AuthField
              id="admin-email"
              label={t("login.email", { defaultValue: "Email Address" })}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={`admin@${COMPANY_SUPPORT_EMAIL.split("@")[1] ?? "nextgrades.at"}`}
            />
            <AuthField
              id="admin-password"
              label={t("login.password", { defaultValue: "Password" })}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />
            <AuthPrimaryButton loading={loading} variant="gold">
              {t("adminPortal.signInButton")}
            </AuthPrimaryButton>
          </form>

          <div className={cn("mt-8 space-y-4 border-t pt-6 text-center text-sm", s.dividerLine)}>
            <p className={s.body}>
              {t("adminPortal.studentTeacherLogin")}{" "}
              <Link href="/login" className={cn("font-semibold", s.link)}>
                {t("adminPortal.mainLogin")}
              </Link>
            </p>
            <Link href="/" className={cn("inline-flex items-center justify-center font-medium", s.link)}>
              {t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}
            </Link>
          </div>
        </AuthSplitCard>
      </main>
    </div>
  );
}

function AdminPortalLoginFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D1B2A]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
    </div>
  );
}

export default function AdminPortalLoginPage() {
  return (
    <AuthGuestGuard skipLoginOtp adminPortal>
      <Suspense fallback={<AdminPortalLoginFallback />}>
        <AdminPortalLoginContent />
      </Suspense>
    </AuthGuestGuard>
  );
}
