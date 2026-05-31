import { cn } from "@/lib/utils";

/** Shared auth surface tokens — light + dark. */
export function authSurface(isDark: boolean) {
  return {
    pageBg: isDark ? "bg-[#0D1B2A]" : "bg-[#F0F2F5]",
    card: isDark ? "bg-[#112240] border-white/10" : "bg-white border-gray-100",
    cardShadow: isDark ? "shadow-[0_-8px_40px_rgba(0,0,0,0.35)]" : "shadow-[0_-8px_40px_rgba(13,27,42,0.08)]",
    heading: isDark ? "text-white" : "text-[#0D1B2A]",
    body: isDark ? "text-gray-400" : "text-[#6B7280]",
    label: isDark ? "text-gray-300" : "text-[#374151]",
    input: cn(
      "w-full rounded-2xl border border-transparent py-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25",
      isDark
        ? "bg-[#0D1B2A]/60 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/40 focus:bg-[#0D1B2A]"
        : "bg-[#F3F4F6] pl-11 pr-4 text-[#0D1B2A] placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:bg-white"
    ),
    inputWithTrail: isDark ? "pr-12" : "pr-12",
    tabTrack: isDark ? "bg-[#0D1B2A]/80" : "bg-[#F3F4F6]",
    tabActive: isDark ? "bg-[#112240] text-white shadow-md shadow-black/20" : "bg-white text-[#0D1B2A] shadow-sm",
    tabIdle: isDark ? "text-gray-400" : "text-[#6B7280]",
    dividerLine: isDark ? "border-white/10" : "border-[#E5E7EB]",
    dividerText: isDark ? "bg-[#112240] text-gray-500" : "bg-white text-[#9CA3AF]",
    socialBtn: cn(
      "flex w-full items-center justify-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium transition",
      isDark
        ? "border-white/10 bg-[#0D1B2A]/50 text-white hover:border-[#D4AF37]/30"
        : "border-[#E5E7EB] bg-white text-[#0D1B2A] hover:border-[#D4AF37]/40"
    ),
    errorBox: isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-700",
    link: "font-medium text-[#D4AF37] hover:text-[#e5c158]",
  };
}
