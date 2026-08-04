"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { CompactFooter } from "@/components/CompactFooter";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthSplitCard, AuthSplitHeader } from "@/components/auth/AuthSplitCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  AuthMobileShell,
  AuthMobileIllustration,
} from "@/components/auth/AuthMobileShell";
import {
  AuthMobilePrimaryButton,
  AuthRolePicker,
} from "@/components/auth/AuthMobileField";
import { authSurface } from "@/components/auth/auth-ui";
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";
import { isPublicSignupEnabled } from "@/lib/auth/public-signup";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const signupHeroImage = useMarketingHeroImage();
  const s = authSurface(theme === "dark");
  const isDark = theme === "dark";
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const signupEnabled = isPublicSignupEnabled();
  const [mobileStep, setMobileStep] = useState<"role" | "form">("role");
  const [mobileRole, setMobileRole] = useState<"student" | "teacher">("student");

  const heroBenefits = useMemo(
    () => [
      t("login.heroBenefit1"),
      t("login.heroBenefit2"),
      t("login.heroBenefit3"),
      t("login.heroBenefit4"),
    ],
    [t]
  );

  useEffect(() => {
    if (!signupEnabled) {
      const q = new URLSearchParams();
      q.set("invite", "1");
      if (redirectTo) q.set("redirect", redirectTo);
      router.replace(`/login?${q.toString()}`);
    }
  }, [router, redirectTo, signupEnabled]);

  if (!signupEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        …
      </div>
    );
  }

  const heroPanel = (
    <div className="max-w-md">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{t("login.heroHeadline")}</p>
      <h2 className="mb-3 text-3xl font-bold leading-tight text-white">{t("login.heroTagline")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-gray-200">{t("login.signupDescription")}</p>
      <ul className="space-y-3">
        {heroBenefits.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/90">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  const termsFooter = (
    <p className={cn("mt-8 text-center text-xs leading-relaxed", isDark ? "text-gray-500" : "text-gray-500")}>
      {t("login.termsPrefix")}{" "}
      <Link href="/terms" className="font-medium text-[#D4AF37] hover:opacity-90">
        {t("login.terms")}
      </Link>{" "}
      {t("login.and")}{" "}
      <Link href="/privacy" className="font-medium text-[#D4AF37] hover:opacity-90">
        {t("login.privacy")}
      </Link>
    </p>
  );

  return (
    <>
      {mobileStep === "role" ? (
        <AuthMobileShell
          title={t("login.mobileRegisterHeadline")}
          subtitle={t("login.iAmA")}
        >
          <AuthRolePicker
            value={mobileRole}
            onChange={setMobileRole}
            studentLabel={t("login.student")}
            teacherLabel={t("login.teacher")}
          />
          <div className="mt-6">
            <AuthMobilePrimaryButton type="button" onClick={() => setMobileStep("form")}>
              {t("login.createAccountNow")}
            </AuthMobilePrimaryButton>
          </div>
          <p className={cn("mt-6 text-center text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            {t("login.haveAccount")}{" "}
            <Link href="/login" className="font-bold text-[#D4AF37] hover:opacity-90">
              {t("login.signIn")}
            </Link>
          </p>
          {termsFooter}
        </AuthMobileShell>
      ) : (
        <AuthMobileShell
          title={t("login.createAccount")}
          subtitle={t("login.mobileRegisterSubtitle")}
          illustration={<AuthMobileIllustration src={signupHeroImage} alt="" />}
          onBack={() => setMobileStep("role")}
        >
          <RegisterForm
            appearance="mobile"
            hideRolePicker
            hideFooterLink
            defaultRole={mobileRole}
            redirectTo={redirectTo}
          />
          <p className={cn("mt-6 text-center text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            {t("login.haveAccount")}{" "}
            <Link href="/login" className="font-bold text-[#D4AF37] hover:opacity-90">
              {t("login.signIn")}
            </Link>
          </p>
          {termsFooter}
        </AuthMobileShell>
      )}

      <div className="hidden lg:contents">
        <AuthPageShell footer={<CompactFooter />}>
          <div className="flex flex-1 flex-col justify-center py-4 md:py-8">
            <AuthSplitCard heroImage={signupHeroImage} heroPanel={heroPanel} className="!bg-transparent">
              <AuthSplitHeader title={t("login.createAccount")} subtitle={t("login.signupDescription")} />
              <RegisterForm redirectTo={redirectTo} />
              <p className={cn("mt-8 text-center text-xs leading-relaxed", s.body)}>
                {t("login.termsPrefix")}{" "}
                <Link href="/terms" className={s.link}>
                  {t("login.terms")}
                </Link>{" "}
                {t("login.and")}{" "}
                <Link href="/privacy" className={s.link}>
                  {t("login.privacy")}
                </Link>
              </p>
            </AuthSplitCard>
          </div>
        </AuthPageShell>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <AuthGuestGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
            …
          </div>
        }
      >
        <SignupContent />
      </Suspense>
    </AuthGuestGuard>
  );
}
