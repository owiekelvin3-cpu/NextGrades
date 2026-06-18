import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/auth-utils";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireRole(supabase, "admin");

  if (!auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const sinceIso = since.toISOString();

  const [settingsRes, totalLogsRes, successLogsRes, latencySampleRes, sessionsRes, messagesRes] = await Promise.all([
    supabase.from("chatbot_settings").select("*").limit(1).maybeSingle(),
    supabase
      .from("chat_usage_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso),
    supabase
      .from("chat_usage_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso)
      .eq("success", true),
    supabase
      .from("chat_usage_logs")
      .select("latency_ms")
      .gte("created_at", sinceIso)
      .not("latency_ms", "is", null)
      .limit(200),
    supabase.from("chat_sessions").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabase.from("chat_messages").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
  ]);

  const totalRequests = totalLogsRes.count ?? 0;
  const successCount = successLogsRes.count ?? 0;
  const latencyRows = (latencySampleRes.data ?? []) as { latency_ms: number | null }[];
  const avgLatency =
    latencyRows.length > 0
      ? Math.round(latencyRows.reduce((s, l) => s + (l.latency_ms ?? 0), 0) / latencyRows.length)
      : 0;

  return NextResponse.json({
    settings: settingsRes.data,
    stats: {
      totalRequests30d: totalRequests,
      successRate: totalRequests ? Math.round((successCount / totalRequests) * 100) : 100,
      avgLatencyMs: avgLatency,
      sessions30d: sessionsRes.count ?? 0,
      messages30d: messagesRes.count ?? 0,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, "admin");

  if (!auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
  }

  const body = (await request.json()) as {
    enabled?: boolean;
    streaming_enabled?: boolean;
    rag_enabled?: boolean;
    max_messages_per_minute?: number;
    default_model?: string;
    system_prompt_override?: string | null;
  };

  const { data: existing } = await supabase.from("chatbot_settings").select("id").limit(1).maybeSingle();

  const patch = {
    ...body,
    updated_at: new Date().toISOString(),
    updated_by: auth.user.id,
  };

  let result;
  if (existing?.id) {
    result = await supabase.from("chatbot_settings").update(patch).eq("id", existing.id).select("*").single();
  } else {
    result = await supabase.from("chatbot_settings").insert(patch).select("*").single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: result.data });
}
