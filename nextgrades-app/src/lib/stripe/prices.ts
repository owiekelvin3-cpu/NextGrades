export type PlanKey = "group" | "premium" | "resource" | "matura";
export type BillingKey = "monthly" | "yearly";

const APPROVED_PLANS: PlanKey[] = ["group", "premium", "resource", "matura"];

function readPriceEnvMap(): Record<PlanKey, Record<BillingKey, string | undefined>> {
  const maturaPrice = process.env.STRIPE_PRICE_MATURA?.trim();
  return {
    group: {
      monthly: process.env.STRIPE_PRICE_GROUP_MONTHLY,
      yearly: process.env.STRIPE_PRICE_GROUP_YEARLY,
    },
    premium: {
      monthly:
        process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim() ||
        process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY?.trim(),
      yearly:
        process.env.STRIPE_PRICE_PREMIUM_YEARLY?.trim() ||
        process.env.STRIPE_PRICE_INDIVIDUAL_YEARLY?.trim(),
    },
    resource: {
      monthly: process.env.STRIPE_PRICE_RESOURCE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_RESOURCE_YEARLY,
    },
    matura: {
      monthly: maturaPrice,
      yearly: maturaPrice,
    },
  };
}

/** All server-approved Stripe price IDs (from env). */
export function getApprovedStripePriceIds(): Set<string> {
  const ids = new Set<string>();
  const map = readPriceEnvMap();
  for (const plan of APPROVED_PLANS) {
    for (const bill of ["monthly", "yearly"] as BillingKey[]) {
      const id = map[plan][bill]?.trim();
      if (id) ids.add(id);
    }
  }
  return ids;
}

export function resolveStripePriceId(planId: string, billing: string): string | null {
  const plan = (APPROVED_PLANS.includes(planId as PlanKey) ? planId : "group") as PlanKey;
  const bill = billing === "yearly" ? "yearly" : "monthly";
  return readPriceEnvMap()[plan][bill]?.trim() ?? null;
}

export function isApprovedStripePriceId(priceId: string): boolean {
  return getApprovedStripePriceIds().has(priceId.trim());
}

export type StripePriceResolution =
  | { ok: true; priceId: string; plan: PlanKey; billing: BillingKey }
  | { ok: false; reason: "unknown_plan" | "unconfigured" | "client_price_rejected" | "price_mismatch" };

/**
 * Resolve checkout price exclusively from server mappings.
 * Client-supplied priceId is never trusted - only used to detect tampering.
 */
export function resolveCheckoutStripePrice(input: {
  planId?: string;
  billing?: string;
  clientPriceId?: string;
}): StripePriceResolution {
  const plan = (APPROVED_PLANS.includes((input.planId ?? "") as PlanKey)
    ? input.planId
    : "group") as PlanKey;
  const billing: BillingKey = input.billing === "yearly" ? "yearly" : "monthly";
  const serverPriceId = resolveStripePriceId(plan, billing);

  if (!serverPriceId) {
    return { ok: false, reason: "unconfigured" };
  }

  const clientPriceId = input.clientPriceId?.trim();
  if (clientPriceId) {
    if (!clientPriceId.startsWith("price_")) {
      return { ok: false, reason: "client_price_rejected" };
    }
    if (clientPriceId !== serverPriceId) {
      return { ok: false, reason: "price_mismatch" };
    }
    if (!isApprovedStripePriceId(clientPriceId)) {
      return { ok: false, reason: "client_price_rejected" };
    }
  }

  return { ok: true, priceId: serverPriceId, plan, billing };
}
