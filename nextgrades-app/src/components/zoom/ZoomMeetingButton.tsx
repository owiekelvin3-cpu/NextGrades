"use client";

import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: string;
  mode: "start" | "join";
  className?: string;
  size?: "sm" | "md";
};

export function ZoomMeetingButton({ lessonId, mode, className, size = "md" }: Props) {
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
      const data = (await res.json()) as { url?: string; passcode?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not open meeting");
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

  return (
    <button
      type="button"
      onClick={() => void openMeeting()}
      disabled={loading}
      className={cn(
        "inline-flex items-center font-semibold text-white transition hover:bg-[#1a7ae8] disabled:opacity-60",
        mode === "start" ? "bg-[#0D1B2A] hover:bg-[#1a3354]" : "bg-[#2D8CFF]",
        sizeCls,
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
      {label}
    </button>
  );
}
