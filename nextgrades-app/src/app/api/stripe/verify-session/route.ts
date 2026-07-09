import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "stripe:verify-session", limit: 30, windowSec: 3600 });
  if (limited) return limited;

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const metadata = session.metadata ?? {};

    return NextResponse.json({
      paid,
      guestCheckout: metadata.guestCheckout === "true",
      email: session.customer_details?.email ?? session.customer_email ?? "",
      planId: metadata.planId ?? "",
      subjectSlug: metadata.subjectSlug ?? "",
      subjectName: metadata.subjectName ?? metadata.courseName ?? "",
      grade: metadata.grade ?? "",
      className: metadata.className ?? "",
      semester: metadata.semester ?? "",
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error: unknown) {
    console.error("Stripe session verify error:", error);
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
  }
}
