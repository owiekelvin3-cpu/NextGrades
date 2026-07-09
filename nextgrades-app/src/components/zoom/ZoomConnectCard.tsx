"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Video, CheckCircle2, XCircle, Loader2, Unplug } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { SettingsCard } from "@/components/dashboard/settings/SettingsCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { resolveZoomOAuthErrorMessage } from "@/lib/zoom/oauth-errors";

type ZoomStatus = {
  configured: boolean;
  connected: boolean;
  zoomEmail: string | null;
  expiresAt: string | null;
  connectedAt: string | null;
  expired: boolean;
  oauthEnv?: "production" | "development";
  multiUserReady?: boolean;
};

export function ZoomConnectCard() {
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<ZoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const handledZoomParam = useRef<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/zoom/status");
    const data = (await res.json()) as ZoomStatus;
    setStatus(data);
    setLoading(false);
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

    router.replace("/dashboard/teacher/settings", { scroll: false });
  }, [searchParams, toastSuccess, toastError, t, load, router]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/zoom/disconnect", { method: "POST" });
      if (!res.ok) throw new Error();
      toastSuccess(t("zoom.disconnected", { defaultValue: "Zoom account disconnected" }));
      await load();
    } catch {
      toastError(t("zoom.disconnectError", { defaultValue: "Could not disconnect Zoom" }));
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <SettingsCard
      title={t("zoom.connectTitle", { defaultValue: "Zoom integration" })}
      description={t("zoom.connectDesc", {
        defaultValue: "Connect your Zoom account to schedule live classes and private sessions.",
      })}
      icon={Video}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("misc.loading", { defaultValue: "Loading..." })}
        </div>
      ) : !status?.configured ? (
        <p className="text-sm text-amber-700">
          {t("zoom.notConfigured", { defaultValue: "Zoom OAuth is not configured on the server." })}
        </p>
      ) : (
        <div className="space-y-4">
          {status.multiUserReady === false && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {t("zoom.devModeWarning", {
                defaultValue:
                  "Zoom is in Development mode on the server. Only the Zoom account that created the app can connect until Production OAuth credentials are configured.",
              })}
            </div>
          )}
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4",
              status.connected ? "border-green-200 bg-green-50" : "border-gray-200 bg-[#FAFBFC]"
            )}
          >
            {status.connected ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0D1B2A]">
                {status.connected
                  ? t("zoom.statusConnected", { defaultValue: "Connected" })
                  : t("zoom.statusDisconnected", { defaultValue: "Not connected" })}
              </p>
              {status.connected && status.zoomEmail && (
                <p className="mt-0.5 text-sm text-gray-600">{status.zoomEmail}</p>
              )}
              {status.connected && status.expired && (
                <p className="mt-1 text-xs text-amber-700">
                  {t("zoom.tokenExpired", { defaultValue: "Session expired - reconnect to continue scheduling." })}
                </p>
              )}
              {status.connectedAt && status.connected && (
                <p className="mt-1 text-xs text-gray-400">
                  {t("zoom.connectedSince", {
                    defaultValue: "Connected since {{date}}",
                    date: new Date(status.connectedAt).toLocaleDateString(),
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!status.connected || status.expired ? (
              <Button variant="gold" href={`/api/zoom/authorize?return=${encodeURIComponent("/dashboard/teacher/settings")}`}>
                <Video className="mr-2 h-4 w-4" />
                {status.expired
                  ? t("zoom.reconnect", { defaultValue: "Reconnect Zoom" })
                  : t("zoom.connect", { defaultValue: "Connect Zoom" })}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => void handleDisconnect()} disabled={disconnecting}>
                {disconnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="mr-2 h-4 w-4" />
                )}
                {t("zoom.disconnect", { defaultValue: "Disconnect" })}
              </Button>
            )}
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
