import type { SupabaseClient } from "@supabase/supabase-js";
import { storagePathFromLegacyUrl } from "@/lib/catalog/subjects";
import type { AppRole } from "@/lib/auth/roles";
import { isSubscriptionCurrentlyActive } from "@/lib/subscriptions/types";

export type MaterialAccessRow = {
  id: string;
  url?: string | null;
  storage_path?: string | null;
  access_type?: string | null;
  is_premium?: boolean | null;
  subject_id?: string | null;
  class_id?: string | null;
  semester?: number | null;
  created_by?: string | null;
};

export type EnrollmentRow = {
  subject_id: string;
  class_id: string;
  semester: number | null;
  status: string;
};

export type AccessContext = {
  userId: string | null;
  role: AppRole | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
  enrollments: EnrollmentRow[];
};

export function isPremiumMaterial(material: Pick<MaterialAccessRow, "access_type" | "is_premium">): boolean {
  return material.access_type === "premium" || material.is_premium === true;
}

export function enrollmentMatchesMaterial(
  enrollment: EnrollmentRow,
  material: Pick<MaterialAccessRow, "subject_id" | "class_id" | "semester">
): boolean {
  if (enrollment.status !== "active") return false;
  if (!material.subject_id || enrollment.subject_id !== material.subject_id) return false;
  if (material.class_id && enrollment.class_id !== material.class_id) return false;
  if (material.semester != null && enrollment.semester != null && enrollment.semester !== material.semester) {
    return false;
  }
  return true;
}

export function canAccessMaterial(material: MaterialAccessRow, ctx: AccessContext): boolean {
  if (ctx.role === "admin") return true;
  if (ctx.userId && material.created_by && ctx.userId === material.created_by) return true;

  if (!isPremiumMaterial(material)) return true;

  if (!ctx.userId) return false;
  if (
    isSubscriptionCurrentlyActive({
      subscription_status: ctx.subscriptionStatus,
      subscription_ends_at: ctx.subscriptionEndsAt,
    })
  ) {
    return true;
  }

  return ctx.enrollments.some((e) => enrollmentMatchesMaterial(e, material));
}

export async function loadAccessContext(
  db: SupabaseClient,
  userId: string | null,
  role: AppRole | null
): Promise<AccessContext> {
  if (!userId) {
    return { userId: null, role, subscriptionStatus: null, subscriptionEndsAt: null, enrollments: [] };
  }

  const [{ data: profile }, { data: enrollments }] = await Promise.all([
    db
      .from("profiles")
      .select("subscription_status, subscription_ends_at")
      .eq("id", userId)
      .maybeSingle(),
    role === "student" || role === null
      ? db
          .from("enrollments")
          .select("subject_id, class_id, semester, status")
          .eq("student_id", userId)
          .eq("status", "active")
      : Promise.resolve({ data: [] as EnrollmentRow[] }),
  ]);

  return {
    userId,
    role,
    subscriptionStatus: (profile as { subscription_status?: string } | null)?.subscription_status ?? null,
    subscriptionEndsAt: (profile as { subscription_ends_at?: string } | null)?.subscription_ends_at ?? null,
    enrollments: (enrollments ?? []) as EnrollmentRow[],
  };
}

export function sanitizePublicMaterial<T extends MaterialAccessRow & Record<string, unknown>>(
  material: T,
  ctx: AccessContext
): T & { canAccess: boolean; locked: boolean; url?: string | null } {
  const entitled = canAccessMaterial(material, ctx);
  const premium = isPremiumMaterial(material);
  const sanitized = { ...material, canAccess: entitled, locked: premium && !entitled };

  if (!entitled) {
    delete sanitized.url;
    delete sanitized.storage_path;
  }

  return sanitized;
}

export async function resolveMaterialDownloadUrl(
  admin: SupabaseClient,
  material: MaterialAccessRow,
  expiresIn = 3600
): Promise<string | null> {
  const storagePath =
    material.storage_path?.trim() || storagePathFromLegacyUrl(material.url) || null;

  if (storagePath) {
    const { data, error } = await admin.storage
      .from("resources")
      .createSignedUrl(storagePath, expiresIn);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  const url = material.url?.trim();
  if (url && url.startsWith("http")) return url;
  return null;
}
