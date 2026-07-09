import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateSubscriptionEndDate,
  parseBilling,
  parsePlanId,
  type SubscriptionBilling,
  type SubscriptionPlanId,
} from "@/lib/subscriptions/types";

export type ProvisionSubscriptionInput = {
  userId: string;
  planId: SubscriptionPlanId | string | null | undefined;
  billing: SubscriptionBilling | string | null | undefined;
  subjectId?: string | null;
  classId?: string | null;
  semester?: number | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStartsAt?: Date | string | null;
  subscriptionEndsAt?: Date | string | null;
};

function toIso(value: Date | string | null | undefined, fallback: Date): string {
  if (!value) return fallback.toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
}

/** Apply paid plan access to a user profile (+ enrollment for library subject). */
export async function provisionUserSubscription(
  admin: SupabaseClient,
  input: ProvisionSubscriptionInput
): Promise<{ startsAt: string; endsAt: string; planId: SubscriptionPlanId }> {
  const planId = parsePlanId(input.planId);
  const billing = parseBilling(input.billing);
  const startsAt = input.subscriptionStartsAt ? new Date(toIso(input.subscriptionStartsAt, new Date())) : new Date();
  const endsAt = input.subscriptionEndsAt
    ? new Date(toIso(input.subscriptionEndsAt, calculateSubscriptionEndDate(billing, startsAt)))
    : calculateSubscriptionEndDate(billing, startsAt);

  const profileUpdate: Record<string, unknown> = {
    subscription_status: "active",
    subscription_plan: planId,
    subscription_billing: billing,
    subscription_starts_at: startsAt.toISOString(),
    subscription_ends_at: endsAt.toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (input.stripeCustomerId) {
    profileUpdate.stripe_customer_id = input.stripeCustomerId;
  }

  const { error: profileError } = await admin.from("profiles").update(profileUpdate).eq("id", input.userId);
  if (profileError) throw profileError;

  const subjectId = input.subjectId?.trim() || "";
  const classId = input.classId?.trim() || "";

  if (planId === "resource" && subjectId && classId) {
    const semester =
      input.semester === 1 || input.semester === 2 ? input.semester : null;

    const { data: existing } = await admin
      .from("enrollments")
      .select("id")
      .eq("student_id", input.userId)
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .maybeSingle();

    const enrollmentPayload = {
      status: "active",
      semester,
      start_date: startsAt.toISOString(),
      end_date: endsAt.toISOString(),
    };

    if (existing?.id) {
      await admin.from("enrollments").update(enrollmentPayload).eq("id", existing.id);
    } else {
      await admin.from("enrollments").insert({
        student_id: input.userId,
        subject_id: subjectId,
        class_id: classId,
        ...enrollmentPayload,
      });
    }
  }

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    planId,
  };
}
