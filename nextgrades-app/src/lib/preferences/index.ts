import { normalizeLanguage, type SupportedLanguage } from "@/lib/i18n/locales";

export type UiTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";

export const THEME_CHANGED_EVENT = "nextgrades:theme-changed";
export const LANGUAGE_CHANGED_EVENT = "nextgrades:language-changed";

export type UserPreferences = {
  theme: UiTheme | null;
  language: SupportedLanguage | null;
};

function parseTheme(value: string | null | undefined): UiTheme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getStoredTheme(): UiTheme {
  if (typeof window === "undefined") return "dark";
  return parseTheme(localStorage.getItem(THEME_STORAGE_KEY)) ?? "dark";
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function applyThemeToDocument(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function applyLanguageToDocument(language: SupportedLanguage): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
}

export function persistThemeLocally(theme: UiTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyThemeToDocument(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
}

export function persistLanguageLocally(language: SupportedLanguage): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  applyLanguageToDocument(language);
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: language }));
}

let remoteSaveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingRemote: Partial<{ theme: UiTheme; language: SupportedLanguage }> = {};

export async function fetchRemotePreferences(): Promise<UserPreferences | null> {
  try {
    const res = await fetch("/api/user/preferences", { cache: "no-store" });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as {
      preferences?: { theme?: string | null; language?: string | null };
    };
    return {
      theme: parseTheme(data.preferences?.theme ?? null),
      language: data.preferences?.language
        ? normalizeLanguage(data.preferences.language)
        : null,
    };
  } catch {
    return null;
  }
}

export async function saveRemotePreferences(
  prefs: Partial<{ theme: UiTheme; language: SupportedLanguage }>
): Promise<void> {
  Object.assign(pendingRemote, prefs);
  if (remoteSaveTimer) clearTimeout(remoteSaveTimer);

  remoteSaveTimer = setTimeout(async () => {
    const payload = { ...pendingRemote };
    pendingRemote = {};
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      /* ignore network errors — localStorage remains source for offline */
    }
  }, 300);
}

export async function flushRemotePreferences(): Promise<void> {
  if (remoteSaveTimer) {
    clearTimeout(remoteSaveTimer);
    remoteSaveTimer = null;
  }
  if (!Object.keys(pendingRemote).length) return;
  const payload = { ...pendingRemote };
  pendingRemote = {};
  try {
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* ignore */
  }
}

export function setAppTheme(theme: UiTheme, options?: { skipRemote?: boolean }): void {
  persistThemeLocally(theme);
  if (!options?.skipRemote) void saveRemotePreferences({ theme });
}

export async function setAppLanguage(
  language: SupportedLanguage,
  changeI18n?: (lang: SupportedLanguage) => Promise<void> | void,
  options?: { skipRemote?: boolean }
): Promise<void> {
  persistLanguageLocally(language);
  if (changeI18n) await changeI18n(language);
  if (!options?.skipRemote) void saveRemotePreferences({ language });
}

/** After login: DB wins when set; otherwise push current local prefs to DB. */
export async function syncPreferencesAfterAuth(
  changeI18n?: (lang: SupportedLanguage) => Promise<void> | void
): Promise<void> {
  const localTheme = getStoredTheme();
  const localLanguage = getStoredLanguage();
  const remote = await fetchRemotePreferences();

  if (!remote) return;

  const theme = remote.theme ?? localTheme;
  const language = remote.language ?? localLanguage;

  setAppTheme(theme, { skipRemote: true });
  await setAppLanguage(language, changeI18n, { skipRemote: true });

  const toSave: Partial<{ theme: UiTheme; language: SupportedLanguage }> = {};
  if (!remote.theme) toSave.theme = localTheme;
  if (!remote.language) toSave.language = localLanguage;
  if (Object.keys(toSave).length) await saveRemotePreferences(toSave);
  await flushRemotePreferences();
}

/** Bootstrap script injected in layout `<head>`. */
export const PREFERENCES_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var theme=t==='light'?'light':'dark';document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.style.colorScheme=theme;var l=localStorage.getItem('${LANGUAGE_STORAGE_KEY}');if(l){var lang=l.toLowerCase().split('-')[0];document.documentElement.lang=lang==='de'?'de':'en';}}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;
