import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { getAppUrl } from "@/lib/app-url";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { resolveCheckoutCatalogContext } from "@/lib/checkout/catalog-context";
import { getPlanCheckoutSpec, stripeCheckoutLineItem } from "@/lib/stripe/plan-catalog";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "stripe:guest-checkout", limit: 10, windowSec: 3600 });
  if (limited) return limited;

  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const {
      planId: rawPlanId,
      subjectSlug,
      grade,
      semester,
      customerEmail,
    } = body as {
      planId?: string;
      subjectSlug?: string;
      grade?: string;
      semester?: string;
      customerEmail?: string;
    };

    const uiPlanId = rawPlanId ?? "library";
    const spec = getPlanCheckoutSpec(uiPlanId);
    const catalog = await resolveCheckoutCatalogContext({ subjectSlug, grade, semester });
    const appUrl = getAppUrl();
    const resolvedBilling = spec.accessBilling;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [stripeCheckoutLineItem(spec)],
      mode: spec.mode,
      customer_email: customerEmail?.trim() || undefined,
      success_url: `${appUrl}/checkout/account-setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?${new URLSearchParams({
        plan: uiPlanId === "resource" ? "library" : uiPlanId,
        billing: resolvedBilling,
        ...(subjectSlug ? { subject: subjectSlug } : {}),
        ...(grade ? { grade } : {}),
        ...(semester ? { semester } : {}),
      }).toString()}`,
      metadata: {
        guestCheckout: "true",
        productType: spec.mode === "payment" ? "payment" : "subscription",
        planId: spec.plan,
        billing: resolvedBilling,
        subjectSlug: catalog.subjectSlug ?? subjectSlug ?? "",
        subjectId: catalog.subjectId ?? "",
        classId: catalog.classId ?? "",
        semester: semester ? String(semester) : "",
        courseName: catalog.subjectName ?? subjectSlug ?? spec.productName,
        subjectName: catalog.subjectName ?? "",
        className: catalog.className ?? "",
        grade: grade ?? "",
        planName: spec.productName,
        billingCycle: spec.productDescription,
        stripeAmountCents: String(spec.amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Guest Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
