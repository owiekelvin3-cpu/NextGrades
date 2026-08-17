import { normalizeLanguage, type SupportedLanguage } from "@/lib/i18n/locales";

export type UiTheme = "light" | "dark";

/** Site is dark-only; light mode is no longer offered. */
export const APP_THEME: UiTheme = "dark";

export const THEME_STORAGE_KEY = "theme";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";
/** Set when the user explicitly picks a language (navbar, settings, etc.). */
export const LANGUAGE_USER_SET_KEY = "nextgrades:language-user-set";
export const LANGUAGE_USER_SET_COOKIE = "nextgrades_lang_user_set";
/** One-time reset: leftover i18nextLng=en was previously treated as a user choice. */
export const LANGUAGE_DEFAULT_MIGRATION_KEY = "nextgrades:lang-default-de-v2";

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
  return APP_THEME;
}

/** Theme for SSR - read from the `theme` cookie set by preferences-init / persistThemeLocally. */
export function getThemeFromCookieValue(_value: string | null | undefined): UiTheme {
  return APP_THEME;
}

export function persistThemeCookie(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_STORAGE_KEY}=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "de";
  if (!hasUserSetLanguage()) return "de";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) return "de";
  return normalizeLanguage(stored);
}

export function hasUserSetLanguage(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LANGUAGE_USER_SET_KEY) === "1";
}

export function persistLanguageUserSetCookie(userSet: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = userSet ? 60 * 60 * 24 * 365 : 0;
  document.cookie = `${LANGUAGE_USER_SET_COOKIE}=${userSet ? "1" : ""};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function markLanguageAsUserSet(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_USER_SET_KEY, "1");
  persistLanguageUserSetCookie(true);
}

/** One-time: leftover English storage is not a real choice. Default the site to German. */
export function migrateLegacyLanguagePreference(): void {
  if (typeof window === "undefined") return;

  const migrated = localStorage.getItem(LANGUAGE_DEFAULT_MIGRATION_KEY) === "1";
  if (!migrated) {
    localStorage.setItem(LANGUAGE_DEFAULT_MIGRATION_KEY, "1");
    localStorage.removeItem(LANGUAGE_USER_SET_KEY);
    persistLanguageUserSetCookie(false);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "de");
    persistLanguageCookie("de");
    applyLanguageToDocument("de");
    return;
  }

  if (hasUserSetLanguage()) {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) persistLanguageCookie(normalizeLanguage(stored));
    persistLanguageUserSetCookie(true);
    return;
  }

  localStorage.setItem(LANGUAGE_STORAGE_KEY, "de");
  persistLanguageCookie("de");
  persistLanguageUserSetCookie(false);
}

export function applyThemeToDocument(_theme?: UiTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = APP_THEME;
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

export function persistThemeLocally(_theme?: UiTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, APP_THEME);
  persistThemeCookie(APP_THEME);
  applyThemeToDocument(APP_THEME);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: APP_THEME }));
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

export function setAppTheme(_theme?: UiTheme, options?: { skipRemote?: boolean }): void {
  persistThemeLocally(APP_THEME);
  if (!options?.skipRemote) void saveRemotePreferences({ theme: APP_THEME });
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

  const localLanguage = getStoredLanguage();
  const userSetLanguage = hasUserSetLanguage();
  const remote = await fetchRemotePreferences();

  if (!remote) return;

  let language: SupportedLanguage;
  if (userSetLanguage) {
    language = localLanguage;
  } else {
    language = "de";
  }

  setAppTheme(APP_THEME, { skipRemote: true });
  await setAppLanguage(language, changeI18n, { skipRemote: true, userInitiated: false });

  if (!userSetLanguage) {
    persistLanguageLocally("de", { userInitiated: false });
  }

  const toSave: Partial<{ theme: UiTheme; language: SupportedLanguage }> = {};
  if (remote.theme !== APP_THEME) toSave.theme = APP_THEME;
  if (userSetLanguage && language !== remote.language) {
    toSave.language = language;
  } else if (!remote.language && !userSetLanguage) {
    toSave.language = language;
  }

  if (Object.keys(toSave).length) await saveRemotePreferences(toSave);
  await flushRemotePreferences();
}

/** Theme/language bootstrap runs via `PreferencesBootstrap` (useLayoutEffect) in root layout. */
