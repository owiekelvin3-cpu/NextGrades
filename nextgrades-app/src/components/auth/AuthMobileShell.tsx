"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { authFadeUp, authSlideUp, AUTH_EASE } from "@/components/auth/auth-motion";

type AuthMobileShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Optional illustration above the form card */
  illustration?: React.ReactNode;
  showBack?: boolean;
  /** Custom back handler - defaults to home link */
  onBack?: () => void;
  className?: string;
};

/** MBA-style mobile auth layout - decorative header + rounded form sheet. */
export function AuthMobileShell({
  title,
  subtitle,
  children,
  illustration,
  showBack = true,
  onBack,
  className,
}: AuthMobileShellProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col overflow-hidden lg:hidden",
        isDark ? "bg-[#0D1B2A]" : "bg-[#F5F6F8]",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[100%]",
          isDark ? "bg-[#D4AF37]/12" : "bg-[#D4AF37]/18"
        )}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className={cn(
          "pointer-events-none absolute -left-8 top-24 h-24 w-24 rounded-full blur-2xl",
          isDark ? "bg-[#112240]" : "bg-[#0D1B2A]/5"
        )}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative z-10 px-6 pt-5">
        {showBack &&
          (onBack ? (
            <motion.button
              type="button"
              onClick={onBack}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: AUTH_EASE }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-white text-[#0D1B2A] shadow-sm hover:shadow-md"
              )}
              aria-label={t("login.backToHome")}
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: AUTH_EASE }}
            >
              <Link
                href="/"
                className={cn(
                  "mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/15"
                    : "bg-white text-[#0D1B2A] shadow-sm hover:shadow-md"
                )}
                aria-label={t("login.backToHome")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </motion.div>
          ))}

        <motion.h1
          variants={authFadeUp}
          initial="hidden"
          animate="show"
          className={cn(
            "max-w-[300px] text-[1.65rem] font-bold leading-[1.2] tracking-tight",
            "text-foreground"
          )}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease: AUTH_EASE }}
            className={cn("mt-2 max-w-[320px] text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <motion.div
        variants={authSlideUp}
        initial="hidden"
        animate="show"
        className={cn(
          "relative z-10 mt-6 flex flex-1 flex-col rounded-t-[2rem] border px-6 pb-8 pt-8 shadow-[0_-12px_48px_rgba(13,27,42,0.08)]",
          isDark
            ? "border-white/10 bg-[#112240]/95 backdrop-blur-sm"
            : "border-gray-100/80 bg-white"
        )}
      >
        {illustration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: AUTH_EASE }}
            className="mb-6 flex justify-center"
          >
            {illustration}
          </motion.div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

export function AuthMobileIllustration({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#D4AF37]/30 shadow-lg ring-4 ring-[#D4AF37]/10"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </motion.div>
  );
}
