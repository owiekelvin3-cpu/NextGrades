import type { SupabaseClient } from "@supabase/supabase-js";
import { storagePathFromLegacyUrl } from "@/lib/catalog/subjects";
import type { AppRole } from "@/lib/auth/roles";

export type MaterialAccessRow = {
  id: string;
  url?: string | null;
  storage_path?: string | null;
  access_type?: string | null;
  is_premium?: boolean | null;
  subject_id?: string | null;
  class_id?: string | null;
  class_ids?: string[] | null;
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
  grantedMaterialIds: string[];
};

export function isMaterialGrantActive(expiresAt?: string | null): boolean {
  if (!expiresAt) return true;
  const ends = Date.parse(expiresAt);
  return Number.isFinite(ends) && ends > Date.now();
}

export function isPremiumMaterial(material: Pick<MaterialAccessRow, "access_type" | "is_premium">): boolean {
  return material.access_type === "premium" || material.is_premium === true;
}

export function enrollmentMatchesMaterial(
  enrollment: EnrollmentRow,
  material: Pick<MaterialAccessRow, "subject_id" | "class_id" | "class_ids" | "semester">
): boolean {
  if (enrollment.status !== "active") return false;
  if (!material.subject_id || enrollment.subject_id !== material.subject_id) return false;
  const classIds = [
    ...(Array.isArray(material.class_ids) ? material.class_ids : []),
    material.class_id,
  ].filter((id): id is string => Boolean(id));
  if (classIds.length > 0 && !classIds.includes(enrollment.class_id)) return false;
  if (material.semester != null && enrollment.semester != null && enrollment.semester !== material.semester) {
    return false;
  }
  return true;
}

export function isAssignedStudentMaterial(material: MaterialAccessRow, ctx: AccessContext): boolean {
  if (ctx.role === "admin") return true;
  if (!ctx.userId) return false;
  if (material.created_by && ctx.userId === material.created_by) return true;
  if (ctx.grantedMaterialIds?.includes(material.id)) return true;
  return ctx.enrollments.some((e) => enrollmentMatchesMaterial(e, material));
}

export function canAccessMaterial(material: MaterialAccessRow, ctx: AccessContext): boolean {
  if (ctx.role === "admin") return true;
  if (ctx.userId && material.created_by && ctx.userId === material.created_by) return true;

  if (!isPremiumMaterial(material)) return true;

  if (!ctx.userId) return false;
  if (ctx.grantedMaterialIds?.includes(material.id)) return true;

  return ctx.enrollments.some((e) => enrollmentMatchesMaterial(e, material));
}

export async function loadAccessContext(
  db: SupabaseClient,
  userId: string | null,
  role: AppRole | null
): Promise<AccessContext> {
  if (!userId) {
    return { userId: null, role, subscriptionStatus: null, subscriptionEndsAt: null, enrollments: [], grantedMaterialIds: [] };
  }

  const [{ data: profile }, { data: enrollments }, { data: grants }] = await Promise.all([
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
    db
      .from("material_grants")
      .select("material_id, expires_at, status")
      .eq("student_id", userId)
      .eq("status", "active"),
  ]);

  const grantedMaterialIds = ((grants ?? []) as { material_id: string; expires_at: string | null; status: string }[])
    .filter((g) => isMaterialGrantActive(g.expires_at))
    .map((g) => g.material_id);

  return {
    userId,
    role,
    subscriptionStatus: (profile as { subscription_status?: string } | null)?.subscription_status ?? null,
    subscriptionEndsAt: (profile as { subscription_ends_at?: string } | null)?.subscription_ends_at ?? null,
    enrollments: (enrollments ?? []) as EnrollmentRow[],
    grantedMaterialIds,
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
  material: MaterialAccessRow & { file_name?: string | null },
  options?: { expiresIn?: number; download?: boolean }
): Promise<string | null> {
  const expiresIn = options?.expiresIn ?? 3600;
  const storagePath =
    material.storage_path?.trim() || storagePathFromLegacyUrl(material.url) || null;

  if (storagePath) {
    const downloadName = options?.download ? material.file_name?.trim() || "download" : undefined;
    const { data, error } = await admin.storage.from("resources").createSignedUrl(
      storagePath,
      expiresIn,
      downloadName ? { download: downloadName } : undefined
    );
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  const url = material.url?.trim();
  if (url && url.startsWith("http")) return url;
  return null;
}
