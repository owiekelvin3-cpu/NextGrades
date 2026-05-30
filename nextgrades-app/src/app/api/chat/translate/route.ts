import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";
import { translateText } from "@/lib/chat/ai-client";
import { parseChatResponseLanguage } from "@/lib/chat/languages";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  let body: { text?: string; targetLanguage?: "de" | "en" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const targetLanguage = parseChatResponseLanguage(body.targetLanguage);

  try {
    const translation = await translateText(text, targetLanguage);
    return NextResponse.json({ translation, targetLanguage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
