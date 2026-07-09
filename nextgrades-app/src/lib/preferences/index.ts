import { normalizeLanguage, type SupportedLanguage } from "@/lib/i18n/locales";

export type UiTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";
/** Set when the user explicitly picks a language (navbar, settings, etc.). */
export const LANGUAGE_USER_SET_KEY = "nextgrades:language-user-set";

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

/** Theme for SSR - read from the `theme` cookie set by preferences-init / persistThemeLocally. */
export function getThemeFromCookieValue(value: string | null | undefined): UiTheme {
  return parseTheme(value) ?? "dark";
}

export function persistThemeCookie(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_STORAGE_KEY}=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "de";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) return "de";
  return normalizeLanguage(stored);
}

export function hasUserSetLanguage(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LANGUAGE_USER_SET_KEY) === "1";
}

export function markLanguageAsUserSet(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_USER_SET_KEY, "1");
}

/** One-time: treat existing English localStorage as an explicit user choice. */
export function migrateLegacyLanguagePreference(): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) {
    persistLanguageCookie(normalizeLanguage(stored));
  }
  if (hasUserSetLanguage()) return;
  if (stored && normalizeLanguage(stored) === "en") {
    markLanguageAsUserSet();
  }
}

export function applyThemeToDocument(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

/** Adds global transition class during theme switch (see design-tokens.css). */
export function beginThemeAnimation(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("theme-animate");
}

export function endThemeAnimation(delayMs = 360): void {
  if (typeof document === "undefined") return;
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-animate");
  }, delayMs);
}

export function applyLanguageToDocument(language: SupportedLanguage): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
}

export function persistThemeLocally(theme: UiTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  persistThemeCookie(theme);
  applyThemeToDocument(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
}

export function persistLanguageCookie(language: SupportedLanguage): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${encodeURIComponent(language)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function persistLanguageLocally(
  language: SupportedLanguage,
  options?: { userInitiated?: boolean }
): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  persistLanguageCookie(language);
  if (options?.userInitiated) {
    markLanguageAsUserSet();
  }
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
      /* ignore network errors - localStorage remains source for offline */
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
  options?: { skipRemote?: boolean; userInitiated?: boolean }
): Promise<void> {
  persistLanguageLocally(language, { userInitiated: options?.userInitiated ?? true });
  if (changeI18n) await changeI18n(language);
  if (!options?.skipRemote) void saveRemotePreferences({ language });
}

/** After login: keep explicit local language choice; otherwise use saved account preference. */
export async function syncPreferencesAfterAuth(
  changeI18n?: (lang: SupportedLanguage) => Promise<void> | void
): Promise<void> {
  migrateLegacyLanguagePreference();

  const localTheme = getStoredTheme();
  const localLanguage = getStoredLanguage();
  const userSetLanguage = hasUserSetLanguage();
  const remote = await fetchRemotePreferences();

  if (!remote) return;

  const theme = remote.theme ?? localTheme;

  let language: SupportedLanguage;
  if (userSetLanguage) {
    language = localLanguage;
  } else if (remote.language) {
    language = remote.language;
  } else {
    language = localLanguage;
  }

  setAppTheme(theme, { skipRemote: true });
  await setAppLanguage(language, changeI18n, { skipRemote: true, userInitiated: false });

  if (!userSetLanguage && remote.language) {
    persistLanguageLocally(remote.language, { userInitiated: false });
  }

  const toSave: Partial<{ theme: UiTheme; language: SupportedLanguage }> = {};
  if (!remote.theme) toSave.theme = localTheme;
  if (userSetLanguage && language !== remote.language) {
    toSave.language = language;
  } else if (!remote.language && !userSetLanguage) {
    toSave.language = language;
  }

  if (Object.keys(toSave).length) await saveRemotePreferences(toSave);
  await flushRemotePreferences();
}

/** Theme/language bootstrap runs via `PreferencesBootstrap` (useLayoutEffect) in root layout. */
