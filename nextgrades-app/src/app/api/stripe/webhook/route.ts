import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { createNotification } from "@/lib/notifications/server";
import {
  sendSubscriptionConfirmationEmail,
  sendPaymentReceiptEmail,
  sendCoursePurchaseEmail,
  sendSubscriptionRenewalReminderEmail,
  sendAdminNotificationEmail,
} from "@/lib/email";
import { formatCurrency } from "@/lib/email/utils";
import { provisionUserSubscription } from "@/lib/subscriptions/provision";
import { upsertGuestPaymentFromStripeSession } from "@/lib/guest-account-requests/stripe-sync";
import {
  fetchSubscriptionPeriodEnd,
  findProfileByStripeCustomer,
  renewSubscriptionFromInvoice,
  revokeSubscriptionAccess,
  syncProfileFromStripeSubscription,
} from "@/lib/stripe/subscription-sync";

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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Stripe webhook secret not configured" }, { status: 503 });
    }
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : null;

    if (admin) {
      try {
        const { error: idempotencyError } = await admin.from("stripe_webhook_events").insert({
          id: event.id,
          event_type: event.type,
        });

        if (idempotencyError?.code === "23505") {
          return NextResponse.json({ received: true, duplicate: true });
        }
      } catch {
        /* stripe_webhook_events table pending migration */
      }
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const productType = session.metadata?.productType;
        const planId = session.metadata?.planId;
        const courseName = session.metadata?.courseName || "NextGrades Course";
        const subjectId = session.metadata?.subjectId;
        const classId = session.metadata?.classId;
        const semesterRaw = session.metadata?.semester;
        const semester =
          semesterRaw === "1" || semesterRaw === "2" ? parseInt(semesterRaw, 10) : null;
        const amount = (session.amount_total ?? 0) / 100;
        const currency = (session.currency || "eur").toUpperCase();
        const isSubscription =
          productType === "subscription" ||
          planId === "resource" ||
          planId === "group" ||
          planId === "premium";

        if (userId && admin) {
          if (isSubscription) {
            const customerId =
              typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
            const subscriptionId =
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null;

            const subscriptionEndsAt = await fetchSubscriptionPeriodEnd(stripe, subscriptionId);

            await provisionUserSubscription(admin, {
              userId,
              planId,
              billing: session.metadata?.billing,
              subjectId,
              classId,
              semester,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionEndsAt,
            });
          } else {
            const { data: userUnits } = await admin.from("user_units").select("*").eq("student_id", userId).single();
            if (userUnits) {
              await admin
                .from("user_units")
                .update({ remaining_units: userUnits.remaining_units + 10 })
                .eq("student_id", userId);
            }
          }

          if (!isSubscription && subjectId && classId) {
            const { data: existingEnrollment } = await admin
              .from("enrollments")
              .select("id")
              .eq("student_id", userId)
              .eq("subject_id", subjectId)
              .eq("class_id", classId)
              .maybeSingle();

            if (existingEnrollment) {
              await admin
                .from("enrollments")
                .update({ status: "active", semester, start_date: new Date().toISOString() })
                .eq("id", existingEnrollment.id);
            } else {
              await admin.from("enrollments").insert({
                student_id: userId,
                subject_id: subjectId,
                class_id: classId,
                semester,
                status: "active",
                start_date: new Date().toISOString(),
              });
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
            `${process.env.NEXT_PUBLIC_APP_URL}/portal/admin/payments`
          );

          const { notifyPaymentReceived, notifyEnrollment } = await import("@/lib/notifications/triggers");
          void notifyPaymentReceived({
            userId,
            amount: formatCurrency(amount, currency),
            description: productType === "subscription" ? "Subscription activated" : `Purchase: ${courseName}`,
          });
          if (subjectId && classId) {
            void notifyEnrollment({ studentId: userId, subjectName: courseName });
          }
        } else if (session.metadata?.guestCheckout === "true" && admin) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null;
          const subscriptionEndsAt = await fetchSubscriptionPeriodEnd(stripe, subscriptionId);
          await upsertGuestPaymentFromStripeSession(admin, session, { subscriptionEndsAt });
          const payerEmail = session.customer_details?.email ?? session.customer_email ?? "unknown";
          const subjectLabel = session.metadata?.subjectName || session.metadata?.subjectSlug || courseName;
          void sendAdminNotificationEmail(
            "Guest payment - create account",
            `${payerEmail} paid ${formatCurrency(amount, currency)} for ${session.metadata?.planName || planId || "subscription"} (${subjectLabel}). Review in Admin → Paid signups.`,
            `${process.env.NEXT_PUBLIC_APP_URL}/portal/admin/guest-signups`,
            "Open paid signups"
          );
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email;
        const amount = (invoice.amount_paid ?? 0) / 100;
        const currency = (invoice.currency || "eur").toUpperCase();

        if (admin) {
          await renewSubscriptionFromInvoice(admin, stripe, invoice);
        }

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

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;

        if (customerId && admin) {
          const profile = await findProfileByStripeCustomer(admin, customerId, stripe);
          if (profile) {
            await admin
              .from("profiles")
              .update({ subscription_status: "inactive", updated_at: new Date().toISOString() })
              .eq("id", profile.id);

            void createNotification({
              userId: profile.id,
              type: "warning",
              category: "account",
              title: "Payment failed",
              message: "Your subscription payment could not be processed. Update your payment method to keep access.",
              actionUrl: "/pricing",
            });
          }
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

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

        if (customerId && admin) {
          const profile = await findProfileByStripeCustomer(admin, customerId, stripe);

          if (profile?.id) {
            await revokeSubscriptionAccess(admin, profile.id);

            void createNotification({
              userId: profile.id,
              type: "warning",
              category: "account",
              title: "Subscription cancelled",
              message: "Your subscription has ended. Renew to regain access to premium content.",
              actionUrl: "/pricing",
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

        if (customerId && admin) {
          const profile = await findProfileByStripeCustomer(admin, customerId, stripe);

          if (profile?.id) {
            await syncProfileFromStripeSubscription(admin, profile.id, subscription);
          }
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
