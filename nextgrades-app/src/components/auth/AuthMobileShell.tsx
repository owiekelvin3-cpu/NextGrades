"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

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
        "relative flex min-h-[100dvh] flex-col lg:hidden",
        isDark ? "bg-[#0D1B2A]" : "bg-[#F5F6F8]",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Decorative arc - mockup top-right */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[100%]",
          isDark ? "bg-[#D4AF37]/12" : "bg-[#D4AF37]/18"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-8 top-24 h-24 w-24 rounded-full blur-2xl",
          isDark ? "bg-[#112240]" : "bg-[#0D1B2A]/5"
        )}
        aria-hidden
      />

      <div className="relative z-10 px-6 pt-5">
        {showBack &&
          (onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-white text-[#0D1B2A] shadow-sm hover:shadow-md"
              )}
              aria-label={t("login.backToHome")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
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
          ))}

        <h1
          className={cn(
            "max-w-[300px] text-[1.65rem] font-bold leading-[1.2] tracking-tight",
            "text-foreground"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={cn("mt-2 max-w-[320px] text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={cn(
          "relative z-10 mt-6 flex flex-1 flex-col rounded-t-[2rem] border px-6 pb-8 pt-8 shadow-[0_-12px_48px_rgba(13,27,42,0.08)]",
          isDark
            ? "border-white/10 bg-[#112240]/95 backdrop-blur-sm"
            : "border-gray-100/80 bg-white"
        )}
      >
        {illustration && <div className="mb-6 flex justify-center">{illustration}</div>}
        {children}
      </div>
    </div>
  );
}

export function AuthMobileIllustration({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#D4AF37]/30 shadow-lg ring-4 ring-[#D4AF37]/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
