import { supabase } from "@/lib/supabase/client";
import {
  fetchSubjects,
  fetchMaterials,
  isSupabaseConfigured,
} from "@/lib/dashboard/data";

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  level: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  title: string;
  description: string | null;
  type: "pdf" | "video" | "excel" | "image" | "other";
  url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  subject_id: string | null;
  class_id: string | null;
  semester: number | null;
  is_premium: boolean;
  sort_order: number;
  view_count: number;
  download_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: "student" | "teacher" | "admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsSection {
  id: string;
  section_key: string;
  section_name: string;
  page_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsContent {
  id: string;
  section_id: string;
  field_key: string;
  field_name: string;
  field_type: string;
  content_value: string | null;
  content_json: unknown;
  media_id: string | null;
  is_required: boolean;
  placeholder: string | null;
  help_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CmsTestimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export class NextGradesAPI {
  static async getSubjects(): Promise<Subject[]> {
    try {
      return await fetchSubjects();
    } catch (error) {
      console.warn("Error fetching subjects:", error);
      return [];
    }
  }

  static async getClasses(): Promise<Class[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase.from("classes").select("*").order("level", { ascending: true });
      if (error) throw error;
      return (data || []) as Class[];
    } catch (error) {
      console.warn("Error fetching classes:", error);
      return [];
    }
  }

  static async getMaterials({
    subjectId,
    classId,
    semester,
    isPremium,
  }: {
    subjectId?: string;
    classId?: string;
    semester?: number;
    isPremium?: boolean;
  } = {}): Promise<Material[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from("materials").select("*").order("sort_order", { ascending: true });

      if (subjectId) query = query.eq("subject_id", subjectId);
      if (classId) query = query.eq("class_id", classId);
      if (semester !== undefined) query = query.eq("semester", semester);
      if (isPremium !== undefined) query = query.eq("is_premium", isPremium);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Material[];
    } catch (error) {
      console.warn("Error fetching materials:", error);
      return [];
    }
  }

  static async getCurrentProfile(): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) return null;

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    } catch (error) {
      console.warn("Error fetching profile:", error);
      return null;
    }
  }

  static async incrementMaterialView(materialId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const { data } = await supabase.from("materials").select("view_count").eq("id", materialId).maybeSingle();
      if (!data) return;
      await supabase
        .from("materials")
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq("id", materialId);
    } catch (error) {
      console.warn("Error incrementing view count:", error);
    }
  }

  static async incrementMaterialDownload(materialId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const { data } = await supabase.from("materials").select("download_count").eq("id", materialId).maybeSingle();
      if (!data) return;
      await supabase
        .from("materials")
        .update({ download_count: (data.download_count ?? 0) + 1 })
        .eq("id", materialId);
    } catch (error) {
      console.warn("Error incrementing download count:", error);
    }
  }

  static async getCmsSections(): Promise<CmsSection[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as CmsSection[];
    } catch (error) {
      console.warn("Error fetching CMS sections:", error);
      return [];
    }
  }

  static async getCmsContents(sectionId?: string): Promise<CmsContent[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from("cms_content").select("*").order("sort_order", { ascending: true });
      if (sectionId) query = query.eq("section_id", sectionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CmsContent[];
    } catch (error) {
      console.warn("Error fetching CMS contents:", error);
      return [];
    }
  }

  static async getCmsContentByKey(sectionKey: string, fieldKey: string): Promise<CmsContent | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: section } = await supabase
        .from("cms_sections")
        .select("id")
        .eq("section_key", sectionKey)
        .maybeSingle();

      if (!section) return null;

      const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .eq("section_id", section.id)
        .eq("field_key", fieldKey)
        .maybeSingle();

      if (error) throw error;
      return data as CmsContent | null;
    } catch (error) {
      console.warn("Error fetching CMS content by key:", error);
      return null;
    }
  }

  static async getTestimonials(): Promise<CmsTestimonial[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from("cms_testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as CmsTestimonial[];
    } catch (error) {
      console.warn("Error fetching testimonials:", error);
      return [];
    }
  }
}
