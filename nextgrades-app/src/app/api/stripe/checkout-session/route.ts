import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { resolveStripePriceId } from "@/lib/stripe/prices";

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
    } = body;

    const priceId =
      rawPriceId && String(rawPriceId).startsWith("price_")
        ? rawPriceId
        : resolveStripePriceId(planId || "group", billing || "monthly");

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this plan. Set STRIPE_PRICE_* environment variables." },
        { status: 503 }
      );
    }

    const userId = gate.auth!.profile!.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: productType === "subscription" ? "subscription" : "payment",
      success_url: `${request.headers.get("origin")}/checkout/success?plan=${planId || "group"}&billing=${billing || "monthly"}`,
      cancel_url: `${request.headers.get("origin")}/pricing`,
      metadata: {
        userId,
        productType: productType || "",
        planId: planId || "",
        billing: billing || "",
        subjectId: subjectId || "",
        classId: classId || "",
        semester: semester ? String(semester) : "",
        courseName: courseName || "",
        planName: planId === "resource" ? "Resource Membership" : planId || "Premium",
        billingCycle: billing === "yearly" ? "Yearly" : "Monthly",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
