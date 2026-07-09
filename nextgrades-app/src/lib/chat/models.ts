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
    id: "groq:llama-3.3-70b-versatile",
    label: "NextGrades Pro",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    description: "Our smartest tutor - detailed explanations for exams & homework",
    requiresKey: true,
    supportsStreaming: true,
    badge: "pro",
  },
  {
    id: "groq:llama-3.1-8b-instant",
    label: "NextGrades Quick",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    description: "Instant answers when you need help right away",
    requiresKey: true,
    supportsStreaming: true,
    badge: "quick",
  },
  {
    id: "pollinations:openai-large",
    label: "NextGrades Lite",
    provider: "pollinations",
    model: "openai-large",
    description: "Free learning assistant - available to every student",
    requiresKey: false,
    supportsStreaming: false,
    badge: "free",
  },
  {
    id: "pollinations:deepseek",
    label: "NextGrades Spark",
    provider: "pollinations",
    model: "deepseek",
    description: "Free tutor for practice, revision & everyday questions",
    requiresKey: false,
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

export const DEFAULT_MODEL_ID = "groq:llama-3.3-70b-versatile";

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
  if (preferred && AI_MODELS.some((m) => m.id === preferred)) return preferred;
  if (preferred) {
    const legacy = AI_MODELS.find((m) => m.model === preferred);
    if (legacy) return legacy.id;
  }
  return DEFAULT_MODEL_ID;
}

export function getAvailableModels(): AiModelDefinition[] {
  const hasGroq = !!process.env.GROQ_API_KEY?.trim();
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY?.trim();
  const hasTogether = !!process.env.TOGETHER_API_KEY?.trim();

  return AI_MODELS.filter((m) => {
    if (m.requiresKey) {
      if (m.provider === "groq") return hasGroq;
      if (m.provider === "openrouter") return hasOpenRouter;
      if (m.provider === "together") return hasTogether;
      return false;
    }
    return true;
  });
}

export function isAnyModelAvailable(): boolean {
  return getAvailableModels().length > 0;
}

export function getModelDefinition(modelId: string): AiModelDefinition | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}
