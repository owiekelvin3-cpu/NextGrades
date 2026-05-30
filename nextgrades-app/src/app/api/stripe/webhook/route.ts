import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  sendSubscriptionConfirmationEmail,
  sendPaymentReceiptEmail,
  sendCoursePurchaseEmail,
  sendSubscriptionRenewalReminderEmail,
  sendAdminNotificationEmail,
} from "@/lib/email";
import { formatCurrency } from "@/lib/email/utils";

async function getUserEmail(userId: string): Promise<{ email: string | null; name: string | null }> {
  if (!isSupabaseServiceRoleConfigured()) return { email: null, name: null };
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle();
  return { email: (data as { email?: string } | null)?.email ?? null, name: data?.full_name ?? null };
}

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : null;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const productType = session.metadata?.productType;
        const courseName = session.metadata?.courseName || "NextGrades Course";
        const amount = (session.amount_total ?? 0) / 100;
        const currency = (session.currency || "eur").toUpperCase();

        if (userId && admin) {
          if (productType === "subscription") {
            await admin.from("profiles").update({ subscription_status: "active" }).eq("id", userId);
          } else {
            const { data: userUnits } = await admin.from("user_units").select("*").eq("student_id", userId).single();
            if (userUnits) {
              await admin
                .from("user_units")
                .update({ remaining_units: userUnits.remaining_units + 10 })
                .eq("student_id", userId);
            }
          }

          const { email, name } = await getUserEmail(userId);
          if (email) {
            if (productType === "subscription") {
              void sendSubscriptionConfirmationEmail(email, name ?? undefined, {
                planName: session.metadata?.planName || "Premium",
                amount: formatCurrency(amount, currency),
                billingCycle: session.metadata?.billingCycle || "Monthly",
              });
            } else {
              void sendCoursePurchaseEmail(email, name ?? undefined, courseName, amount, currency, session.id);
            }
            void sendPaymentReceiptEmail(
              email,
              name ?? undefined,
              [{ label: productType === "subscription" ? "Subscription" : courseName, value: formatCurrency(amount, currency) }],
              formatCurrency(amount, currency),
              session.id,
              typeof session.invoice === "string" ? undefined : undefined
            );
          }

          void sendAdminNotificationEmail(
            "New payment received",
            `${name || "A user"} completed a ${productType || "purchase"} for ${formatCurrency(amount, currency)}.`,
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/payments`
          );
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email;
        const amount = (invoice.amount_paid ?? 0) / 100;
        const currency = (invoice.currency || "eur").toUpperCase();

        if (customerEmail) {
          void sendPaymentReceiptEmail(
            customerEmail,
            undefined,
            [{ label: "Subscription renewal", value: formatCurrency(amount, currency) }],
            formatCurrency(amount, currency),
            invoice.id,
            invoice.hosted_invoice_url ?? undefined
          );
        }
        break;
      }

      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email;
        if (customerEmail) {
          void sendSubscriptionRenewalReminderEmail(customerEmail, undefined, {
            planName: "Premium",
            amount: formatCurrency((invoice.amount_due ?? 0) / 100, (invoice.currency || "eur").toUpperCase()),
            billingCycle: "Monthly",
            renewalDate: invoice.next_payment_attempt
              ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("de-DE")
              : undefined,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook error";
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
