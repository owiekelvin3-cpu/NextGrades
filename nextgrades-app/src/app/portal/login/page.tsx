"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, sanitizeRedirect } from "@/lib/auth/redirect";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import { authSurface } from "@/components/auth/auth-ui";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";
import {
  isAuthUserEmailVerified,
  isClientEmailVerificationRequired,
} from "@/lib/auth/config";
import { isEmailNotConfirmedError } from "@/lib/auth/auth-errors";
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
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  const redirectTo = sanitizeRedirect(searchParams.get("redirect")) ?? ADMIN_PORTAL_HOME;

  const finishLogin = async (userId: string) => {
    const role = await fetchProfileRole(userId);
    if (role !== "admin") {
      await supabase.auth.signOut();
      setError(
        t("adminPortal.accessDenied", {
          defaultValue: "Access denied. This portal is for authorized administrators only.",
        })
      );
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
          setError(
            t("login.emailNotVerified", {
              defaultValue: "This account is not verified yet. Contact support.",
            })
          );
          return;
        }
        throw new Error(result.error.message);
      }
      if (!result.data.user) throw new Error("Authentication failed");

      if (
        isClientEmailVerificationRequired() &&
        !isAuthUserEmailVerified(result.data.user)
      ) {
        await supabase.auth.signOut();
        setError(
          t("login.emailNotVerified", {
            defaultValue: "This account is not verified yet. Contact support.",
          })
        );
        return;
      }

      await finishLogin(result.data.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10">
      <div
        className={cn(
          "w-full max-w-md rounded-[2rem] border p-8 shadow-2xl sm:p-10",
          isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"
        )}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size="lg" linked={false} onDarkBackground={isDark} />
          <div className="mt-5 flex items-center gap-2 rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
            <Shield className="h-3.5 w-3.5" />
            {t("adminPortal.badge", { defaultValue: "Admin Portal" })}
          </div>
          <h1 className={cn("mt-4 text-2xl font-bold", s.heading)}>
            {t("adminPortal.signInTitle", { defaultValue: "Administrator Sign In" })}
          </h1>
          <p className={cn("mt-2 text-sm", s.body)}>
            {t("adminPortal.signInSubtitle", {
              defaultValue: "Secure access to platform management and controls.",
            })}
          </p>
        </div>

        {error && (
          <div className={cn("mb-6 rounded-2xl border px-4 py-3 text-sm", s.errorBox)}>
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className={cn("text-sm font-medium", s.label)}>
              {t("login.email", { defaultValue: "Email Address" })}
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nextgrades.de"
              className={s.input}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className={cn("text-sm font-medium", s.label)}>
              {t("login.password", { defaultValue: "Password" })}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(s.input, "pr-12")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#D4AF37]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-4 py-3.5 text-sm font-bold text-[#0D1B2A] transition hover:bg-[#e5c158] disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D1B2A] border-t-transparent" />
            ) : (
              t("adminPortal.signInButton", { defaultValue: "Sign in to Admin Portal" })
            )}
          </button>
        </form>

        <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-center text-sm">
          <div className={cn("rounded-2xl border px-4 py-3 text-left", isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50")}>
            <p className={cn("text-xs font-semibold uppercase tracking-wide text-[#D4AF37]", s.heading)}>
              {t("adminPortal.handoffTitle")}
            </p>
            <p className={cn("mt-2 text-sm leading-relaxed", s.body)}>{t("adminPortal.handoffDesc")}</p>
            <ul className={cn("mt-3 space-y-1.5 text-xs", s.body)}>
              <li>{t("adminPortal.handoffCms")}</li>
              <li>{t("adminPortal.handoffUsers")}</li>
            </ul>
          </div>
          <Link href="/" className={cn("block font-medium", s.link)}>
            {t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}
          </Link>
          <p className={s.body}>
            {t("adminPortal.studentTeacherLogin", { defaultValue: "Student or teacher?" })}{" "}
            <Link href="/login" className={cn("font-semibold", s.link)}>
              {t("adminPortal.mainLogin", { defaultValue: "Use main login" })}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPortalLoginPage() {
  return (
    <AuthGuestGuard skipLoginOtp adminPortal>
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D1B2A] text-gray-400">
            …
          </div>
        }
      >
        <AdminPortalLoginContent />
      </Suspense>
    </AuthGuestGuard>
  );
}
