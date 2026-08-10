import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { clampClassLevel } from "@/lib/catalog/classes";
import { normalizeSubjectKey } from "@/lib/marketing-images";

export type CheckoutCatalogContext = {
  subjectSlug: string;
  grade: string;
  semester: string;
  subjectId: string;
  classId: string;
  subjectName: string;
  className: string;
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

/** Resolve subject + grade slugs to catalog UUIDs for Stripe metadata. */
export async function resolveCheckoutCatalogContext(input: {
  subjectSlug?: string | null;
  grade?: string | null;
  semester?: string | null;
}): Promise<Partial<CheckoutCatalogContext>> {
  const subjectSlug = input.subjectSlug?.trim() || "";
  const grade = input.grade?.trim() || "";
  const semester = input.semester?.trim() || "";
  if (!subjectSlug) {
    return { subjectSlug, grade, semester };
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return { subjectSlug, grade, semester };
  }

  const admin = createAdminClient();
  const normalized = normalizeSubjectKey(subjectSlug);

  const withSlug = await admin
    .from("subjects")
    .select("id, name, slug")
    .eq("is_active", true);

  let subjectRow: { id: string; name: string; slug?: string | null } | null = null;

  if (!withSlug.error && withSlug.data?.length) {
    subjectRow =
      withSlug.data.find((row) => {
        const slug = row.slug ? slugify(row.slug) : slugify(row.name);
        return slug === subjectSlug || slug === normalized || slugify(row.name) === subjectSlug;
      }) ?? null;
  }

  if (!subjectRow) {
    const byName = await admin
      .from("subjects")
      .select("id, name")
      .eq("is_active", true)
      .ilike("name", subjectSlug.replace(/-/g, " "))
      .maybeSingle();
    if (byName.data) subjectRow = byName.data;
  }

  let classId = "";
  let className = "";
  const gradeLevel = clampClassLevel(parseInt(grade, 10));
  if (gradeLevel != null) {
    const { data: classRow } = await admin
      .from("classes")
      .select("id, name, level")
      .eq("level", gradeLevel)
      .maybeSingle();
    if (classRow) {
      classId = classRow.id;
      className = classRow.name;
    }
  }

  return {
    subjectSlug,
    grade,
    semester,
    subjectId: subjectRow?.id ?? "",
    classId,
    subjectName: subjectRow?.name ?? subjectSlug,
    className,
  };
}

export {
  toStripePlanId,
  isOneTimeCheckoutPlan,
  buildCheckoutQuery,
  CHECKOUT_PATH,
  planCheckoutHref,
  consultationCheckoutHref,
  tutoringCheckoutHref,
  startPlanCheckout,
} from "@/lib/checkout/start-plan-checkout";

export type {
  CheckoutPlanId,
  StartPlanCheckoutInput,
  StartPlanCheckoutResult,
} from "@/lib/checkout/start-plan-checkout";
