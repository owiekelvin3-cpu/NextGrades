import type { PlanKey } from "@/lib/stripe/prices";
import { getPlanCheckoutSpec, normalizeCheckoutPlanId } from "@/lib/stripe/plan-catalog";

export type CheckoutPlanId = PlanKey | "library" | "matura";

/** Map pricing UI plan id to Stripe plan key. */
export function toStripePlanId(planId: string): PlanKey {
  return normalizeCheckoutPlanId(planId);
}

export function isOneTimeCheckoutPlan(planId: string): boolean {
  return getPlanCheckoutSpec(planId).mode === "payment";
}

export function buildCheckoutQuery(params: {
  plan?: string;
  billing?: string;
  subject?: string;
  grade?: string;
  semester?: string;
  from?: string;
}): string {
  const q = new URLSearchParams();
  if (params.plan) q.set("plan", params.plan);
  if (params.billing) q.set("billing", params.billing);
  if (params.subject) q.set("subject", params.subject);
  if (params.grade) q.set("grade", params.grade);
  if (params.semester) q.set("semester", params.semester);
  if (params.from) q.set("from", params.from);
  return q.toString();
}

export const CHECKOUT_PATH = "/checkout";

export function planCheckoutHref(planId: CheckoutPlanId, billing: "monthly" | "yearly" | "semester" = "monthly"): string {
  const normalized = planId === "library" ? "library" : planId;
  return `${CHECKOUT_PATH}?${buildCheckoutQuery({ plan: normalized, billing })}`;
}

/** Book consultation / intro — group tutoring checkout. */
export function consultationCheckoutHref(): string {
  return planCheckoutHref("group", "monthly");
}

/** Book 1:1 tutoring for a subject. */
export function tutoringCheckoutHref(subjectId: string): string {
  return `${CHECKOUT_PATH}?${buildCheckoutQuery({
    plan: "premium",
    billing: "monthly",
    subject: subjectId,
    from: "subjects",
  })}`;
}

export type StartPlanCheckoutInput = {
  planId: string;
  billing?: "monthly" | "yearly" | "semester";
  subjectSlug?: string;
  grade?: string;
  semester?: string;
  isLoggedIn?: boolean;
};

export type StartPlanCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; fallbackHref: string };

/** Create a Stripe Checkout session and return the hosted payment URL. */
export async function startPlanCheckout(input: StartPlanCheckoutInput): Promise<StartPlanCheckoutResult> {
  const billing = input.billing ?? getPlanCheckoutSpec(input.planId).accessBilling;
  const uiPlan = input.planId === "resource" ? "library" : input.planId;
  const productType = isOneTimeCheckoutPlan(uiPlan) ? "payment" : "subscription";

  const payload = {
    planId: uiPlan,
    billing,
    productType,
    subjectSlug: input.subjectSlug || undefined,
    grade: input.grade || undefined,
    semester: input.semester || undefined,
  };

  const endpoint = input.isLoggedIn ? "/api/stripe/checkout-session" : "/api/stripe/guest-checkout-session";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  let data: { url?: string; error?: string } = {};
  try {
    data = (await res.json()) as { url?: string; error?: string };
  } catch {
    data = {};
  }

  if (res.ok && data.url) {
    return { ok: true, url: data.url };
  }

  return {
    ok: false,
    error: data.error || "Checkout failed",
    fallbackHref: planCheckoutHref(uiPlan as CheckoutPlanId, billing),
  };
}
