import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { isResendConfigured, sendGuestAccountSetupEmails } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { guestPaymentFromStripeSession } from "@/lib/guest-account-requests/stripe-sync";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "checkout:account-setup", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: "E-Mail-Dienst ist nicht konfiguriert." }, { status: 503 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const sessionId = String(body.sessionId || "").trim();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim();
    const phone = body.phone ? String(body.phone).trim() : "";
    const parentName = body.parentName ? String(body.parentName).trim() : "";
    const notes = body.notes ? String(body.notes).trim() : "";

    if (!sessionId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Session, Vorname, Nachname und E-Mail sind Pflichtfelder." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Zahlung wurde noch nicht bestätigt." }, { status: 402 });
    }

    if (session.metadata?.guestCheckout !== "true") {
      return NextResponse.json({ error: "Ungültige Checkout-Sitzung." }, { status: 400 });
    }

    const paymentRow = guestPaymentFromStripeSession(session);

    if (isSupabaseServiceRoleConfigured()) {
      const admin = createAdminClient();
      const { data: existing } = await admin
        .from("guest_account_requests")
        .select("id, status")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (existing?.status === "fulfilled") {
        return NextResponse.json({ success: true, alreadySubmitted: true });
      }

      if (existing?.status === "details_submitted") {
        return NextResponse.json({ success: true, alreadySubmitted: true });
      }

      const payload = {
        ...paymentRow,
        status: "details_submitted",
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        parent_name: parentName || null,
        notes: notes || null,
      };

      if (existing) {
        await admin.from("guest_account_requests").update(payload).eq("stripe_session_id", sessionId);
      } else {
        await admin.from("guest_account_requests").insert(payload);
      }
    }

    const metadata = session.metadata ?? {};
    const results = await sendGuestAccountSetupEmails({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      parentName: parentName || undefined,
      notes: notes || undefined,
      subjectName: metadata.subjectName || metadata.courseName || undefined,
      grade: metadata.grade || undefined,
      semester: metadata.semester || undefined,
      planName: metadata.planName || undefined,
      stripeSessionId: sessionId,
      paymentEmail: session.customer_details?.email ?? session.customer_email ?? undefined,
    });

    if (!results.admin.success) {
      return NextResponse.json(
        { error: results.admin.error || "Details konnten nicht gesendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account setup submit error:", error);
    return NextResponse.json({ error: "Details konnten nicht gesendet werden." }, { status: 500 });
  }
}
