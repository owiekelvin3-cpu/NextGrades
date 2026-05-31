"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { authSurface } from "@/components/auth/auth-ui";

type AuthSplitCardProps = {
  children: React.ReactNode;
  heroImage: string;
  heroCaption: string;
  className?: string;
};

/** Havenix-style split auth card — form left, curved hero right (desktop). */
export function AuthSplitCard({ children, heroImage, heroCaption, className }: AuthSplitCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <div className={cn("px-4 py-8 sm:px-6 sm:py-10 lg:px-8", s.pageBg, className)}>
      <div className="mx-auto flex min-h-[560px] max-w-[1120px] items-center">
        <div
          className={cn(
            "grid w-full overflow-hidden rounded-[2.5rem] border shadow-[0_24px_80px_rgba(13,27,42,0.08)] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]",
            s.card,
            isDark && "shadow-black/30"
          )}
        >
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-[400px]">{children}</div>
          </div>

          <div className={cn("relative hidden min-h-[640px] p-4 lg:block", isDark ? "bg-[#0D1B2A]/50" : "bg-[#F0F2F5]")}>
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] rounded-br-[3.5rem] rounded-tl-[3.5rem] shadow-inner">
              <MarketingImage
                src={heroImage}
                alt=""
                containerClassName="absolute inset-0"
                sizes="45vw"
                className="scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/30 via-transparent to-[#0D1B2A]/45" />
              <p className="absolute right-8 top-8 max-w-[220px] text-right text-lg font-semibold leading-snug text-white drop-shadow-md">
                {heroCaption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthSplitHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <div className="mb-8">
      <div className="mb-8">
        <BrandLogo size="lg" href="/" onDarkBackground={isDark} />
      </div>
      <h1 className={cn("text-[1.75rem] font-bold tracking-tight sm:text-[2rem]", s.heading)}>{title}</h1>
      <p className={cn("mt-2 text-sm sm:text-base", s.body)}>{subtitle}</p>
    </div>
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(s.socialBtn, "disabled:cursor-not-allowed disabled:opacity-60")}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      ) : (
        icon
      )}
      {label}
    </button>
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
    <div className="space-y-2">
      <label htmlFor={id} className={cn("text-sm font-medium", s.label)}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border border-transparent px-4 py-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25",
            isDark
              ? "bg-[#0D1B2A]/60 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/40"
              : "bg-[#F3F4F6] text-[#0D1B2A] placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:bg-white",
            error && "border-red-400/50",
            trailing && "pr-12"
          )}
        />
        {trailing}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
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
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "gold"
          ? "bg-[#D4AF37] text-[#0D1B2A] hover:bg-[#e5c158]"
          : "bg-[#0D1B2A] text-white hover:bg-[#132942]"
      )}
    >
      {loading ? (
        <>
          <span
            className={cn(
              "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
              variant === "gold" ? "border-[#0D1B2A]" : "border-white"
            )}
          />
          …
        </>
      ) : (
        children
      )}
    </button>
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
            "rounded-xl py-2.5 text-sm font-semibold transition-all",
            tab === key ? s.tabActive : s.tabIdle
          )}
        >
          {key === "login" ? loginLabel : registerLabel}
        </button>
      ))}
    </div>
  );
}
