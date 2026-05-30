import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
export const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

export const EDUCATION_LEVELS = ["primary", "secondary", "university", "other"] as const;
export const GENDERS = ["male", "female", "non_binary", "prefer_not_to_say"] as const;

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "English",
  "German",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Computer Science",
  "History",
  "Geography",
  "Art",
  "Music",
] as const;

export type StudentRegistrationPayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  username: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  schoolName: string;
  currentGrade: string;
  educationLevel: string;
  preferredSubjects: string[];
  learningGoals: string;
  academicInterests?: string;
  country: string;
  stateProvince: string;
  city: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  otpVerified: boolean;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildFullName(first: string, middle: string | undefined, last: string): string {
  return [first, middle, last].filter(Boolean).join(" ").trim();
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
  if (!/\d/.test(password)) return "Password must include a number";
  return null;
}

export function validateStudentRegistration(data: StudentRegistrationPayload): string | null {
  if (!data.firstName?.trim() || data.firstName.trim().length < 2) return "First name is required";
  if (!data.lastName?.trim() || data.lastName.trim().length < 2) return "Last name is required";
  if (!USERNAME_REGEX.test(data.username)) return "Username must be 3–30 characters (letters, numbers, underscore)";
  if (!GENDERS.includes(data.gender as (typeof GENDERS)[number])) return "Please select a valid gender";
  if (!data.dateOfBirth) return "Date of birth is required";
  const dob = new Date(data.dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) return "Invalid date of birth";
  if (!EMAIL_REGEX.test(data.email)) return "Invalid email address";
  if (!PHONE_REGEX.test(data.phone)) return "Invalid phone number";
  if (data.parentEmail && !EMAIL_REGEX.test(data.parentEmail)) return "Invalid parent/guardian email";
  if (!data.schoolName?.trim()) return "School name is required";
  if (!data.currentGrade?.trim()) return "Current class/grade is required";
  if (!EDUCATION_LEVELS.includes(data.educationLevel as (typeof EDUCATION_LEVELS)[number])) {
    return "Invalid education level";
  }
  if (!data.preferredSubjects?.length) return "Select at least one preferred subject";
  if (!data.learningGoals?.trim()) return "Learning goals are required";
  if (!data.country?.trim() || !data.stateProvince?.trim() || !data.city?.trim()) {
    return "Complete location information is required";
  }
  const pwdErr = validatePassword(data.password);
  if (pwdErr) return pwdErr;
  if (data.password !== data.confirmPassword) return "Passwords do not match";
  if (!data.acceptTerms) return "You must accept the Terms and Conditions";
  if (!data.otpVerified) return "Please verify your email with the OTP code";
  return null;
}

export async function emailExists(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (isSupabaseServiceRoleConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!error && data.users.some((u) => u.email?.toLowerCase() === normalized)) return true;

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", normalized)
      .maybeSingle();
    if (profile) return true;
    return false;
  }

  return false;
}

export async function usernameExists(username: string): Promise<boolean> {
  if (!isSupabaseServiceRoleConfigured()) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username.trim())
    .maybeSingle();
  return Boolean(data);
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function logRegistrationAttempt(
  email: string | null,
  action: string,
  success: boolean,
  errorMessage?: string,
  metadata?: Record<string, unknown>,
  request?: Request
) {
  if (!isSupabaseServiceRoleConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("registration_logs").insert({
      email,
      action,
      success,
      error_message: errorMessage ?? null,
      ip_address: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: request?.headers.get("user-agent") ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    /* non-blocking */
  }
}
