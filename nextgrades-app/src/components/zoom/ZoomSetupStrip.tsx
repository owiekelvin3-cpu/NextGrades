"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Video, CheckCircle2, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { resolveZoomOAuthErrorMessage } from "@/lib/zoom/oauth-errors";

export type ZoomConnectionStatus = {
  configured: boolean;
  connected: boolean;
  zoomEmail: string | null;
  expiresAt: string | null;
  connectedAt: string | null;
  expired: boolean;
  oauthEnv?: "production" | "development";
  multiUserReady?: boolean;
};

type Props = {
  returnPath?: string;
  onStatusChange?: (status: ZoomConnectionStatus) => void;
  className?: string;
};

export function useZoomStatus(returnPath = "/dashboard/teacher/schedule") {
  const { success: toastSuccess, error: toastError } = useToast();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledZoomParam = useRef<string | null>(null);
  const [status, setStatus] = useState<ZoomConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/zoom/status");
    const data = (await res.json()) as ZoomConnectionStatus;
    setStatus(data);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const zoom = searchParams.get("zoom");
    if (!zoom || (zoom !== "connected" && zoom !== "error")) return;
    if (handledZoomParam.current === zoom) return;
    handledZoomParam.current = zoom;

    if (zoom === "connected") {
      toastSuccess(t("zoom.connectedSuccess", { defaultValue: "Zoom account connected successfully!" }));
      void load();
    } else {
      const reason = searchParams.get("reason");
      toastError(resolveZoomOAuthErrorMessage(reason, t));
    }

    router.replace(returnPath, { scroll: false });
  }, [searchParams, toastSuccess, toastError, t, load, router, returnPath]);

  const ready = Boolean(status?.configured && status.connected && !status.expired);

  return { status, loading, ready, reload: load };
}

export function ZoomSetupStrip({ returnPath = "/dashboard/teacher/schedule", onStatusChange, className }: Props) {
  const { t } = useTranslation();
  const { status, loading, ready } = useZoomStatus(returnPath);

  useEffect(() => {
    if (status) onStatusChange?.(status);
  }, [status, onStatusChange]);

  const connectHref = `/api/zoom/authorize?return=${encodeURIComponent(returnPath)}`;

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("misc.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className={cn("rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", className)}>
        {t("zoom.notConfigured", { defaultValue: "Zoom OAuth is not configured on the server." })}
      </div>
    );
  }

  if (status.multiUserReady === false && !ready) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("zoom.devModeWarning", {
            defaultValue:
              "Zoom is in Development mode on the server. Only the Zoom account that created the app can connect until Production OAuth credentials are configured.",
          })}
        </div>
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#FFF9E6] to-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                <AlertCircle className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B2A]">
                  {t("zoom.setupRequired", { defaultValue: "Connect Zoom to start scheduling" })}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  {t("zoom.devModeTeacherHint", {
                    defaultValue:
                      "If you see “Application Not Found” on Zoom, ask your admin to switch to Production credentials in Zoom Marketplace.",
                  })}
                </p>
              </div>
            </div>
            <Button variant="gold" href={connectHref} className="shrink-0 gap-2">
              <Video className="h-4 w-4" />
              {t("zoom.connect", { defaultValue: "Connect Zoom" })}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (ready) {
    return (
      <div className={cn("space-y-3", className)}>
        {status.multiUserReady === false && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("zoom.devModeWarning", {
              defaultValue:
                "Zoom is in Development mode on the server. Only the Zoom account that created the app can connect until Production OAuth credentials are configured.",
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0D1B2A]">
              {t("zoom.statusConnected", { defaultValue: "Connected" })}
            </p>
            {status.zoomEmail && <p className="truncate text-xs text-gray-600">{status.zoomEmail}</p>}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <Video className="h-3.5 w-3.5" />
          {t("zoom.readyToSchedule", { defaultValue: "Ready to schedule" })}
        </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#FFF9E6] to-white p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
            <AlertCircle className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0D1B2A]">
              {status?.expired
                ? t("zoom.tokenExpired", { defaultValue: "Session expired — reconnect to continue scheduling." })
                : t("zoom.setupRequired", { defaultValue: "Connect Zoom to start scheduling" })}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              {t("zoom.setupRequiredDesc", {
                defaultValue: "One quick step — link your Zoom account, then create your first live class.",
              })}
            </p>
          </div>
        </div>
        <Button variant="gold" href={connectHref} className="shrink-0 gap-2">
          <Video className="h-4 w-4" />
          {status?.expired
            ? t("zoom.reconnect", { defaultValue: "Reconnect Zoom" })
            : t("zoom.connect", { defaultValue: "Connect Zoom" })}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
