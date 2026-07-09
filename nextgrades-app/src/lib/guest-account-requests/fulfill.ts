import type { SupabaseClient } from "@supabase/supabase-js";
import { emailExists, normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { generateTemporaryPassword } from "@/lib/auth/generate-temp-password";
import { generateAuthLink, getPasswordResetRedirectUrl } from "@/lib/auth/auth-links";
import { ensureRoleProfile } from "@/lib/auth/profile-setup";
import { sendAccountInvitationEmail } from "@/lib/email";
import { provisionUserSubscription } from "@/lib/subscriptions/provision";

export type GuestAccountRequestRow = {
  id: string;
  stripe_session_id: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  parent_name: string | null;
  notes: string | null;
  subject_slug: string | null;
  subject_name: string | null;
  subject_id: string | null;
  class_id: string | null;
  grade: string | null;
  semester: string | null;
  plan_id: string | null;
  billing: string | null;
  amount_paid: number | null;
  currency: string | null;
  payment_email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  created_user_id: string | null;
};

export type FulfillGuestRequestInput = {
  requestId: string;
  adminUserId: string;
  role?: "student" | "teacher";
};

export type FulfillGuestRequestResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string; status: number };

export async function fulfillGuestAccountRequest(
  admin: SupabaseClient,
  input: FulfillGuestRequestInput
): Promise<FulfillGuestRequestResult> {
  const { data: request, error: fetchError } = await admin
    .from("guest_account_requests")
    .select("*")
    .eq("id", input.requestId)
    .maybeSingle();

  if (fetchError || !request) {
    return { ok: false, error: "Anfrage nicht gefunden.", status: 404 };
  }

  const row = request as GuestAccountRequestRow;

  if (row.status === "fulfilled" && row.created_user_id) {
    return { ok: false, error: "Diese Anfrage wurde bereits bearbeitet.", status: 409 };
  }

  const email = normalizeEmail(row.email || row.payment_email || "");
  const role = input.role === "teacher" ? "teacher" : "student";
  const fullName =
    [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || email.split("@")[0] || "User";

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      error:
        row.status === "payment_received"
          ? "Keine gültige E-Mail - warte auf Kontodaten des Kunden."
          : "Ungültige E-Mail in der Anfrage.",
      status: 400,
    };
  }

  if (await emailExists(email)) {
    return {
      ok: false,
      error: "Für diese E-Mail existiert bereits ein Konto. Verknüpfe das Abo manuell oder nutze ein anderes Konto.",
      status: 409,
    };
  }

  const password = generateTemporaryPassword();
  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (createError || !authData.user?.id) {
    const msg = createError?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("exists")) {
      return { ok: false, error: "Für diese E-Mail existiert bereits ein Konto.", status: 409 };
    }
    return { ok: false, error: createError?.message || "Benutzer konnte nicht erstellt werden.", status: 500 };
  }

  const userId = authData.user.id;

  try {
    await ensureRoleProfile(admin, userId, role, {
      fullName,
      email,
      verified: true,
    });

    const semesterRaw = row.semester;
    const semester =
      semesterRaw === "1" || semesterRaw === "2" ? parseInt(semesterRaw, 10) : null;

    await provisionUserSubscription(admin, {
      userId,
      planId: row.plan_id,
      billing: row.billing,
      subjectId: row.subject_id,
      classId: row.class_id,
      semester,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      subscriptionStartsAt: row.subscription_starts_at,
      subscriptionEndsAt: row.subscription_ends_at,
    });

    const { actionLink, error: linkError } = await generateAuthLink({
      type: "recovery",
      email,
      redirectTo: getPasswordResetRedirectUrl(),
    });

    if (linkError || !actionLink) {
      throw new Error(linkError || "Einladungslink konnte nicht erstellt werden.");
    }

    const emailResult = await sendAccountInvitationEmail({
      email,
      userName: fullName,
      role,
      setupUrl: actionLink,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || "E-Mail konnte nicht gesendet werden.");
    }

    await admin
      .from("guest_account_requests")
      .update({
        status: "fulfilled",
        created_user_id: userId,
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: input.adminUserId,
      })
      .eq("id", row.id);

    await admin.from("user_activity_log").insert({
      user_id: userId,
      action: "admin_fulfilled_guest_payment",
      metadata: {
        guest_request_id: row.id,
        fulfilled_by: input.adminUserId,
        plan_id: row.plan_id,
        billing: row.billing,
        stripe_session_id: row.stripe_session_id,
      },
    });

    return { ok: true, userId, email };
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);
    const message = error instanceof Error ? error.message : "Konto konnte nicht eingerichtet werden.";
    return { ok: false, error: message, status: 500 };
  }
}
