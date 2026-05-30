import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  getAvailableModels,
  isAnyModelAvailable,
  parseModelId,
  resolveModelId,
  type AiProvider,
} from "./models";

export type { AiProvider };
export { isAnyModelAvailable as isAiConfigured, getAvailableModels };

export type StreamResult = {
  stream: AsyncIterable<{ content: string }>;
  model: string;
  provider: AiProvider;
  modelId: string;
};

function getGroqClient() {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });
}

function getOpenRouterClient() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "NextGrades AI",
    },
  });
}

function getTogetherClient() {
  const key = process.env.TOGETHER_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.together.xyz/v1" });
}

async function createOpenAiStream(
  client: OpenAI,
  model: string,
  messages: ChatCompletionMessageParam[],
  provider: AiProvider,
  modelId: string
): Promise<StreamResult> {
  const completion = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  });

  async function* iterate() {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) yield { content };
    }
  }

  return { stream: iterate(), model, provider, modelId };
}

async function pollinationsCompletion(model: string, messages: ChatCompletionMessageParam[]): Promise<string> {
  const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: 2048, temperature: 0.7 }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Pollinations error (${res.status}): ${errText.slice(0, 120)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Pollinations returned empty response");
  return content;
}

async function textPollinationsCompletion(prompt: string): Promise<string> {
  const encoded = encodeURIComponent(prompt.slice(0, 4000));
  const res = await fetch(`https://text.pollinations.ai/${encoded}`, {
    headers: { Accept: "text/plain" },
  });
  if (!res.ok) throw new Error(`Text API error (${res.status})`);
  const text = (await res.text()).trim();
  if (!text) throw new Error("Text API returned empty response");
  return text;
}

function simulateStream(text: string): AsyncIterable<{ content: string }> {
  const words = text.split(/(\s+)/);

  async function* iterate() {
    for (const part of words) {
      if (part) yield { content: part };
    }
  }

  return iterate();
}

async function createPollinationsStream(
  model: string,
  messages: ChatCompletionMessageParam[],
  modelId: string
): Promise<StreamResult> {
  try {
    const content = await pollinationsCompletion(model, messages);
    return {
      stream: simulateStream(content),
      model,
      provider: "pollinations",
      modelId,
    };
  } catch {
    const system = messages.find((m) => m.role === "system");
    const convo = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${String(m.content)}`)
      .join("\n");
    const prompt = system
      ? `${String(system.content)}\n\n${convo}\n\nAssistant:`
      : `${convo}\n\nAssistant:`;
    const content = await textPollinationsCompletion(prompt);
    return {
      stream: simulateStream(content),
      model: "text-fallback",
      provider: "pollinations",
      modelId,
    };
  }
}

async function streamWithProvider(
  modelId: string,
  messages: ChatCompletionMessageParam[]
): Promise<StreamResult> {
  const { provider, model } = parseModelId(modelId);

  if (provider === "groq") {
    const client = getGroqClient();
    if (!client) throw new Error("Groq API key not configured");
    return createOpenAiStream(client, model, messages, "groq", modelId);
  }

  if (provider === "openrouter") {
    const client = getOpenRouterClient();
    if (!client) throw new Error("OpenRouter API key not configured");
    return createOpenAiStream(client, model, messages, "openrouter", modelId);
  }

  if (provider === "together") {
    const client = getTogetherClient();
    if (!client) throw new Error("Together API key not configured");
    return createOpenAiStream(client, model, messages, "together", modelId);
  }

  if (provider === "pollinations") {
    return createPollinationsStream(model, messages, modelId);
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function streamChatCompletion(
  messages: ChatCompletionMessageParam[],
  preferredModelId?: string | null
): Promise<StreamResult> {
  const resolved = resolveModelId(preferredModelId);
  const available = getAvailableModels();
  const availableIds = new Set(available.map((m) => m.id));

  const tryOrder = [
    resolved,
    ...available.filter((m) => m.id !== resolved).map((m) => m.id),
  ];

  let lastError: Error | null = null;

  for (const modelId of tryOrder) {
    if (!availableIds.has(modelId)) continue;
    try {
      return await streamWithProvider(modelId, messages);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[chat] Model ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("No AI models available. Configure GROQ_API_KEY or use free models.");
}

export async function translateText(
  text: string,
  targetLanguage: "de" | "en"
): Promise<string> {
  const langName = targetLanguage === "de" ? "German" : "English";
  const prompt = `Translate the following text to ${langName}. Return ONLY the translation, with no explanation or quotes:\n\n${text}`;

  const groq = getGroqClient();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2048,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      /* fall through */
    }
  }

  for (const model of ["openai-large", "deepseek"]) {
    try {
      return await pollinationsCompletion(model, [{ role: "user", content: prompt }]);
    } catch {
      /* try next */
    }
  }

  return textPollinationsCompletion(prompt);
}
