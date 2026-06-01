/** Run work after first paint when the browser is idle. */
export function runWhenIdle(fn: () => void, timeoutMs = 2500): () => void {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(fn, Math.min(timeoutMs, 1200));
  return () => window.clearTimeout(id);
}
