export type UploadPhase = "preparing" | "uploading" | "processing" | "complete" | "error";

export type UploadProgressSnapshot = {
  phase: UploadPhase;
  /** Smoothed 0–100 for UI */
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  bytesPerSecond: number;
  etaSeconds: number | null;
};

export type XhrUploadResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
};

function estimateFormDataBytes(formData: FormData): number {
  let total = 48_000;
  for (const [, value] of formData.entries()) {
    if (value instanceof File) total += value.size;
    else if (typeof value === "string") total += value.length * 2;
  }
  return total;
}

/** POST FormData with real upload progress (bytes sent over the wire). */
export function xhrUploadJson<T = unknown>(
  url: string,
  formData: FormData,
  onProgress: (snapshot: UploadProgressSnapshot) => void
): Promise<XhrUploadResult<T>> {
  const estimatedTotal = estimateFormDataBytes(formData);
  let lastLoaded = 0;
  let lastTime = performance.now();
  let speed = 0;

  const emit = (partial: Partial<UploadProgressSnapshot>) => {
    onProgress({
      phase: "uploading",
      percent: 0,
      loadedBytes: 0,
      totalBytes: estimatedTotal,
      bytesPerSecond: speed,
      etaSeconds: null,
      ...partial,
    });
  };

  emit({ phase: "preparing", percent: 2, totalBytes: estimatedTotal });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    xhr.upload.addEventListener("progress", (event) => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      const total = event.lengthComputable ? event.total : estimatedTotal;
      const loaded = event.loaded;

      if (dt > 0.08) {
        const instant = (loaded - lastLoaded) / dt;
        speed = speed > 0 ? speed * 0.65 + instant * 0.35 : instant;
        lastLoaded = loaded;
        lastTime = now;
      }

      const raw = total > 0 ? loaded / total : 0;
      const uploadPercent = 5 + raw * 83;
      const remaining = total - loaded;
      const eta = speed > 800 ? remaining / speed : null;

      emit({
        phase: "uploading",
        percent: Math.min(88, Math.round(uploadPercent)),
        loadedBytes: loaded,
        totalBytes: total,
        bytesPerSecond: speed,
        etaSeconds: eta,
      });
    });

    xhr.addEventListener("load", () => {
      emit({ phase: "processing", percent: 92, loadedBytes: estimatedTotal, totalBytes: estimatedTotal, bytesPerSecond: 0, etaSeconds: null });

      let data: T;
      try {
        data = (xhr.response ?? {}) as T;
      } catch {
        data = {} as T;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        emit({ phase: "complete", percent: 100, loadedBytes: estimatedTotal, totalBytes: estimatedTotal, bytesPerSecond: 0, etaSeconds: null });
        resolve({ ok: true, status: xhr.status, data });
      } else {
        emit({ phase: "error", percent: 0, bytesPerSecond: 0, etaSeconds: null });
        resolve({ ok: false, status: xhr.status, data });
      }
    });

    xhr.addEventListener("error", () => {
      emit({ phase: "error", percent: 0, bytesPerSecond: 0, etaSeconds: null });
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.send(formData);
  });
}

export function formatUploadBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatUploadSpeed(bps: number): string {
  if (bps <= 0) return "—";
  return `${formatUploadBytes(bps)}/s`;
}

export function formatUploadEta(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "Calculating…";
  if (seconds < 60) return `${Math.max(1, Math.ceil(seconds))}s remaining`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `${m}m ${s}s remaining`;
}
