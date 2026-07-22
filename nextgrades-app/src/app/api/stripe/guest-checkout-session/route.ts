import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { resolveCheckoutStripePrice } from "@/lib/stripe/prices";
import { getAppUrl } from "@/lib/app-url";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { resolveCheckoutCatalogContext, toStripePlanId } from "@/lib/checkout/catalog-context";

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
      billing,
      subjectSlug,
      grade,
      semester,
      customerEmail,
    } = body as {
      planId?: string;
      billing?: string;
      subjectSlug?: string;
      grade?: string;
      semester?: string;
      customerEmail?: string;
    };

    const planId = toStripePlanId(rawPlanId ?? "library");
    const resolution = resolveCheckoutStripePrice({ planId, billing });

    if (!resolution.ok) {
      const message =
        resolution.reason === "unconfigured"
          ? "Stripe price not configured for this plan."
          : "Invalid checkout plan.";
      const status = resolution.reason === "unconfigured" ? 503 : 400;
      return NextResponse.json({ error: message }, { status });
    }

    const catalog = await resolveCheckoutCatalogContext({ subjectSlug, grade, semester });
    const { priceId, plan, billing: resolvedBilling } = resolution;
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      customer_email: customerEmail?.trim() || undefined,
      subscription_data: {
        metadata: {
          guestCheckout: "true",
          planId: plan,
          billing: resolvedBilling,
          subjectId: catalog.subjectId ?? "",
          classId: catalog.classId ?? "",
          semester: semester ? String(semester) : "",
        },
      },
      success_url: `${appUrl}/checkout/account-setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?${new URLSearchParams({
        plan: rawPlanId === "library" ? "library" : plan,
        billing: resolvedBilling,
        ...(subjectSlug ? { subject: subjectSlug } : {}),
        ...(grade ? { grade } : {}),
        ...(semester ? { semester } : {}),
      }).toString()}`,
      metadata: {
        guestCheckout: "true",
        productType: "subscription",
        planId: plan,
        billing: resolvedBilling,
        subjectSlug: catalog.subjectSlug ?? subjectSlug ?? "",
        subjectId: catalog.subjectId ?? "",
        classId: catalog.classId ?? "",
        semester: semester ? String(semester) : "",
        courseName: catalog.subjectName ?? subjectSlug ?? "Lernbibliothek",
        subjectName: catalog.subjectName ?? "",
        className: catalog.className ?? "",
        grade: grade ?? "",
        planName: plan === "resource" ? "Lernbibliothek" : plan,
        billingCycle: resolvedBilling === "yearly" ? "Yearly" : "Monthly",
        stripePriceId: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Guest Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
