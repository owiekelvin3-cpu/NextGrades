"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { CheckCircle2, CloudUpload, Loader2, Server } from "lucide-react";
import {
  formatUploadBytes,
  formatUploadEta,
  formatUploadSpeed,
  type UploadProgressSnapshot,
} from "@/lib/upload/xhr-upload";

type Props = {
  progress: UploadProgressSnapshot;
  fileName?: string | null;
  theme?: "light" | "dark";
};

const PHASE_COPY: Record<
  UploadProgressSnapshot["phase"],
  { label: string; sub: string }
> = {
  preparing: { label: "Preparing upload", sub: "Getting your files ready…" },
  uploading: { label: "Uploading", sub: "Sending your resource securely…" },
  processing: { label: "Publishing", sub: "Saving metadata and generating preview…" },
  complete: { label: "Complete", sub: "Redirecting to your materials…" },
  error: { label: "Upload failed", sub: "Please try again." },
};

export function PublishUploadProgress({ progress, fileName, theme = "light" }: Props) {
  const dark = theme === "dark";
  const copy = PHASE_COPY[progress.phase];
  const spring = useSpring(progress.percent, { stiffness: 120, damping: 22, mass: 0.8 });
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    spring.set(progress.percent);
  }, [progress.percent, spring]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplayPercent(Math.round(v)));
  }, [spring]);

  const ringCircumference = 2 * Math.PI * 42;
  const ringOffset = ringCircumference - (displayPercent / 100) * ringCircumference;

  const showTransfer =
    progress.phase === "uploading" || progress.phase === "preparing";
  const ratio =
    progress.totalBytes > 0
      ? Math.min(1, progress.loadedBytes / progress.totalBytes)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border ${
        dark ? "border-white/10 bg-[#0D1B2A]/60" : "border-[#D4AF37]/25 bg-gradient-to-br from-[#FFFBF0] to-white"
      }`}
    >
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div
          className={`pointer-events-none absolute inset-0 opacity-40 ${
            progress.phase === "uploading" ? "animate-[publish-shimmer_2s_linear_infinite]" : ""
          }`}
          style={{
            background:
              "linear-gradient(110deg, transparent 25%, rgba(212,175,55,0.12) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
          }}
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.08)"}
                strokeWidth="6"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {progress.phase === "complete" ? (
                <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
              ) : progress.phase === "processing" ? (
                <Server className="h-7 w-7 text-[#D4AF37] animate-pulse" />
              ) : (
                <>
                  <CloudUpload className="h-6 w-6 text-[#D4AF37] mb-0.5" />
                  <span className={`text-lg font-bold tabular-nums ${dark ? "text-white" : "text-[#0D1B2A]"}`}>
                    {displayPercent}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              {progress.phase !== "complete" && progress.phase !== "error" && (
                <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
              )}
              <p className={`font-semibold ${dark ? "text-white" : "text-[#0D1B2A]"}`}>{copy.label}</p>
            </div>
            <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{copy.sub}</p>
            {fileName && (
              <p className={`mt-2 truncate text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
                {fileName}
              </p>
            )}

            {showTransfer && progress.totalBytes > 0 && (
              <div className={`mt-3 grid grid-cols-3 gap-2 text-center sm:text-left text-[11px] sm:grid-cols-3`}>
                <div>
                  <p className={dark ? "text-gray-500" : "text-gray-400"}>Transferred</p>
                  <p className={`font-semibold tabular-nums ${dark ? "text-white" : "text-[#0D1B2A]"}`}>
                    {formatUploadBytes(progress.loadedBytes)} / {formatUploadBytes(progress.totalBytes)}
                  </p>
                </div>
                <div>
                  <p className={dark ? "text-gray-500" : "text-gray-400"}>Speed</p>
                  <p className={`font-semibold tabular-nums ${dark ? "text-white" : "text-[#0D1B2A]"}`}>
                    {formatUploadSpeed(progress.bytesPerSecond)}
                  </p>
                </div>
                <div>
                  <p className={dark ? "text-gray-500" : "text-gray-400"}>ETA</p>
                  <p className={`font-semibold tabular-nums ${dark ? "text-white" : "text-[#0D1B2A]"}`}>
                    {formatUploadEta(progress.etaSeconds)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-5 h-2 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-gray-200/80"}`}>
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-[#B8941F] via-[#D4AF37] to-[#F5D76E]"
            style={{ width: `${Math.max(2, progress.percent)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        {showTransfer && (
          <p className={`mt-2 text-right text-[10px] tabular-nums ${dark ? "text-gray-500" : "text-gray-400"}`}>
            {Math.round(ratio * 100)}% of payload sent
          </p>
        )}
      </div>
    </motion.div>
  );
}
