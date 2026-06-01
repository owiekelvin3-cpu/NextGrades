import { createServerReadClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export type PageSeo = {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterImage?: string;
};

export async function fetchPageSeo(pageName: string): Promise<PageSeo | null> {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { data } = await db.from("cms_seo").select("*").eq("page_name", pageName).maybeSingle();
    if (!data) return null;
    return {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      keywords: data.keywords ?? undefined,
      ogTitle: data.og_title ?? data.title ?? undefined,
      ogDescription: data.og_description ?? data.description ?? undefined,
      ogImage: data.og_image_url ?? undefined,
      twitterImage: data.twitter_image_url ?? data.og_image_url ?? undefined,
    };
  } catch {
    return null;
  }
}

export function buildPageMetadata(seo: PageSeo | null, fallback: Metadata): Metadata {
  if (!seo) return fallback;
  return {
    ...fallback,
    title: seo.title ?? fallback.title,
    description: seo.description ?? fallback.description,
    keywords: seo.keywords?.split(",").map((k) => k.trim()),
    openGraph: {
      ...(typeof fallback.openGraph === "object" ? fallback.openGraph : {}),
      title: seo.ogTitle ?? seo.title ?? undefined,
      description: seo.ogDescription ?? seo.description ?? undefined,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      ...(typeof fallback.twitter === "object" ? fallback.twitter : {}),
      title: seo.ogTitle ?? seo.title ?? undefined,
      description: seo.ogDescription ?? seo.description ?? undefined,
      images: seo.twitterImage ? [seo.twitterImage] : undefined,
    },
  };
}
