export function publicChatErrorMessage(err: unknown, language: "de" | "en" = "de"): string {
  const raw = err instanceof Error ? err.message : String(err);

  if (
    /nicht erreichbar|nicht erstellt werden|temporarily unavailable|Could not generate a reply/i.test(
      raw
    )
  ) {
    return raw;
  }

  const unavailable =
    /403|401|402|429|Text API|Pollinations|No AI models|not configured|Groq|OpenRouter|Together|Request failed|Generation failed|Failed to send/i.test(
      raw
    );

  if (language === "de") {
    return unavailable
      ? "Die KI ist gerade nicht erreichbar. Bitte versuche es in einer Minute erneut."
      : "Die Antwort konnte nicht erstellt werden. Bitte versuche es erneut.";
  }

  return unavailable
    ? "The AI is temporarily unavailable. Please try again in a minute."
    : "Could not generate a reply. Please try again.";
}
