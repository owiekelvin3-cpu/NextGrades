export type UserProfileSettings = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  learning_goal: string | null;
  avatar_url: string | null;
  timezone: string | null;
  role: string;
  subscription_status?: string | null;
  created_at?: string;
};

export type ProfileUpdatePayload = {
  full_name?: string;
  phone?: string | null;
  bio?: string | null;
  learning_goal?: string | null;
  timezone?: string | null;
};

export type NotificationPrefs = {
  emailLessons: boolean;
  emailMaterials: boolean;
  emailMarketing: boolean;
};

const NOTIF_KEY = "nextgrades_notification_prefs";

const PROFILE_CACHE_MS = 5 * 60 * 1000;
let profileCache: { data: UserProfileSettings; at: number } | null = null;

export function invalidateProfileCache(): void {
  profileCache = null;
}

export function notifyProfileUpdated(profile?: Partial<UserProfileSettings>) {
  if (profileCache?.data && profile) {
    profileCache = { data: { ...profileCache.data, ...profile }, at: profileCache.at };
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nextgrades:profile-updated", { detail: profile }));
  }
}

export async function fetchProfileSettings(force = false): Promise<UserProfileSettings | null> {
  if (!force && profileCache && Date.now() - profileCache.at < PROFILE_CACHE_MS) {
    return profileCache.data;
  }

  try {
    const res = await fetch("/api/profile", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { profile?: UserProfileSettings };
    const profile = data.profile ?? null;
    if (profile) profileCache = { data: profile, at: Date.now() };
    return profile;
  } catch {
    return null;
  }
}

export async function updateProfileSettings(
  payload: ProfileUpdatePayload
): Promise<{ error: string | null; profile?: UserProfileSettings | null }> {
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; profile?: UserProfileSettings };
    if (!res.ok) return { error: data.error ?? "Failed to save profile" };
    invalidateProfileCache();
    notifyProfileUpdated(data.profile ?? undefined);
    return { error: null, profile: data.profile ?? null };
  } catch {
    return { error: "Network error - could not save profile" };
  }
}

export async function uploadProfileAvatar(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Please upload an image file" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: "Image must be under 5 MB" };
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) return { url: null, error: data.error ?? "Upload failed" };
    notifyProfileUpdated({ avatar_url: data.url ?? null });
    return { url: data.url ?? null, error: null };
  } catch {
    return { url: null, error: "Network error - could not upload photo" };
  }
}

export async function removeProfileAvatar(): Promise<{ error: string | null }> {
  try {
    const res = await fetch("/api/profile/avatar", { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) return { error: data.error ?? "Failed to remove photo" };
    notifyProfileUpdated({ avatar_url: null });
    return { error: null };
  } catch {
    return { error: "Network error - could not remove photo" };
  }
}

export async function changePassword(newPassword: string): Promise<{ error: string | null }> {
  if (!newPassword.trim()) return { error: "Please enter a new password" };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };

  const { supabase } = await import("@/lib/supabase/client");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

export async function saveChatLanguage(language: "de" | "en"): Promise<{ error: string | null }> {
  try {
    const res = await fetch("/api/chat/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response_language: language }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) return { error: data.error ?? "Failed to save AI language" };
    return { error: null };
  } catch {
    return { error: "Network error - could not save AI language" };
  }
}

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") {
    return { emailLessons: true, emailMaterials: true, emailMarketing: false };
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw) as NotificationPrefs;
  } catch {
    /* ignore */
  }
  return { emailLessons: true, emailMaterials: true, emailMarketing: false };
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

export const TIMEZONE_OPTIONS = [
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Vienna", label: "Vienna (CET)" },
  { value: "Europe/Zurich", label: "Zurich (CET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];
