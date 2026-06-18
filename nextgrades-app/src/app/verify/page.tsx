"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { VerificationExperience } from "@/components/auth/VerificationExperience";
import { AuthMobileShell } from "@/components/auth/AuthMobileShell";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import { sanitizeRedirect, fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import type { AppRole } from "@/lib/auth/roles";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { useToast } from "@/context/ToastContext";
import {
  buildVerifyUrl,
  clearPendingVerification,
  loadPendingVerification,
  markWelcomeAfterVerification,
  savePendingVerification,
  type VerificationStep,
} from "@/lib/auth/pending-verification-storage";
import { isAuthUserEmailVerified, isClientLoginOtpRequired } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === "dark";

  const stepParam = searchParams.get("step");
  const emailParam = searchParams.get("email")?.trim().toLowerCase() || "";
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<VerificationStep>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pending = loadPendingVerification();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let resolvedStep: VerificationStep =
        stepParam === "login" || stepParam === "signup" ? stepParam : pending?.step || "signup";
      let resolvedEmail = emailParam || pending?.email || user?.email || "";
      const resolvedPassword = pending?.password;

      if (user) {
        try {
          const statusRes = await fetch("/api/auth/login/status");
          const status = (await statusRes.json()) as {
            mfaRequired?: boolean;
            emailVerified?: boolean;
            mfaSatisfied?: boolean;
          };

          const signupFlow =
            stepParam === "signup" || pending?.step === "signup" || !status.emailVerified;

          if (status.emailVerified && (status.mfaSatisfied || !isClientLoginOtpRequired())) {
            const role = await fetchProfileRole(user.id);
            router.replace(role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role");
            return;
          }

          if (status.mfaRequired && isClientLoginOtpRequired() && !signupFlow) {
            resolvedStep = "login";
            resolvedEmail = user.email || resolvedEmail;
          } else if (!status.emailVerified) {
            resolvedStep = "signup";
            resolvedEmail = user.email || resolvedEmail;
          } else if (!stepParam && !pending) {
            const role = await fetchProfileRole(user.id);
            router.replace(role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role");
            return;
          }
        } catch {
          /* continue with params */
        }
      }

      if (!resolvedEmail) {
        router.replace("/login");
        return;
      }

      if (!cancelled) {
        setStep(resolvedStep);
        setEmail(resolvedEmail);
        setPassword(resolvedPassword);
        savePendingVerification({
          step: resolvedStep,
          email: resolvedEmail,
          password: resolvedPassword,
          redirect: redirectTo,
        });
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stepParam, emailParam, redirectTo, router]);

  const handleVerified = async (userId: string, knownRole?: AppRole | null) => {
    clearPendingVerification();
    markWelcomeAfterVerification();

    const role = knownRole ?? (await fetchProfileRole(userId));
    const target = role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role";

    router.replace(target);

    toast.success(
      step === "login"
        ? t("login.welcomeBack", { defaultValue: "Welcome back!" })
        : t("verify.welcomeNew", { defaultValue: "Welcome to NextGrades!" })
    );

    void syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
  };

  const handleChangeEmail = async () => {
    clearPendingVerification();
    if (step === "login") {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  const autoSend = useMemo(() => step === "login", [step]);

  if (!ready || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <AuthMobileShell
        title={step === "login" ? t("verify.loginTitle") : t("verify.signupTitle")}
        subtitle={step === "login" ? t("verify.loginSubtitle") : t("verify.signupSubtitle")}
        onBack={handleChangeEmail}
        className="lg:hidden"
      >
        <VerificationExperience
          key={step}
          step={step}
          email={email}
          password={password}
          redirectTo={redirectTo}
          onVerified={handleVerified}
          onChangeEmail={handleChangeEmail}
          autoSendCode={autoSend}
          embedded
        />
        <p className={cn("mt-6 text-center text-xs leading-relaxed", isDark ? "text-gray-500" : "text-gray-400")}>
          {t("verify.securityNote")}
        </p>
      </AuthMobileShell>

      <div
        className={cn(
          "relative hidden min-h-screen flex-col lg:flex",
          isDark
            ? "bg-[#0D1B2A]"
            : "bg-gradient-to-br from-[#F0F2F5] via-[#F8F9FB] to-[#EEF0F4]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: isDark
              ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.15), transparent)"
              : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.12), transparent)",
          }}
        />

        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <BrandLogo size="md" href="/" onDarkBackground={isDark} />
          <Link
            href="/help"
            className={cn(
              "text-sm font-medium transition-colors hover:text-[#D4AF37]",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {t("verify.needHelp", { defaultValue: "Need help?" })}
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-4">
          <VerificationExperience
            step={step}
            email={email}
            password={password}
            redirectTo={redirectTo}
            onVerified={handleVerified}
            onChangeEmail={handleChangeEmail}
            autoSendCode={autoSend}
          />

          <p className={cn("mt-8 max-w-md text-center text-xs leading-relaxed", isDark ? "text-gray-500" : "text-gray-400")}>
            {t("verify.securityNote")}
          </p>
        </main>
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F0F2F5] dark:bg-[#0D1B2A]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
