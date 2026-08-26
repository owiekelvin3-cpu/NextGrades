import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";

export const runtime = "nodejs";

const FULL_SELECT =
  "id, full_name, email, phone, bio, learning_goal, avatar_url, timezone, role, subscription_status, subscription_plan, subscription_billing, subscription_starts_at, subscription_ends_at, created_at";

const BASE_SELECT = "id, full_name, avatar_url, role, created_at, learning_goal";

async function fetchProfileRow(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const full = await supabase.from("profiles").select(FULL_SELECT).eq("id", userId).maybeSingle();
  if (!full.error && full.data) return full.data;

  const base = await supabase.from("profiles").select(BASE_SELECT).eq("id", userId).maybeSingle();
  if (base.error || !base.data) return null;

  const row = base.data as Record<string, unknown>;
  return {
    ...row,
    email: null,
    phone: null,
    bio: null,
    timezone: "Europe/Berlin",
    subscription_status: null,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const { data: authData } = await supabase.auth.getUser();
  const row = await fetchProfileRow(supabase, user.id);
  if (!row) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: registration } = await supabase
    .from("student_registration_details")
    .select("school_name, current_grade")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    profile: {
      ...row,
      email: (row as { email?: string | null }).email ?? authData.user?.email ?? null,
      school_name: registration?.school_name ?? null,
      current_grade: registration?.current_grade ?? null,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  let body: {
    full_name?: string;
    phone?: string | null;
    bio?: string | null;
    learning_goal?: string | null;
    timezone?: string | null;
    school_name?: string | null;
    current_grade?: string | null;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.full_name !== undefined) update.full_name = body.full_name.trim() || null;
  if (body.phone !== undefined) update.phone = body.phone?.trim() || null;
  if (body.bio !== undefined) update.bio = body.bio?.trim() || null;
  if (body.learning_goal !== undefined) update.learning_goal = body.learning_goal?.trim() || null;
  if (body.timezone !== undefined) update.timezone = body.timezone || "Europe/Berlin";

  const hasProfileUpdate = Object.keys(update).length > 1;
  const hasRegistrationUpdate =
    body.school_name !== undefined || body.current_grade !== undefined;

  if (!hasProfileUpdate && !hasRegistrationUpdate) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (hasProfileUpdate) {
    const { error: updateError } = await supabase.from("profiles").update(update).eq("id", user.id);

    if (updateError) {
      const msg = updateError.message ?? "";
      if (msg.includes("bio") || msg.includes("timezone") || msg.includes("phone")) {
        const fallback: Record<string, unknown> = { updated_at: update.updated_at };
        if (body.full_name !== undefined) fallback.full_name = update.full_name;
        if (body.learning_goal !== undefined) fallback.learning_goal = update.learning_goal;
        const { error: err2 } = await supabase.from("profiles").update(fallback).eq("id", user.id);
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  if (hasRegistrationUpdate && profile.role === "student") {
    const registrationUpdate: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (body.school_name !== undefined) registrationUpdate.school_name = body.school_name?.trim() || null;
    if (body.current_grade !== undefined) {
      registrationUpdate.current_grade = body.current_grade?.trim() || null;
    }
    const { error: regError } = await supabase
      .from("student_registration_details")
      .upsert(registrationUpdate, { onConflict: "user_id" });
    if (regError) return NextResponse.json({ error: regError.message }, { status: 500 });
  }

  const row = await fetchProfileRow(supabase, user.id);
  const { data: authData } = await supabase.auth.getUser();
  const { data: registration } = await supabase
    .from("student_registration_details")
    .select("school_name, current_grade")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    profile: row
      ? {
          ...row,
          email: (row as { email?: string | null }).email ?? authData.user?.email ?? null,
          school_name: registration?.school_name ?? null,
          current_grade: registration?.current_grade ?? null,
        }
      : null,
  });
}
