import type { CmsOverrideMap } from "./types";

let previewOverrides: CmsOverrideMap | null = null;
const listeners = new Set<() => void>();

/** Draft overrides pushed from the CMS admin into the preview iframe. */
export function setPreviewOverrides(map: CmsOverrideMap | null) {
  previewOverrides = map;
  for (const listener of listeners) {
    listener();
  }
}

export function getPreviewOverrides(): CmsOverrideMap | null {
  return previewOverrides;
}

export function subscribePreviewOverrides(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isCmsPreviewFrame(): boolean {
  return typeof window !== "undefined" && window.self !== window.top;
}
