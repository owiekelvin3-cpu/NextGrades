export type ChatRole = "student" | "teacher" | "admin";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  subject_id: string | null;
  class_id: string | null;
  material_id: string | null;
  semester: string | null;
  topic: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: ChatMessageRole;
  content: string;
  tokens_used: number;
  model: string | null;
  created_at: string;
};

export type ChatbotPreferences = {
  user_id: string;
  preferred_model: string | null;
  response_language: "de" | "en";
  show_suggestions: boolean;
  compact_mode: boolean;
  theme: "auto" | "light" | "dark";
  updated_at: string;
};

export type ChatbotSettings = {
  id: string;
  enabled: boolean;
  streaming_enabled: boolean;
  rag_enabled: boolean;
  max_messages_per_minute: number;
  default_model: string;
  system_prompt_override: string | null;
  updated_at: string;
};

export type ChatContext = {
  role: ChatRole;
  userName: string | null;
  subject?: string;
  classLevel?: string;
  semester?: string;
  topic?: string;
  materialTitle?: string;
  materialExcerpt?: string;
};

export type StreamChatRequest = {
  sessionId?: string;
  message: string;
  materialId?: string;
  subjectId?: string;
  classId?: string;
  semester?: string;
  topic?: string;
  regenerate?: boolean;
  responseLanguage?: "de" | "en";
  modelId?: string;
};

export type AiModelInfo = {
  id: string;
  label: string;
  provider: string;
  description: string;
  requiresKey: boolean;
  supportsStreaming: boolean;
  badge?: "pro" | "quick" | "free";
};
