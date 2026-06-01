import { cmsFetch } from "./cms-fetch";
import type { MergedCmsField } from "./merge-content";
import type { CmsSavePayload } from "./save-content";

export async function fetchCmsFields(): Promise<{ content: MergedCmsField[]; seeded: boolean }> {
  const res = await cmsFetch("/api/cms/bulk");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to load content");
  return { content: (data.content ?? []) as MergedCmsField[], seeded: Boolean(data.seeded) };
}

export async function seedCmsContent(): Promise<void> {
  const res = await cmsFetch("/api/cms/bulk?action=seed", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Setup failed");
}

export async function publishCmsFields(updates: CmsSavePayload[], mode: "draft" | "publish" = "publish") {
  const res = await cmsFetch("/api/cms/bulk", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates, mode }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
  return data as { count: number; mode: string };
}

export async function fetchPageLayout(pageName: string) {
  const res = await cmsFetch(`/api/cms/page-layout?page=${encodeURIComponent(pageName)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function savePageLayout(pageName: string, layout: unknown[]) {
  const res = await cmsFetch("/api/cms/page-layout", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page_name: pageName, layout }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Layout save failed");
  return data;
}
