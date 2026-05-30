import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  buildFullName,
  emailExists,
  logRegistrationAttempt,
  normalizeEmail,
  usernameExists,
  validateStudentRegistration,
  type StudentRegistrationPayload,
} from "@/lib/auth/registration";
import { sendWelcomeEmail, sendSignupConfirmationEmail } from "@/lib/email";

async function isOtpVerified(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("registration_otps")
    .select("verified, created_at")
    .eq("email", email)
    .eq("verified", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  const verifiedAt = new Date(data.created_at).getTime();
  return Date.now() - verifiedAt < 30 * 60 * 1000;
}

export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as StudentRegistrationPayload;
    const email = normalizeEmail(body.email || "");

    const validationError = validateStudentRegistration({ ...body, email });
    if (validationError) {
      await logRegistrationAttempt(email, "register", false, validationError, {}, request);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (await emailExists(email)) {
      await logRegistrationAttempt(email, "register", false, "Duplicate email", {}, request);
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please sign in to continue.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    if (await usernameExists(body.username)) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    if (!(await isOtpVerified(email))) {
      return NextResponse.json({ error: "Email not verified. Please complete OTP verification." }, { status: 400 });
    }

    const admin = createAdminClient();
    const fullName = buildFullName(body.firstName, body.middleName, body.lastName);

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        middle_name: body.middleName?.trim() || null,
        username: body.username.trim(),
        role: "student",
        phone: body.phone.trim(),
        gender: body.gender,
        date_of_birth: body.dateOfBirth,
        email_verified: true,
        signup_source: "student_registration",
      },
    });

    if (authError || !authData.user) {
      await logRegistrationAttempt(email, "register", false, authError?.message, {}, request);
      return NextResponse.json({ error: authError?.message || "Failed to create account" }, { status: 500 });
    }

    const userId = authData.user.id;

    await admin
      .from("profiles")
      .update({
        email,
        full_name: fullName,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        middle_name: body.middleName?.trim() || null,
        username: body.username.trim(),
        phone: body.phone.trim(),
        gender: body.gender,
        date_of_birth: body.dateOfBirth,
        learning_goal: body.learningGoals.trim(),
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        role: "student",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    await admin.from("student_registration_details").upsert({
      user_id: userId,
      parent_name: body.parentName?.trim() || null,
      parent_phone: body.parentPhone?.trim() || null,
      parent_email: body.parentEmail?.trim() || null,
      school_name: body.schoolName.trim(),
      current_grade: body.currentGrade.trim(),
      education_level: body.educationLevel,
      preferred_subjects: body.preferredSubjects,
      learning_goals: body.learningGoals.trim(),
      academic_interests: body.academicInterests?.trim() || null,
      country: body.country.trim(),
      state_province: body.stateProvince.trim(),
      city: body.city.trim(),
      terms_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    void sendWelcomeEmail(email, fullName, "student");
    void sendSignupConfirmationEmail(email, fullName, "student");

    await logRegistrationAttempt(email, "register", true, undefined, { userId }, request);

    return NextResponse.json({
      success: true,
      userId,
      message: "Account created successfully. You can now sign in.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    await logRegistrationAttempt(null, "register", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
