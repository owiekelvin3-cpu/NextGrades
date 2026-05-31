import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";
import { normalizeLanguage } from "@/lib/i18n/locales";

export const runtime = "nodejs";

type UiTheme = "light" | "dark";

function parseTheme(value: unknown): UiTheme | null {
  return value === "light" || value === "dark" ? value : null;
}

async function readPreferences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const extended = await supabase
    .from("profiles")
    .select("ui_theme, preferred_language")
    .eq("id", userId)
    .maybeSingle();

  if (!extended.error && extended.data) {
    const row = extended.data as { ui_theme?: string | null; preferred_language?: string | null };
    return {
      theme: parseTheme(row.ui_theme),
      language: row.preferred_language ? normalizeLanguage(row.preferred_language) : null,
    };
  }

  if (extended.error?.message?.includes("ui_theme") || extended.error?.message?.includes("preferred_language")) {
    return { theme: null, language: null };
  }

  return null;
}

export async function GET() {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const preferences = await readPreferences(supabase, user.id);
  return NextResponse.json({ preferences: preferences ?? { theme: null, language: null } });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  let body: { theme?: unknown; language?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const theme = parseTheme(body.theme);
  const language = body.language !== undefined ? normalizeLanguage(String(body.language)) : undefined;

  if (body.theme !== undefined) {
    if (!theme) return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    update.ui_theme = theme;
  }
  if (body.language !== undefined) {
    update.preferred_language = language;
  }

  if (Object.keys(update).length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase.from("profiles").update(update).eq("id", user.id);

  if (updateError?.message?.includes("ui_theme") || updateError?.message?.includes("preferred_language")) {
    return NextResponse.json({
      preferences: {
        theme: theme ?? null,
        language: language ?? null,
      },
      warning: "Run supabase/USER_PREFERENCES_ONLY.sql to persist preferences in the database.",
    });
  }

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const preferences = await readPreferences(supabase, user.id);
  return NextResponse.json({ preferences: preferences ?? { theme: null, language: null } });
}
