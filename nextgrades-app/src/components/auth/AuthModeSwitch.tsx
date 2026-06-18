"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { authSurface } from "@/components/auth/auth-ui";
import { isPublicSignupEnabled } from "@/lib/auth/public-signup";
import { cn } from "@/lib/utils";

type Props = {
  mode: "login" | "register";
  onSwitch?: () => void;
  className?: string;
};

export function AuthModeSwitch({ mode, className }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const s = authSurface(theme === "dark");
  const signupEnabled = isPublicSignupEnabled();

  if (mode === "login") {
    if (!signupEnabled) {
      return (
        <p className={cn("text-center text-sm leading-relaxed", s.body, className)}>
          {t("login.inviteOnlyNote")}
        </p>
      );
    }

    return (
      <p className={cn("text-center text-sm", s.body, className)}>
        {t("login.noAccount")}{" "}
        <Link href="/signup" className={cn("font-semibold", s.link)}>
          {t("login.createAccountBtn")}
        </Link>
      </p>
    );
  }

  return (
    <p className={cn("text-center text-sm", s.body, className)}>
      {t("login.haveAccount")}{" "}
      <Link href="/login" className={cn("font-semibold", s.link)}>
        {t("login.signIn")}
      </Link>
    </p>
  );
}
