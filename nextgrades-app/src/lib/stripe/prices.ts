export type PlanKey = "group" | "premium" | "resource";
export type BillingKey = "monthly" | "yearly";

const PRICE_ENV_MAP: Record<PlanKey, Record<BillingKey, string | undefined>> = {
  group: {
    monthly: process.env.STRIPE_PRICE_GROUP_MONTHLY,
    yearly: process.env.STRIPE_PRICE_GROUP_YEARLY,
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY,
    yearly: process.env.STRIPE_PRICE_INDIVIDUAL_YEARLY,
  },
  resource: {
    monthly: process.env.STRIPE_PRICE_RESOURCE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_RESOURCE_YEARLY,
  },
};

export function resolveStripePriceId(planId: string, billing: string): string | null {
  const plan = (["group", "premium", "resource"].includes(planId) ? planId : "group") as PlanKey;
  const bill = billing === "yearly" ? "yearly" : "monthly";
  return PRICE_ENV_MAP[plan][bill] ?? null;
}
