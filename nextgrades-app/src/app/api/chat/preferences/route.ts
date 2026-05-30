import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";
import { parseChatResponseLanguage } from "@/lib/chat/languages";

export async function GET() {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const { data, error: prefError } = await supabase
    .from("chatbot_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (prefError?.message?.includes("response_language")) {
    return NextResponse.json({
      preferences: {
        show_suggestions: true,
        compact_mode: false,
        theme: "auto",
        preferred_model: null,
        response_language: "de",
      },
    });
  }

  return NextResponse.json({
    preferences: data ?? {
      show_suggestions: true,
      compact_mode: false,
      theme: "auto",
      preferred_model: null,
      response_language: "de",
    },
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    show_suggestions?: boolean;
    compact_mode?: boolean;
    theme?: "auto" | "light" | "dark";
    preferred_model?: string | null;
    response_language?: "de" | "en";
  };

  const { data: existing } = await supabase
    .from("chatbot_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPrefs = existing as {
    show_suggestions?: boolean;
    compact_mode?: boolean;
    theme?: string;
    preferred_model?: string | null;
    response_language?: string;
  } | null;

  const payload = {
    user_id: user.id,
    show_suggestions: body.show_suggestions ?? existingPrefs?.show_suggestions ?? true,
    compact_mode: body.compact_mode ?? existingPrefs?.compact_mode ?? false,
    theme: body.theme ?? existingPrefs?.theme ?? "auto",
    preferred_model:
      body.preferred_model !== undefined ? body.preferred_model : (existingPrefs?.preferred_model ?? null),
    response_language:
      body.response_language !== undefined
        ? parseChatResponseLanguage(body.response_language)
        : parseChatResponseLanguage(existingPrefs?.response_language),
    updated_at: new Date().toISOString(),
  };

  const { data, error: upsertError } = await supabase
    .from("chatbot_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (upsertError?.message?.includes("response_language")) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("chatbot_preferences")
      .upsert(
        {
          user_id: user.id,
          show_suggestions: payload.show_suggestions,
          compact_mode: payload.compact_mode,
          theme: payload.theme,
          preferred_model: payload.preferred_model,
          updated_at: payload.updated_at,
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }

    return NextResponse.json({
      preferences: { ...fallbackData, response_language: payload.response_language },
    });
  }

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}