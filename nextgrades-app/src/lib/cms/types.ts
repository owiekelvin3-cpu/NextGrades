import type { CmsFieldType } from "./flatten";

export type CmsLocale = "en" | "de";

export type CmsOverrideMap = Record<string, Partial<Record<CmsLocale, unknown>>>;

export type CmsContentRow = {
  id: string;
  section_id: string | null;
  i18n_key: string;
  field_key: string;
  field_name: string;
  field_type: CmsFieldType | string;
  content_value: string | null;
  content_json: { en?: unknown; de?: unknown } | null;
  sort_order: number;
  help_text?: string | null;
  placeholder?: string | null;
};

export type CmsSectionRow = {
  id: string;
  section_key: string;
  section_name: string;
  page_name: string;
  description: string | null;
  sort_order: number;
};

export type CmsTestimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
};

export type CmsFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
};

export type CmsTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_links: Record<string, string> | null;
  is_active: boolean;
  sort_order: number;
};

export type CmsSeo = {
  id: string;
  page_name: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image_url: string | null;
};
