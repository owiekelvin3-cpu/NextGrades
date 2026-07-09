import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { resolveCheckoutStripePrice } from "@/lib/stripe/prices";
import { logSecurityEvent } from "@/lib/auth/audit-log";
import { getAppUrl } from "@/lib/app-url";
import { resolveCheckoutCatalogContext } from "@/lib/checkout/catalog-context";

export async function POST(request: Request) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." }, { status: 503 });
    }

    const body = await request.json();
    const {
      priceId: rawPriceId,
      productType,
      planId,
      billing,
      subjectId,
      classId,
      semester,
      courseName,
      subjectSlug,
      grade,
    } = body;

    const resolution = resolveCheckoutStripePrice({
      planId,
      billing,
      clientPriceId: rawPriceId,
    });

    if (!resolution.ok) {
      void logSecurityEvent(
        {
          eventType: "suspicious_activity",
          success: false,
          userId: gate.auth!.profile!.id,
          metadata: {
            action: "stripe_checkout_invalid_price",
            reason: resolution.reason,
            planId: planId ?? null,
            billing: billing ?? null,
            clientPriceId: rawPriceId ?? null,
          },
        },
        request
      );

      const message =
        resolution.reason === "unconfigured"
          ? "Stripe price not configured for this plan. Set STRIPE_PRICE_* environment variables."
          : "Invalid checkout plan or price.";

      const status = resolution.reason === "unconfigured" ? 503 : 400;
      return NextResponse.json({ error: message }, { status });
    }

    const { priceId, plan, billing: resolvedBilling } = resolution;
    const userId = gate.auth!.profile!.id;
    const appUrl = getAppUrl();

    const catalog = await resolveCheckoutCatalogContext({
      subjectSlug: subjectSlug || courseName,
      grade,
      semester: semester ? String(semester) : undefined,
    });

    const resolvedSubjectId = subjectId || catalog.subjectId || "";
    const resolvedClassId = classId || catalog.classId || "";
    const resolvedCourseName = courseName || catalog.subjectName || "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: productType === "subscription" ? "subscription" : "payment",
      success_url: `${appUrl}/checkout/success?plan=${plan}&billing=${resolvedBilling}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId,
        productType: productType || "",
        planId: plan,
        billing: resolvedBilling,
        subjectId: resolvedSubjectId,
        classId: resolvedClassId,
        semester: semester ? String(semester) : "",
        courseName: resolvedCourseName,
        subjectSlug: catalog.subjectSlug ?? subjectSlug ?? "",
        subjectName: catalog.subjectName ?? "",
        grade: grade ? String(grade) : "",
        planName: plan === "resource" ? "Resource Membership" : plan,
        billingCycle: resolvedBilling === "yearly" ? "Yearly" : "Monthly",
        stripePriceId: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
