import { useTheme } from "@/context/ThemeContext";

/** Shared light/dark styling for public marketing pages (home, programs, subjects). */
export function useMarketingTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    isDark,
    page: isDark ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]",
    section: isDark ? "bg-[#112240]" : "bg-white",
    sectionAlt: isDark ? "bg-[#0D1B2A]" : "bg-[#F5F6F8]",
    card: isDark
      ? "bg-[#112240] border border-white/10 shadow-lg shadow-black/25"
      : "bg-white border border-gray-100 shadow-md",
    cardInner: isDark ? "bg-[#112240]" : "bg-white",
    heading: isDark ? "text-white" : "text-[#0D1B2A]",
    body: isDark ? "text-gray-300" : "text-gray-600",
    muted: isDark ? "text-gray-400" : "text-gray-500",
    statsBox: isDark
      ? "bg-[#112240] border border-white/10"
      : "bg-gray-50 border border-gray-100",
    tableWrap: isDark
      ? "border-white/10 bg-[#112240]"
      : "border-gray-200 bg-white",
    tableHead: isDark ? "bg-[#0D1B2A] text-white" : "bg-gray-50 text-[#0D1B2A]",
    tableRowEven: isDark ? "bg-[#112240]" : "bg-white",
    tableRowOdd: isDark ? "bg-[#0D1B2A]/50" : "bg-gray-50/80",
  };
}
