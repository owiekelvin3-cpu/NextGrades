import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { buildSystemPrompt } from "@/lib/chat/prompts";
import { loadChatContext, titleFromMessage } from "@/lib/chat/context";
import { checkUserRateLimit, sanitizeInput, validateMessage } from "@/lib/chat/rate-limit";
import { streamChatCompletion, getAvailableModels, isAiConfigured } from "@/lib/chat/ai-client";
import { publicChatErrorMessage } from "@/lib/chat/errors";
import { resolveModelId } from "@/lib/chat/models";
import { parseChatResponseLanguage } from "@/lib/chat/languages";
import { buildUserMessageWithAttachments, type ChatAttachment } from "@/lib/chat/attachments";
import type { StreamChatRequest } from "@/lib/chat/types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getSettings(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("chatbot_settings").select("*").limit(1).maybeSingle();
  return data ?? {
    enabled: true,
    streaming_enabled: true,
    rag_enabled: true,
    max_messages_per_minute: 20,
    default_model: "llama-3.3-70b-versatile",
    system_prompt_override: null,
  };
}

export async function POST(request: Request) {
  const started = Date.now();
  const supabase = await createClient();
  const { user, profile, error: authError } = await getAuthProfile(supabase);

  if (!user || !profile) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 });
  }

  if (!requireRole(profile, ["student", "teacher", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getSettings(supabase);
  if (!settings.enabled) {
    return NextResponse.json({ error: "Chatbot is currently disabled" }, { status: 503 });
  }

  const rate = checkUserRateLimit(user.id, settings.max_messages_per_minute ?? 20);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let body: StreamChatRequest;
  try {
    body = (await request.json()) as StreamChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = sanitizeInput(body.message ?? "");
  const attachments = (body.attachments ?? []) as ChatAttachment[];
  const validationError = validateMessage(message, attachments.length > 0);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const fullMessage = buildUserMessageWithAttachments(message, attachments);

  const { data: preferenceRow } = await supabase
    .from("chatbot_preferences")
    .select("response_language, preferred_model")
    .eq("user_id", user.id)
    .maybeSingle();

  const pref = preferenceRow as { response_language?: string; preferred_model?: string } | null;

  const responseLanguage = parseChatResponseLanguage(
    body.responseLanguage ?? pref?.response_language
  );

  const modelId = resolveModelId(body.modelId ?? pref?.preferred_model ?? settings.default_model);

  let sessionId = body.sessionId;

  try {
    if (!sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: titleFromMessage(message || attachments[0]?.name || "Chat"),
          material_id: body.materialId ?? null,
          subject_id: body.subjectId ?? null,
          class_id: body.classId ?? null,
          semester: body.semester ?? null,
          topic: body.topic ?? null,
        })
        .select("id")
        .single();

      if (sessionError || !session) throw sessionError ?? new Error("Failed to create session");
      sessionId = session.id as string;
    } else {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    if (!body.regenerate) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: fullMessage,
      });
    }

    const { data: historyRaw } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(30);

    let history = (historyRaw ?? []) as { role: string; content: string }[];
    if (body.regenerate && history.length > 0) {
      const { data: lastAssistant } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("session_id", sessionId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAssistant?.id) {
        await supabase.from("chat_messages").delete().eq("id", lastAssistant.id);
      }
      history = history.filter((m, i, arr) => !(m.role === "assistant" && i === arr.length - 1));
    }

    const chatContext = await loadChatContext(supabase, user.id, profile.role, profile.full_name, {
      materialId: body.materialId,
      subjectId: body.subjectId,
      classId: body.classId,
      semester: body.semester,
      topic: body.topic,
      userMessage: fullMessage,
      ragEnabled: settings.rag_enabled !== false,
    });

    const systemPrompt = buildSystemPrompt(chatContext, settings.system_prompt_override, responseLanguage);

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content as string,
        })),
    ];

    const { stream, model, provider, modelId: usedModelId } = await streamChatCompletion(
      messages,
      modelId
    );

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        const send = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        send({ type: "meta", sessionId, model, provider, modelId: usedModelId });

        try {
          for await (const chunk of stream) {
            fullContent += chunk.content;
            if (settings.streaming_enabled !== false) {
              send({ type: "token", content: chunk.content });
            }
          }

          if (settings.streaming_enabled === false) {
            send({ type: "token", content: fullContent });
          }

          const { data: assistantMsg } = await supabase
            .from("chat_messages")
            .insert({
              session_id: sessionId,
              role: "assistant",
              content: fullContent,
              model,
              tokens_used: Math.ceil(fullContent.length / 4),
            })
            .select("id")
            .single();

          await supabase
            .from("chat_sessions")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", sessionId);

          await supabase.from("chat_usage_logs").insert({
            user_id: user.id,
            session_id: sessionId,
            model: `${provider}:${model}`,
            completion_tokens: Math.ceil(fullContent.length / 4),
            latency_ms: Date.now() - started,
            success: true,
          });

          send({ type: "done", messageId: assistantMsg?.id, content: fullContent });
        } catch (err) {
          const errMsg = publicChatErrorMessage(err, responseLanguage);
          await supabase.from("chat_usage_logs").insert({
            user_id: user.id,
            session_id: sessionId,
            model,
            latency_ms: Date.now() - started,
            success: false,
            error_message: errMsg,
          });
          send({ type: "error", error: errMsg });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const errMsg = publicChatErrorMessage(err, responseLanguage);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings(supabase);
  const models = getAvailableModels().map((m) => ({
    id: m.id,
    label: m.label,
    provider: m.provider,
    description: m.description,
    requiresKey: m.requiresKey,
    supportsStreaming: m.supportsStreaming,
    badge: m.badge,
  }));

  return NextResponse.json({
    enabled: settings.enabled,
    configured: isAiConfigured(),
    streaming: settings.streaming_enabled,
    rag: settings.rag_enabled,
    role: profile.role,
    models,
    defaultModelId: resolveModelId(settings.default_model),
  });
}
