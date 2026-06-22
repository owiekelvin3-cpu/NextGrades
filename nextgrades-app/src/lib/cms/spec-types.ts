/** Spec-aligned CMS entity types (blog, site settings). */

export interface SiteSettings {
  id: string;
  settings_key?: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_linkedin: string | null;
  social_whatsapp: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  updated_at: string;
}

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  url: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  thumbnail_url?: string | null;
  created_at: string;
}
