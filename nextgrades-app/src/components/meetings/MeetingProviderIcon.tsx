"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingProvider } from "@/lib/meetings/link";
import { providerLabel } from "@/lib/meetings/link";

type Props = {
  provider?: MeetingProvider | string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const PROVIDER_STYLES: Record<MeetingProvider, { bg: string; text: string; ring: string }> = {
  zoom: { bg: "bg-[#2D8CFF]", text: "text-white", ring: "ring-[#2D8CFF]/30" },
  google_meet: { bg: "bg-[#00897B]", text: "text-white", ring: "ring-[#00897B]/30" },
  microsoft_teams: { bg: "bg-[#6264A7]", text: "text-white", ring: "ring-[#6264A7]/30" },
  external: { bg: "bg-[#0D1B2A]", text: "text-white", ring: "ring-gray-300/30" },
};

function normalizeProvider(provider?: string | null): MeetingProvider {
  if (
    provider === "zoom" ||
    provider === "google_meet" ||
    provider === "microsoft_teams" ||
    provider === "external"
  ) {
    return provider;
  }
  return "external";
}

export function MeetingProviderIcon({ provider, className, size = "md" }: Props) {
  const p = normalizeProvider(provider);
  const styles = PROVIDER_STYLES[p];
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl ring-2",
        dim,
        styles.bg,
        styles.text,
        styles.ring,
        className
      )}
      title={providerLabel(p)}
      aria-hidden
    >
      <Video className={iconDim} />
    </span>
  );
}

export function MeetingProviderBadge({
  provider,
  className,
}: {
  provider?: MeetingProvider | string | null;
  className?: string;
}) {
  const p = normalizeProvider(provider);
  const styles = PROVIDER_STYLES[p];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles.bg,
        styles.text,
        className
      )}
    >
      <Video className="h-3 w-3" aria-hidden />
      {providerLabel(p)}
    </span>
  );
}
