export type AiProvider = "groq" | "pollinations" | "openrouter" | "together";

export type AiModelBadge = "pro" | "quick" | "free";

export type AiModelDefinition = {
  id: string;
  label: string;
  provider: AiProvider;
  model: string;
  description: string;
  requiresKey: boolean;
  supportsStreaming: boolean;
  badge?: AiModelBadge;
};

export const AI_MODELS: AiModelDefinition[] = [
  {
    id: "groq:openai/gpt-oss-120b",
    label: "NextGrades Pro",
    provider: "groq",
    model: "openai/gpt-oss-120b",
    description: "Our smartest tutor - detailed explanations for exams & homework",
    requiresKey: true,
    supportsStreaming: true,
    badge: "pro",
  },
  {
    id: "groq:openai/gpt-oss-20b",
    label: "NextGrades Quick",
    provider: "groq",
    model: "openai/gpt-oss-20b",
    description: "Instant answers when you need help right away",
    requiresKey: true,
    supportsStreaming: true,
    badge: "quick",
  },
  {
    id: "pollinations:openai",
    label: "NextGrades Lite",
    provider: "pollinations",
    model: "openai",
    description: "Free learning assistant - available when a Pollinations key is set",
    requiresKey: true,
    supportsStreaming: false,
    badge: "free",
  },
  {
    id: "pollinations:openai-fast",
    label: "NextGrades Spark",
    provider: "pollinations",
    model: "openai-fast",
    description: "Free tutor for practice, revision & everyday questions",
    requiresKey: true,
    supportsStreaming: false,
    badge: "free",
  },
  {
    id: "openrouter:meta-llama/llama-3.1-8b-instruct:free",
    label: "NextGrades Cloud",
    provider: "openrouter",
    model: "meta-llama/llama-3.1-8b-instruct:free",
    description: "Cloud-powered assistant for reliable study support",
    requiresKey: true,
    supportsStreaming: true,
    badge: "free",
  },
  {
    id: "together:meta-llama/Meta-Llama-3-8B-Instruct-Lite",
    label: "NextGrades Edge",
    provider: "together",
    model: "meta-llama/Meta-Llama-3-8B-Instruct-Lite",
    description: "Backup assistant when you need an extra hand",
    requiresKey: true,
    supportsStreaming: true,
    badge: "quick",
  },
];

export const DEFAULT_MODEL_ID = "groq:openai/gpt-oss-120b";

/** Groq retired Llama 3.1/3.3 on 16 Aug 2026 — map stored prefs to current IDs. */
const MODEL_ALIASES: Record<string, string> = {
  "groq:llama-3.3-70b-versatile": "groq:openai/gpt-oss-120b",
  "llama-3.3-70b-versatile": "groq:openai/gpt-oss-120b",
  "groq:llama-3.1-8b-instant": "groq:openai/gpt-oss-20b",
  "llama-3.1-8b-instant": "groq:openai/gpt-oss-20b",
};

export function groqRuntimeModel(fallback = "openai/gpt-oss-20b"): string {
  const env = process.env.GROQ_MODEL?.trim();
  if (!env) return fallback;
  const aliased = MODEL_ALIASES[env] ?? MODEL_ALIASES[`groq:${env}`];
  if (aliased) return aliased.replace(/^groq:/, "");
  return env;
}

export function parseModelId(modelId: string): { provider: AiProvider; model: string } {
  const def = AI_MODELS.find((m) => m.id === modelId);
  if (def) return { provider: def.provider, model: def.model };

  const colon = modelId.indexOf(":");
  if (colon > 0) {
    const provider = modelId.slice(0, colon) as AiProvider;
    return { provider, model: modelId.slice(colon + 1) };
  }

  return { provider: "groq", model: modelId };
}

export function resolveModelId(preferred?: string | null): string {
  const available = getAvailableModels();
  const mapped = preferred ? (MODEL_ALIASES[preferred] ?? preferred) : preferred;
  if (mapped && available.some((m) => m.id === mapped)) return mapped;
  if (mapped) {
    const legacy = available.find((m) => m.model === mapped || m.id === mapped);
    if (legacy) return legacy.id;
  }
  return available[0]?.id ?? DEFAULT_MODEL_ID;
}

export function getAvailableModels(): AiModelDefinition[] {
  const hasGroq = !!process.env.GROQ_API_KEY?.trim();
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY?.trim();
  const hasTogether = !!process.env.TOGETHER_API_KEY?.trim();
  const hasPollinations = !!process.env.POLLINATIONS_API_KEY?.trim();

  return AI_MODELS.filter((m) => {
    if (m.provider === "groq") return hasGroq;
    if (m.provider === "openrouter") return hasOpenRouter;
    if (m.provider === "together") return hasTogether;
    if (m.provider === "pollinations") return hasPollinations;
    return !m.requiresKey;
  });
}

export function isAnyModelAvailable(): boolean {
  return getAvailableModels().length > 0;
}

export function getModelDefinition(modelId: string): AiModelDefinition | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}
