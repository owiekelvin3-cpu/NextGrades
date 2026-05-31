/** Run work after first paint — falls back to a short timeout when idle API is unavailable. */
export function runWhenIdle(fn: () => void, timeoutMs = 2500): () => void {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }

  const t = window.setTimeout(fn, Math.min(timeoutMs, 800));
  return () => window.clearTimeout(t);
}
