import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseBilling, parsePlanId } from "@/lib/subscriptions/types";

export type ProfileStripeRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  subscription_plan?: string | null;
};

function stripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | Stripe.Subscription | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if ("deleted" in value && value.deleted) return null;
  return value.id ?? null;
}

/** Resolve a profile from Stripe customer ID, falling back to customer email. */
export async function findProfileByStripeCustomer(
  admin: SupabaseClient,
  customerId: string,
  stripe: Stripe
): Promise<ProfileStripeRow | null> {
  const { data: byCustomer } = await admin
    .from("profiles")
    .select("id, full_name, email, subscription_plan")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (byCustomer) return byCustomer as ProfileStripeRow;

  const customer = await stripe.customers.retrieve(customerId);
  if ("deleted" in customer && customer.deleted) return null;
  const email = customer.email?.trim();
  if (!email) return null;

  const { data: byEmail } = await admin
    .from("profiles")
    .select("id, full_name, email, subscription_plan")
    .ilike("email", email)
    .maybeSingle();

  return (byEmail as ProfileStripeRow | null) ?? null;
}

function subscriptionIsActive(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

type SubscriptionItemPeriod = {
  current_period_end?: number | null;
  current_period_start?: number | null;
};

/** Stripe Basil+ moved billing periods onto subscription items. */
export function getSubscriptionPeriodBounds(subscription: Stripe.Subscription): {
  periodStart: Date;
  periodEnd: Date;
} | null {
  const item = subscription.items?.data?.[0] as SubscriptionItemPeriod | undefined;
  const periodEnd = item?.current_period_end ?? null;
  const periodStart = item?.current_period_start ?? null;

  if (periodEnd == null || periodStart == null) return null;

  return {
    periodStart: new Date(periodStart * 1000),
    periodEnd: new Date(periodEnd * 1000),
  };
}

/** Sync profile subscription dates and IDs from a Stripe subscription object. */
export async function syncProfileFromStripeSubscription(
  admin: SupabaseClient,
  profileId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = stripeId(subscription.customer);
  const period = getSubscriptionPeriodBounds(subscription);
  if (!period) return;

  const { periodStart, periodEnd } = period;
  const active = subscriptionIsActive(subscription.status);

  const metadataPlan = subscription.metadata?.planId;
  const metadataBilling = subscription.metadata?.billing;

  const update: Record<string, unknown> = {
    subscription_status: active ? "active" : "inactive",
    subscription_starts_at: periodStart.toISOString(),
    subscription_ends_at: periodEnd.toISOString(),
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  };

  if (customerId) update.stripe_customer_id = customerId;
  if (metadataPlan) update.subscription_plan = parsePlanId(metadataPlan);
  if (metadataBilling) update.subscription_billing = parseBilling(metadataBilling);

  await admin.from("profiles").update(update).eq("id", profileId);

  const planId = parsePlanId(metadataPlan);
  if (planId === "resource") {
    const subjectId = subscription.metadata?.subjectId?.trim();
    const classId = subscription.metadata?.classId?.trim();
    if (subjectId && classId) {
      const semesterRaw = subscription.metadata?.semester;
      const semester =
        semesterRaw === "1" || semesterRaw === "2" ? parseInt(semesterRaw, 10) : null;

      const { data: existing } = await admin
        .from("enrollments")
        .select("id")
        .eq("student_id", profileId)
        .eq("subject_id", subjectId)
        .eq("class_id", classId)
        .maybeSingle();

      const enrollmentPayload = {
        status: active ? "active" : "inactive",
        semester,
        start_date: periodStart.toISOString(),
        end_date: periodEnd.toISOString(),
      };

      if (existing?.id) {
        await admin.from("enrollments").update(enrollmentPayload).eq("id", existing.id);
      }
    }
  }
}

type InvoiceWithParent = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  parent?: {
    type?: string;
    subscription_details?: {
      subscription?: string | Stripe.Subscription | null;
    };
  };
};

/** Resolve subscription ID from invoices across Stripe API versions. */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as InvoiceWithParent;
  if (inv.parent?.type === "subscription_details") {
    const fromParent = stripeId(inv.parent.subscription_details?.subscription);
    if (fromParent) return fromParent;
  }
  return stripeId(inv.subscription);
}

/** Renew or sync access after a successful invoice payment. */
export async function renewSubscriptionFromInvoice(
  admin: SupabaseClient,
  stripe: Stripe,
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const customerId = stripeId(invoice.customer);
  if (!customerId) return;

  const profile = await findProfileByStripeCustomer(admin, customerId, stripe);
  if (!profile) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncProfileFromStripeSubscription(admin, profile.id, subscription);
}

/** Revoke access when a subscription ends. */
export async function revokeSubscriptionAccess(
  admin: SupabaseClient,
  profileId: string
): Promise<void> {
  await admin
    .from("profiles")
    .update({
      subscription_status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  await admin
    .from("enrollments")
    .update({ status: "inactive", end_date: new Date().toISOString() })
    .eq("student_id", profileId)
    .eq("status", "active");
}

/** Fetch subscription period end from Stripe when checkout completes. */
export async function fetchSubscriptionPeriodEnd(
  stripe: Stripe,
  subscriptionId: string | null | undefined
): Promise<Date | null> {
  if (!subscriptionId) return null;
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return getSubscriptionPeriodBounds(subscription)?.periodEnd ?? null;
  } catch {
    return null;
  }
}
