import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseBilling, parsePlanId, calculateSubscriptionEndDate } from "@/lib/subscriptions/types";

export type GuestPaymentRow = {
  stripe_session_id: string;
  status: string;
  plan_id: string | null;
  billing: string | null;
  subject_slug: string | null;
  subject_name: string | null;
  subject_id: string | null;
  class_id: string | null;
  grade: string | null;
  semester: string | null;
  amount_paid: number | null;
  currency: string | null;
  payment_email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
};

function stripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | Stripe.Subscription | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if ("deleted" in value && value.deleted) return null;
  return value.id ?? null;
}

function guestIdentityFromSession(session: Stripe.Checkout.Session): {
  first_name: string;
  last_name: string;
  email: string;
} {
  const paymentEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const email =
    paymentEmail?.trim() ||
    `guest+${session.id.replace(/^cs_/, "").slice(0, 24)}@checkout.pending.nextgrades.at`;

  return {
    first_name: "Pending",
    last_name: "Setup",
    email,
  };
}

export function guestPaymentFromStripeSession(session: Stripe.Checkout.Session): GuestPaymentRow & {
  first_name: string;
  last_name: string;
  email: string;
} {
  const metadata = session.metadata ?? {};
  const billing = parseBilling(metadata.billing);
  const startsAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);
  const endsAt = calculateSubscriptionEndDate(billing, startsAt);
  const amount = session.amount_total != null ? session.amount_total / 100 : null;
  const identity = guestIdentityFromSession(session);

  return {
    stripe_session_id: session.id,
    status: "payment_received",
    plan_id: parsePlanId(metadata.planId),
    billing,
    subject_slug: metadata.subjectSlug || null,
    subject_name: metadata.subjectName || metadata.courseName || null,
    subject_id: metadata.subjectId || null,
    class_id: metadata.classId || null,
    grade: metadata.grade || null,
    semester: metadata.semester || null,
    amount_paid: amount,
    currency: (session.currency || "eur").toUpperCase(),
    payment_email: session.customer_details?.email ?? session.customer_email ?? null,
    stripe_customer_id: stripeId(session.customer),
    stripe_subscription_id: stripeId(session.subscription),
    subscription_starts_at: startsAt.toISOString(),
    subscription_ends_at: endsAt.toISOString(),
    ...identity,
  };
}

/** Record or refresh guest payment after Stripe checkout (before account-setup form). */
export async function upsertGuestPaymentFromStripeSession(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
  options?: { subscriptionEndsAt?: Date | null }
): Promise<void> {
  const row = guestPaymentFromStripeSession(session);
  if (options?.subscriptionEndsAt) {
    row.subscription_ends_at = options.subscriptionEndsAt.toISOString();
  }

  const { data: existing } = await admin
    .from("guest_account_requests")
    .select("id, status, first_name")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing?.status === "fulfilled") return;

  const preserveDetails = existing?.first_name;

  if (existing) {
    const { error } = await admin
      .from("guest_account_requests")
      .update({
        ...row,
        status: preserveDetails && preserveDetails !== "Pending" ? "details_submitted" : row.status,
      })
      .eq("stripe_session_id", session.id);
    if (error) throw error;
    return;
  }

  const { error } = await admin.from("guest_account_requests").insert(row);
  if (error) throw error;
}
