export type SubscriptionPlanId = "resource" | "group" | "premium";
export type SubscriptionBilling = "monthly" | "yearly";

export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlanId, string> = {
  resource: "Lernbibliothek",
  group: "Lerngruppe",
  premium: "1:1 Premium",
};

export function parseBilling(raw?: string | null): SubscriptionBilling {
  return raw === "yearly" ? "yearly" : "monthly";
}

export function parsePlanId(raw?: string | null): SubscriptionPlanId {
  if (raw === "premium") return "premium";
  if (raw === "group") return "group";
  if (raw === "library") return "resource";
  return "resource";
}

/** Subscription end date from billing cycle and start date. */
export function calculateSubscriptionEndDate(
  billing: SubscriptionBilling,
  from: Date = new Date()
): Date {
  const end = new Date(from);
  if (billing === "yearly") {
    end.setUTCFullYear(end.getUTCFullYear() + 1);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }
  return end;
}

export function isSubscriptionCurrentlyActive(profile: {
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
}): boolean {
  const status = profile.subscription_status;
  if (status !== "active" && status !== "trialing") return false;
  if (!profile.subscription_ends_at) return true;
  return new Date(profile.subscription_ends_at).getTime() > Date.now();
}

export function formatPlanLabel(planId?: string | null, billing?: string | null): string {
  const plan = parsePlanId(planId);
  const bill = parseBilling(billing);
  const planName = SUBSCRIPTION_PLAN_LABELS[plan];
  return `${planName} (${bill === "yearly" ? "Jährlich" : "Monatlich"})`;
}
