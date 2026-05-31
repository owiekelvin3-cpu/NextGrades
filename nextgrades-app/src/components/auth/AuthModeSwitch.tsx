"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { authSurface } from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

type Props = {
  mode: "login" | "register";
  onSwitch: () => void;
  className?: string;
};

export function AuthModeSwitch({ mode, onSwitch, className }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const s = authSurface(theme === "dark");

  return (
    <p className={cn("text-center text-sm", s.body, className)}>
      {mode === "login" ? (
        <>
          {t("login.noAccount", { defaultValue: "Don't have an account?" })}{" "}
          <button type="button" onClick={onSwitch} className={cn("font-semibold", s.link)}>
            {t("login.signUpLink", { defaultValue: "Register" })}
          </button>
        </>
      ) : (
        <>
          {t("login.haveAccount", { defaultValue: "Already have an account?" })}{" "}
          <button type="button" onClick={onSwitch} className={cn("font-semibold", s.link)}>
            {t("login.signIn", { defaultValue: "Login" })}
          </button>
        </>
      )}
    </p>
  );
}
