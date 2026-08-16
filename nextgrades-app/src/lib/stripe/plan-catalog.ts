import type Stripe from "stripe";
import type { PlanKey } from "@/lib/stripe/prices";

/** Access window stored on the profile after a successful payment. */
export type PlanAccessBilling = "monthly" | "yearly" | "semester";

export type PlanCheckoutSpec = {
  plan: PlanKey;
  amountCents: number;
  currency: "eur";
  mode: "payment";
  productName: string;
  productDescription: string;
  accessBilling: PlanAccessBilling;
};

/**
 * Canonical checkout amounts — must match the public pricing page (DE).
 * Stripe Price IDs in env can drift; these amounts are the source of truth.
 */
const CATALOG: Record<PlanKey, Omit<PlanCheckoutSpec, "plan">> = {
  premium: {
    amountCents: 3900,
    currency: "eur",
    mode: "payment",
    productName: "1:1 Premium",
    productDescription: "39 € pro Stunde",
    accessBilling: "monthly",
  },
  group: {
    amountCents: 2900,
    currency: "eur",
    mode: "payment",
    productName: "Lerngruppe",
    productDescription: "29 € pro Stunde & SchülerIn",
    accessBilling: "monthly",
  },
  resource: {
    amountCents: 4900,
    currency: "eur",
    mode: "payment",
    productName: "Lernbibliothek",
    productDescription: "49 € pro Fach & Semester",
    accessBilling: "semester",
  },
  matura: {
    amountCents: 14900,
    currency: "eur",
    mode: "payment",
    productName: "Mathematik Matura Komplettpaket",
    productDescription: "149 € einmalig",
    accessBilling: "yearly",
  },
};

export function normalizeCheckoutPlanId(planId: string): PlanKey {
  if (planId === "library" || planId === "resource") return "resource";
  if (planId === "premium") return "premium";
  if (planId === "matura") return "matura";
  return "group";
}

export function getPlanCheckoutSpec(planId: string): PlanCheckoutSpec {
  const plan = normalizeCheckoutPlanId(planId);
  return { plan, ...CATALOG[plan] };
}

export function stripeCheckoutLineItem(
  spec: PlanCheckoutSpec
): Stripe.Checkout.SessionCreateParams.LineItem {
  return {
    quantity: 1,
    price_data: {
      currency: spec.currency,
      unit_amount: spec.amountCents,
      product_data: {
        name: spec.productName,
        description: spec.productDescription,
      },
    },
  };
}
