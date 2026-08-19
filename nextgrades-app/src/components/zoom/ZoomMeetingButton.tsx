"use client";

import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import type { MeetingProvider } from "@/lib/meetings/link";

const PROVIDER_BUTTON: Record<MeetingProvider, string> = {
  zoom: "bg-[#2D8CFF] hover:bg-[#1a7ae8]",
  google_meet: "bg-[#00897B] hover:bg-[#00796B]",
  microsoft_teams: "bg-[#6264A7] hover:bg-[#4f5190]",
  external: "bg-[#0D1B2A] hover:bg-[#1a3354]",
};

type Props = {
  lessonId: string;
  mode: "start" | "join";
  provider?: string | null;
  className?: string;
  size?: "sm" | "md";
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
  return "zoom";
}

export function ZoomMeetingButton({ lessonId, mode, provider, className, size = "md" }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const label =
    mode === "start"
      ? t("zoom.startMeeting", { defaultValue: "Start Class" })
      : t("studentDashboard.joinZoomMeeting", { defaultValue: "Join Class" });

  const openMeeting = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/meeting`);
      const data = (await res.json()) as {
        url?: string;
        passcode?: string;
        provider?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(
          data.error ||
            t("zoom.meetingLinkMissing", {
              defaultValue: "Kein Video-Link hinterlegt. Die Lehrkraft muss ihn vor der Stunde einfügen.",
            })
        );
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
      if (data.passcode) {
        toast.success(
          t("zoom.passcodeHint", {
            defaultValue: "Meeting passcode: {{code}}",
            code: data.passcode,
          })
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("misc.errorGeneric", { defaultValue: "Something went wrong" }));
    } finally {
      setLoading(false);
    }
  };

  const sizeCls =
    size === "sm"
      ? "gap-1.5 rounded-lg px-3 py-1.5 text-xs"
      : "gap-2 rounded-xl px-4 py-2.5 text-sm";

  const p = normalizeProvider(provider);
  const joinColor = mode === "join" ? PROVIDER_BUTTON[p] : "bg-[#0D1B2A] hover:bg-[#1a3354]";

  return (
    <button
      type="button"
      onClick={() => void openMeeting()}
      disabled={loading}
      className={cn(
        "inline-flex items-center font-semibold text-white transition disabled:opacity-60",
        joinColor,
        sizeCls,
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
      {label}
    </button>
  );
}
