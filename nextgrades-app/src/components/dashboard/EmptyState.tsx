"use client";

import { useTheme } from "@/context/ThemeContext";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`py-12 px-6 text-center rounded-2xl border ${
        theme === "dark" ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100 bg-gray-50"
      }`}
    >
      <Inbox className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
      <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{title}</h3>
      {description && (
        <p className={`text-sm mb-4 max-w-md mx-auto ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
