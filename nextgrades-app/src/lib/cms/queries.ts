import { cmsFetch } from "@/lib/cms/cms-fetch";
import type { BlogPost, SiteSettings } from "@/lib/cms/spec-types";

async function parseJson<T>(res: Response, label: string): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Failed to load ${label}`);
  }
  return data as T;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await cmsFetch("/api/cms/blog");
  return parseJson(res, "blog posts");
}

export async function getBlogPost(id: string): Promise<BlogPost> {
  const res = await cmsFetch(`/api/cms/blog?id=${encodeURIComponent(id)}`);
  return parseJson(res, "blog post");
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const res = await cmsFetch("/api/cms/site-settings");
  return parseJson(res, "site settings");
}
