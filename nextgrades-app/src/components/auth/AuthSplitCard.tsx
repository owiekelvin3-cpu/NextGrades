"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { useTheme } from "@/context/ThemeContext";
import { theme as th } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils";
import { authSurface } from "@/components/auth/auth-ui";
import { authFadeUp, authScaleIn, AUTH_EASE } from "@/components/auth/auth-motion";

type AuthSplitCardProps = {
  children: React.ReactNode;
  heroImage: string;
  heroCaption?: string;
  heroPanel?: React.ReactNode;
  className?: string;
};

/** Havenix-style split auth card - form left, curved hero right (desktop). */
export function AuthSplitCard({ children, heroImage, heroCaption, heroPanel, className }: AuthSplitCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <div className={cn("px-4 py-6 sm:px-6 sm:py-10 lg:px-8", s.pageBg, className)}>
      {heroPanel && (
        <motion.div
          variants={authScaleIn}
          initial="hidden"
          animate="show"
          className="mx-auto mb-6 max-w-[1120px] overflow-hidden rounded-3xl bg-[#0D1B2A] p-6 shadow-xl lg:hidden"
        >
          {heroPanel}
        </motion.div>
      )}
      <div className="mx-auto flex min-h-[480px] max-w-[1120px] items-center">
        <motion.div
          variants={authScaleIn}
          initial="hidden"
          animate="show"
          className={cn(
            "relative grid w-full overflow-hidden rounded-[2rem] border shadow-[0_24px_80px_rgba(13,27,42,0.08)] sm:rounded-[2.5rem] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]",
            s.card,
            isDark && "shadow-black/30"
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
            aria-hidden
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, transparent 40%, transparent 60%, rgba(212,175,55,0.04) 100%)",
            }}
          />

          <div className="relative flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-[400px]">{children}</div>
          </div>

          <div className={cn("relative hidden min-h-[640px] overflow-hidden lg:block", "bg-[#0D1B2A]")}>
            <MarketingImage
              src={heroImage}
              alt=""
              containerClassName="absolute inset-0"
              sizes="45vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #0D1B2A 0%, #0D1B2A99 25%, transparent 55%), linear-gradient(to bottom, transparent 0%, #0D1B2Acc 70%, #0D1B2A 100%)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute -right-12 top-1/4 h-56 w-56 rounded-full bg-[#D4AF37]/20 blur-3xl"
              animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute bottom-12 left-8 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-2xl"
              animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              aria-hidden
            />
            {heroPanel ? (
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-10">{heroPanel}</div>
            ) : heroCaption ? (
              <p className="absolute right-8 top-8 z-10 max-w-[220px] text-right text-lg font-semibold leading-snug text-white drop-shadow-md">
                {heroCaption}
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AuthSplitHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <motion.div variants={authFadeUp} initial="hidden" animate="show" className="mb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: AUTH_EASE }}
        className="mb-8"
      >
        <BrandLogo size="lg" href="/" onDarkBackground={isDark} />
      </motion.div>
      <h1 className={cn("text-[1.75rem] font-bold tracking-tight sm:text-[2rem]", s.heading)}>{title}</h1>
      <p className={cn("mt-2 text-sm sm:text-base", s.body)}>{subtitle}</p>
    </motion.div>
  );
}

export function AuthSocialButton({
  onClick,
  disabled,
  loading,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const { theme } = useTheme();
  const s = authSurface(theme === "dark");

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(s.socialBtn, "disabled:cursor-not-allowed disabled:opacity-60")}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      ) : (
        icon
      )}
      {label}
    </motion.button>
  );
}

export function AuthDivider({ label = "Or" }: { label?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <div className="relative my-6">
      <div className={cn("absolute inset-0 flex items-center", s.dividerLine)}>
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <span className={cn("px-4 text-sm", s.dividerText)}>{label}</span>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  trailing,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  trailing?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <motion.div variants={authFadeUp} className="space-y-2">
      <label htmlFor={id} className={cn("text-sm font-medium", s.label)}>
        {label}
      </label>
      <div className="group relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border border-transparent px-4 py-3.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25",
            isDark
              ? "bg-[#0D1B2A]/60 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/40 focus:bg-[#0D1B2A]/80"
              : "bg-[#F3F4F6] text-[#0D1B2A] placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:bg-white",
            error && "border-red-400/50",
            trailing && "pr-12",
            "group-focus-within:shadow-[0_0_0_1px_rgba(212,175,55,0.15)]"
          )}
        />
        {trailing}
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function AuthPrimaryButton({
  children,
  disabled,
  loading,
  type = "submit",
  variant = "navy",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "submit" | "button";
  variant?: "navy" | "gold";
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : { y: -2, boxShadow: "0 8px 24px rgba(212,175,55,0.2)" }}
      whileTap={disabled || loading ? undefined : { scale: 0.98, y: 0 }}
      transition={{ duration: 0.2, ease: AUTH_EASE }}
      className={cn(
        "theme-btn-interaction relative mt-2 w-full overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-semibold",
        variant === "gold" ? th.btnGold : th.btnDark,
        th.focusRing
      )}
    >
      {variant === "gold" && !loading && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden
        />
      )}
      {loading ? (
        <>
          <span
            className={cn(
              "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
              variant === "gold" ? "border-[var(--button-primary-foreground)]" : "border-[var(--button-dark-foreground)]"
            )}
          />
          …
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export function AuthTabSwitcher({
  tab,
  onTabChange,
  loginLabel,
  registerLabel,
}: {
  tab: "login" | "register";
  onTabChange: (t: "login" | "register") => void;
  loginLabel: string;
  registerLabel: string;
}) {
  const { theme } = useTheme();
  const s = authSurface(theme === "dark");

  return (
    <div className={cn("mb-6 grid grid-cols-2 gap-1 rounded-2xl p-1", s.tabTrack)}>
      {(["login", "register"] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key)}
          className={cn(
            "rounded-xl py-2.5 text-sm font-semibold transition-all duration-300",
            tab === key ? s.tabActive : s.tabIdle
          )}
        >
          {key === "login" ? loginLabel : registerLabel}
        </button>
      ))}
    </div>
  );
}