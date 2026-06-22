import { cmsFetch } from "@/lib/cms/cms-fetch";
import type { BlogPost, SiteSettings } from "@/lib/cms/spec-types";

async function parseMutation<T>(res: Response, label: string): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Failed to ${label}`);
  }
  return data as T;
}

export async function createBlogPost(
  post: Partial<BlogPost> & { title: string; slug: string }
): Promise<BlogPost> {
  const res = await cmsFetch("/api/cms/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  return parseMutation(res, "create blog post");
}

export async function updateBlogPost(id: string, patch: Partial<BlogPost>): Promise<BlogPost> {
  const res = await cmsFetch("/api/cms/blog", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...patch }),
  });
  return parseMutation(res, "save blog post");
}

export async function deleteBlogPost(id: string): Promise<void> {
  const res = await cmsFetch("/api/cms/blog", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  await parseMutation(res, "delete blog post");
}

export async function upsertSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await cmsFetch("/api/cms/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return parseMutation(res, "save site settings");
}

export async function reorderItems(table: string, orderedIds: string[]): Promise<void> {
  const res = await cmsFetch("/api/cms/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorder", table, orderedIds }),
  });
  await parseMutation(res, "reorder items");
}
