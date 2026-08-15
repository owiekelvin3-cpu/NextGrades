import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { getAppUrl } from "@/lib/app-url";
import { resolveCheckoutCatalogContext } from "@/lib/checkout/catalog-context";
import { getPlanCheckoutSpec, stripeCheckoutLineItem } from "@/lib/stripe/plan-catalog";

export async function POST(request: Request) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." }, { status: 503 });
    }

    const body = await request.json();
    const {
      productType,
      planId,
      subjectId,
      classId,
      semester,
      courseName,
      subjectSlug,
      grade,
    } = body;

    const spec = getPlanCheckoutSpec(String(planId ?? "group"));
    const oneTime = spec.mode === "payment";
    const checkoutMode = spec.mode;
    const resolvedProductType = oneTime ? "payment" : productType || "subscription";
    const userId = gate.auth!.profile!.id;
    const appUrl = getAppUrl();
    const resolvedBilling = spec.accessBilling;

    const catalog = await resolveCheckoutCatalogContext({
      subjectSlug: subjectSlug || courseName,
      grade,
      semester: semester ? String(semester) : undefined,
    });

    const resolvedSubjectId = subjectId || catalog.subjectId || "";
    const resolvedClassId = classId || catalog.classId || "";
    const resolvedCourseName = courseName || catalog.subjectName || spec.productName;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [stripeCheckoutLineItem(spec)],
      mode: checkoutMode,
      success_url: `${appUrl}/checkout/success?plan=${spec.plan}&billing=${resolvedBilling}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId,
        productType: resolvedProductType,
        planId: spec.plan,
        billing: resolvedBilling,
        subjectId: resolvedSubjectId,
        classId: resolvedClassId,
        semester: semester ? String(semester) : "",
        courseName: resolvedCourseName,
        subjectSlug: catalog.subjectSlug ?? subjectSlug ?? "",
        subjectName: catalog.subjectName ?? "",
        grade: grade ? String(grade) : "",
        planName: spec.productName,
        billingCycle: spec.productDescription,
        stripeAmountCents: String(spec.amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
