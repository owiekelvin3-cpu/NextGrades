import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { emailExists, normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { generateTemporaryPassword } from "@/lib/auth/generate-temp-password";
import { generateInviteLinkForEmail } from "@/lib/auth/auth-links";
import { ensureRoleProfile } from "@/lib/auth/profile-setup";
import { sendAccountInvitationEmail, isResendConfigured } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

type CreateUserBody = {
  email?: string;
  fullName?: string;
  role?: "student" | "teacher";
};

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const verified = searchParams.get("verified") || "";
    const sort = searchParams.get("sort") || "created_at";

    let query = gate.auth!.supabase.from("profiles").select("*", { count: "exact" });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    if (verified === "verified") {
      query = query.eq("email_verified", true);
    } else if (verified === "unverified") {
      query = query.eq("email_verified", false);
    }

    const ascending = sort === "created_at_asc" || sort === "full_name" || sort === "email";
    const sortColumn =
      sort === "created_at_asc" ? "created_at" : sort.replace("_asc", "").replace("_desc", "") || "created_at";

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order(sortColumn, { ascending });

    const { data, error, count } = await query;

    if (error) throw error;

    const rows = data ?? [];
    const studentIds = rows.filter((u) => u.role === "student").map((u) => u.id as string);
    const unitsByStudent = new Map<string, { remaining_units: number; total_units: number }>();

    if (studentIds.length) {
      const db = isSupabaseServiceRoleConfigured()
        ? createAdminClient()
        : gate.auth!.supabase;
      const { data: units } = await db
        .from("user_units")
        .select("student_id, remaining_units, total_units")
        .in("student_id", studentIds);
      for (const row of units ?? []) {
        unitsByStudent.set(row.student_id as string, {
          remaining_units: Number(row.remaining_units ?? 0),
          total_units: Number(row.total_units ?? 0),
        });
      }
    }

    const users = rows.map((u) => {
      const units = u.role === "student" ? unitsByStudent.get(u.id as string) : undefined;
      return {
        ...u,
        remaining_units: units?.remaining_units ?? (u.role === "student" ? 0 : null),
        total_units: units?.total_units ?? (u.role === "student" ? 0 : null),
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required to create users." },
      { status: 503 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "E-Mail-Dienst ist nicht konfiguriert. Zugangsdaten können nicht versendet werden." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as CreateUserBody;
    const email = normalizeEmail(body.email || "");
    const password = generateTemporaryPassword();
    const role = body.role === "teacher" ? "teacher" : "student";
    const fullName = body.fullName?.trim() || email.split("@")[0] || "User";

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }

    if (await emailExists(email)) {
      return NextResponse.json(
        { error: "Für diese E-Mail existiert bereits ein Konto.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "Für diese E-Mail existiert bereits ein Konto.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Benutzer konnte nicht erstellt werden." }, { status: 500 });
    }

    await ensureRoleProfile(admin, userId, role, {
      fullName,
      email,
      verified: true,
      passwordSetupRequired: true,
    });

    const { actionLink, error: linkError } = await generateInviteLinkForEmail(email);

    if (linkError || !actionLink) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: linkError || "Einladungslink konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    const emailResult = await sendAccountInvitationEmail({
      email,
      userName: fullName,
      role,
      setupUrl: actionLink,
    });

    if (!emailResult.success) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: emailResult.error || "E-Mail konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    await admin.from("user_activity_log").insert({
      user_id: userId,
      action: "admin_created",
      metadata: {
        created_by: gate.auth!.user.id,
        role,
        email_sent: true,
      },
    });

    const { notifyAdminNewRegistration } = await import("@/lib/notifications/triggers");
    void notifyAdminNewRegistration({ userId, role, name: fullName });

    return NextResponse.json({
      success: true,
      user: { id: userId, email, full_name: fullName, role },
      emailSent: true,
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
