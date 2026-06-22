"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  User,
  Shield,
  Bell,
  Palette,
  Sparkles,
  CreditCard,
  LogOut,
  KeyRound,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { ProfileAvatarUpload } from "./ProfileAvatarUpload";
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsTextarea,
  SettingsSelect,
  SettingsToggle,
  SettingsToggleGroup,
  SettingsSaveBar,
} from "./SettingsCard";
import { ZoomConnectCard } from "@/components/zoom/ZoomConnectCard";
import {
  fetchProfileSettings,
  updateProfileSettings,
  uploadProfileAvatar,
  removeProfileAvatar,
  changePassword,
  saveChatLanguage,
  TIMEZONE_OPTIONS,
  type UserProfileSettings,
} from "@/lib/dashboard/profile-settings";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/notifications/push-client";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  type NotificationPreferences,
} from "@/lib/notifications/types";
import { categoryLabel } from "@/lib/notifications/format";
import { sendPasswordChangedEmail } from "@/lib/email";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, normalizeLanguage } from "@/lib/i18n/locales";
import { changeAppLanguage } from "@/components/I18nProvider";
import { setAppLanguage, flushRemotePreferences } from "@/lib/preferences";
import { parseChatResponseLanguage, type ChatResponseLanguage } from "@/lib/chat/languages";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "account" | "preferences" | "notifications" | "subscription" | "teaching";

const TABS: { id: SettingsTab; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { id: "profile", icon: User, labelKey: "settings.tabs.profile" },
  { id: "account", icon: Shield, labelKey: "settings.tabs.account" },
  { id: "preferences", icon: Palette, labelKey: "settings.tabs.preferences" },
  { id: "notifications", icon: Bell, labelKey: "settings.tabs.notifications" },
  { id: "subscription", icon: CreditCard, labelKey: "settings.tabs.subscription" },
];

interface StudentSettingsPanelProps {
  role?: "student" | "teacher";
}

export function StudentSettingsPanel({ role = "student" }: StudentSettingsPanelProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const isTeacher = role === "teacher";

  const [tab, setTab] = useState<SettingsTab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileSettings | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [aiLanguage, setAiLanguage] = useState<ChatResponseLanguage>("de");
  const notifCtx = useNotificationsOptional();
  const [notifs, setNotifs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchProfileSettings();
    if (data) {
      setProfile(data);
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setBio(data.bio ?? "");
      setLearningGoal(data.learning_goal ?? "");
      setTimezone(data.timezone ?? "Europe/Berlin");
      setAvatarUrl(data.avatar_url);
    }
    try {
      const res = await fetch("/api/chat/preferences");
      if (res.ok) {
        const json = await res.json();
        setAiLanguage(parseChatResponseLanguage(json.preferences?.response_language));
      }
    } catch {
      /* ignore */
    }
    setNotifs(notifCtx?.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES);
    if (!notifCtx?.preferences) {
      fetch("/api/user/notification-preferences")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.preferences) setNotifs(json.preferences);
        })
        .catch(() => {});
    }
    setLoading(false);
  }, [notifCtx?.preferences]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error(t("settings.nameRequired", { defaultValue: "Please enter your full name" }));
      return;
    }
    setSaving(true);
    const { error, profile: updated } = await updateProfileSettings({
      full_name: fullName,
      phone: phone || null,
      bio: isTeacher ? bio || null : undefined,
      learning_goal: isTeacher ? undefined : learningGoal || null,
    });
    setSaving(false);
    if (error) toast.error(error);
    else {
      if (updated) setProfile(updated);
      toast.success(t("settings.saved", { defaultValue: "Settings saved" }));
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    const lang = normalizeLanguage(i18n.language);
    await setAppLanguage(lang, (l) => changeAppLanguage(l));

    const [profileResult, chatResult] = await Promise.all([
      updateProfileSettings({ timezone }),
      saveChatLanguage(aiLanguage),
      flushRemotePreferences(),
    ]);
    setSaving(false);

    if (profileResult.error) toast.error(profileResult.error);
    else if (chatResult.error) toast.error(chatResult.error);
    else toast.success(t("settings.saved", { defaultValue: "Settings saved" }));
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifs),
      });
      if (!res.ok) {
        toast.error(t("settings.saveFailed", { defaultValue: "Could not save settings" }));
        return;
      }
      if (notifCtx) await notifCtx.updatePreferences(notifs);
      toast.success(t("settings.saved", { defaultValue: "Settings saved" }));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePush = async (enabled: boolean) => {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      if (enabled) {
        const ok = await subscribeToPush();
        if (!ok) {
          toast.error(t("notifications.pushDenied", { defaultValue: "Push notifications were not enabled." }));
          return;
        }
      } else {
        await unsubscribeFromPush();
      }
      setNotifs((p) => ({ ...p, pushEnabled: enabled }));
    } finally {
      setPushLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      toast.error(t("settings.passwordRequired", { defaultValue: "Please enter a new password" }));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch", { defaultValue: "Passwords do not match" }));
      return;
    }
    setChangingPassword(true);
    const { error } = await changePassword(newPassword);
    setChangingPassword(false);
    if (error) toast.error(error);
    else {
      toast.success(t("settings.passwordUpdated", { defaultValue: "Password updated" }));
      if (profile?.email) void sendPasswordChangedEmail(profile.email, fullName || profile.full_name || undefined);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase/client");
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) return <LoadingBlock />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border-default bg-surface-elevated p-8 text-center text-text-muted shadow-sm">
        <p>{t("settings.loadError", { defaultValue: "Could not load your profile. Please sign in again." })}</p>
        <Button variant="gold" size="sm" href="/login" className="mt-4">
          {t("common.login", { defaultValue: "Log in" })}
        </Button>
      </div>
    );
  }

  const visibleTabs = (isTeacher
    ? [
        ...TABS.filter((x) => x.id !== "subscription"),
        { id: "teaching" as const, icon: BookOpen, labelKey: "settings.tabs.teaching" },
      ]
    : TABS);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Sidebar nav */}
      <nav className="shrink-0 lg:w-56">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {visibleTabs.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                tab === id
                  ? "bg-[#D4AF37] text-[#0D1B2A] shadow-sm"
                  : "bg-surface-elevated text-text-muted hover:bg-[var(--table-row-hover)] hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey, { defaultValue: id })}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-6">
        {tab === "profile" && (
          <>
            <SettingsCard
              title={t("settings.profilePhoto", { defaultValue: "Profile photo" })}
              description={t("settings.profilePhotoDesc", { defaultValue: "This appears on your dashboard and in lessons." })}
              icon={User}
            >
              <ProfileAvatarUpload
                avatarUrl={avatarUrl}
                name={fullName}
                onUpload={async (file) => {
                  const { url, error } = await uploadProfileAvatar(file);
                  if (error) toast.error(error);
                  else if (url) {
                    setAvatarUrl(url);
                    toast.success(t("settings.photoUpdated", { defaultValue: "Photo updated" }));
                  }
                }}
                onRemove={async () => {
                  const { error } = await removeProfileAvatar();
                  if (error) toast.error(error);
                  else {
                    setAvatarUrl(null);
                    toast.success(t("settings.photoRemoved", { defaultValue: "Photo removed" }));
                  }
                }}
              />
            </SettingsCard>

            <SettingsCard
              title={t("settings.personalInfo", { defaultValue: "Personal information" })}
              icon={User}
            >
              <div className="space-y-4">
                <SettingsField label={t("login.fullName", { defaultValue: "Full name" })}>
                  <SettingsInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </SettingsField>
                <SettingsField label={t("settings.phone", { defaultValue: "Phone number" })} hint={t("settings.phoneHint", { defaultValue: "Optional — for appointment reminders" })}>
                  <SettingsInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+43 670 …" />
                </SettingsField>
                {isTeacher ? (
                  <SettingsField label={t("settings.bio", { defaultValue: "About you" })} hint={t("settings.bioHint", { defaultValue: "Shown to students — experience, subjects, teaching style" })}>
                    <SettingsTextarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("settings.bioPlaceholder", { defaultValue: "Tell students about your teaching experience…" })} />
                  </SettingsField>
                ) : (
                  <SettingsField label={t("studentDashboard.yourGoal", { defaultValue: "Learning goal" })} hint={t("settings.goalHint", { defaultValue: "Displayed on your dashboard" })}>
                    <SettingsTextarea rows={3} value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)} placeholder={t("settings.goalPlaceholder", { defaultValue: "e.g. Pass my Abitur in Mathematics with grade 1…" })} />
                  </SettingsField>
                )}
              </div>
              <SettingsSaveBar saving={saving} onSave={() => void handleSaveProfile()} label={t("settings.save", { defaultValue: "Save changes" })} savingLabel={t("settings.saving", { defaultValue: "Saving…" })} />
            </SettingsCard>
          </>
        )}

        {tab === "account" && (
          <>
            <SettingsCard title={t("settings.accountInfo", { defaultValue: "Account" })} icon={Shield}>
              <div className="space-y-4">
                <SettingsField label={t("login.email", { defaultValue: "Email" })} hint={t("settings.emailHint", { defaultValue: "Contact support to change your email address" })}>
                  <SettingsInput value={profile?.email ?? ""} readOnly disabled className="bg-gray-100 text-gray-500" />
                </SettingsField>
                <SettingsField label={t("settings.memberSince", { defaultValue: "Member since" })}>
                  <SettingsInput
                    value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                    readOnly
                    disabled
                    className="bg-gray-100 text-gray-500"
                  />
                </SettingsField>
              </div>
            </SettingsCard>

            <SettingsCard title={t("settings.changePassword", { defaultValue: "Change password" })} description={t("settings.changePasswordDesc", { defaultValue: "Use a strong password with at least 8 characters" })} icon={KeyRound}>
              <div className="space-y-4">
                <SettingsField label={t("settings.newPassword", { defaultValue: "New password" })}>
                  <SettingsInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </SettingsField>
                <SettingsField label={t("settings.confirmPassword", { defaultValue: "Confirm password" })}>
                  <SettingsInput type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </SettingsField>
              </div>
              <SettingsSaveBar saving={changingPassword} onSave={() => void handlePasswordChange()} label={t("settings.updatePassword", { defaultValue: "Update password" })} savingLabel={t("settings.saving", { defaultValue: "Saving…" })} />
            </SettingsCard>

            <SettingsCard title={t("settings.session", { defaultValue: "Session" })} icon={LogOut}>
              <p className="mb-4 text-sm text-gray-500">{t("settings.signOutDesc", { defaultValue: "Sign out of your account on this device." })}</p>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                {t("dashboardNav.logout", { defaultValue: "Log out" })}
              </button>
            </SettingsCard>
          </>
        )}

        {tab === "preferences" && (
          <SettingsCard title={t("settings.preferencesTitle", { defaultValue: "Preferences" })} icon={Palette}>
            <div className="space-y-5">
              <SettingsField label={t("settings.language", { defaultValue: "Language" })}>
                <SettingsSelect
                  value={normalizeLanguage(i18n.language)}
                  onChange={(e) => void setAppLanguage(normalizeLanguage(e.target.value), (lang) => changeAppLanguage(lang))}
                >
                  {SUPPORTED_LANGUAGES.map((code) => (
                    <option key={code} value={code}>
                      {LANGUAGE_LABELS[code]}
                    </option>
                  ))}
                </SettingsSelect>
              </SettingsField>

              <SettingsField label={t("settings.theme", { defaultValue: "Appearance" })}>
                <div className="grid grid-cols-2 gap-3">
                  {(["light", "dark"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-3 text-sm font-medium transition",
                        theme === mode
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                          : theme === "dark"
                            ? "border-white/15 bg-[#0D1B2A] text-gray-300 hover:border-white/25"
                            : "border-border-default bg-surface-subtle text-text-muted hover:border-border-default"
                      )}
                    >
                      {mode === "light" ? t("settings.lightMode", { defaultValue: "Light" }) : t("settings.darkMode", { defaultValue: "Dark" })}
                    </button>
                  ))}
                </div>
              </SettingsField>

              <SettingsField label={t("settings.timezone", { defaultValue: "Timezone" })}>
                <SettingsSelect value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </SettingsSelect>
              </SettingsField>

              <SettingsField label={t("settings.aiLanguage", { defaultValue: "NextGrades AI language" })} hint={t("settings.aiLanguageHint", { defaultValue: "Default language for AI assistant replies" })}>
                <div className="flex gap-2">
                  {(["de", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setAiLanguage(lang)}
                      className={cn(
                        "rounded-xl border-2 px-5 py-2 text-sm font-semibold transition",
                        aiLanguage === lang
                          ? "border-[#D4AF37] bg-[var(--brand-gold-muted)] text-foreground"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {lang === "de" ? "Deutsch" : "English"}
                    </button>
                  ))}
                </div>
              </SettingsField>
            </div>
            <SettingsSaveBar saving={saving} onSave={() => void handleSavePreferences()} />
          </SettingsCard>
        )}

        {tab === "notifications" && (
          <SettingsCard title={t("settings.notificationsTitle", { defaultValue: "Notifications" })} icon={Bell}>
            <div className="space-y-6">
              <SettingsToggleGroup
                title={t("notifications.prefs.delivery", { defaultValue: "How you're notified" })}
              >
                <SettingsToggle
                  variant="row"
                  label={t("notifications.prefs.push", { defaultValue: "Push notifications" })}
                  description={t("notifications.prefs.pushDesc", { defaultValue: "Browser alerts when you're away" })}
                  checked={notifs.pushEnabled}
                  loading={pushLoading}
                  onChange={(v) => void handleTogglePush(v)}
                />
                <SettingsToggle
                  variant="row"
                  label={t("notifications.prefs.sound", { defaultValue: "Notification sounds" })}
                  description={t("notifications.prefs.soundDesc", { defaultValue: "Play a subtle sound for new alerts" })}
                  checked={notifs.soundEnabled}
                  onChange={(v) => setNotifs((p) => ({ ...p, soundEnabled: v }))}
                />
                <SettingsToggle
                  variant="row"
                  label={t("notifications.prefs.email", { defaultValue: "Email notifications" })}
                  description={t("notifications.prefs.emailDesc", { defaultValue: "Receive important updates by email" })}
                  checked={notifs.emailEnabled}
                  onChange={(v) => setNotifs((p) => ({ ...p, emailEnabled: v }))}
                />
              </SettingsToggleGroup>

              <SettingsToggleGroup
                title={t("notifications.prefs.emailTopics", { defaultValue: "Email topics" })}
              >
                <SettingsToggle
                  variant="row"
                  label={t("settings.notifLessons", { defaultValue: "Lesson reminders" })}
                  description={t("settings.notifLessonsDesc", { defaultValue: "Email before upcoming appointments" })}
                  checked={notifs.emailLessons}
                  onChange={(v) => setNotifs((p) => ({ ...p, emailLessons: v }))}
                />
                <SettingsToggle
                  variant="row"
                  label={t("settings.notifMaterials", { defaultValue: "New materials" })}
                  description={t("settings.notifMaterialsDesc", { defaultValue: "When new study resources are added" })}
                  checked={notifs.emailMaterials}
                  onChange={(v) => setNotifs((p) => ({ ...p, emailMaterials: v }))}
                />
                <SettingsToggle
                  variant="row"
                  label={t("settings.notifMarketing", { defaultValue: "Tips & updates" })}
                  description={t("settings.notifMarketingDesc", { defaultValue: "Learning tips and platform news" })}
                  checked={notifs.emailMarketing}
                  onChange={(v) => setNotifs((p) => ({ ...p, emailMarketing: v }))}
                />
              </SettingsToggleGroup>

              <SettingsToggleGroup
                title={t("notifications.prefs.categories", { defaultValue: "In-app categories" })}
              >
                {NOTIFICATION_CATEGORIES.map((cat) => (
                  <SettingsToggle
                    key={cat}
                    variant="row"
                    label={categoryLabel(cat, i18n.language)}
                    checked={notifs.categories[cat]}
                    onChange={(v) =>
                      setNotifs((p) => ({
                        ...p,
                        categories: { ...p.categories, [cat]: v },
                      }))
                    }
                  />
                ))}
              </SettingsToggleGroup>
            </div>
            <SettingsSaveBar saving={saving} onSave={() => void handleSaveNotifications()} />
          </SettingsCard>
        )}

        {tab === "subscription" && !isTeacher && (
          <>
            <SettingsCard title={t("settings.subscriptionTitle", { defaultValue: "Subscription & units" })} icon={CreditCard}>
              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#FFF9E6] p-4">
                <p className="text-sm font-semibold text-foreground">
                  {t("settings.subscriptionStatus", { defaultValue: "Status" })}:{" "}
                  <span className="capitalize text-[#D4AF37]">
                    {profile?.subscription_status ?? t("settings.noSubscription", { defaultValue: "No active plan" })}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {t("settings.subscriptionDesc", { defaultValue: "Manage your lesson units and billing plan." })}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="gold" size="sm" href="/pricing">
                  {t("settings.viewPlans", { defaultValue: "View plans" })}
                </Button>
                <Button variant="outline" size="sm" href="/dashboard/student/appointments">
                  {t("studentDashboard.myAppointments", { defaultValue: "My appointments" })}
                </Button>
              </div>
            </SettingsCard>

            <SettingsCard title={t("settings.aiAccess", { defaultValue: "NextGrades AI" })} icon={Sparkles}>
              <p className="mb-4 text-sm text-gray-600">
                {t("settings.aiAccessDesc", { defaultValue: "Your AI tutor is included with your account. Choose your preferred assistant in the chat." })}
              </p>
              <Button variant="dark" size="sm" href="/dashboard/chat">
                <Sparkles className="h-4 w-4 text-[var(--brand-gold)]" />
                {t("studentDashboard.openAi", { defaultValue: "Open NextGrades AI" })}
              </Button>
            </SettingsCard>
          </>
        )}

        {isTeacher && tab === "teaching" && (
          <>
            <ZoomConnectCard />
            <SettingsCard
            title={t("settings.teachingTools", { defaultValue: "Teaching tools" })}
            description={t("settings.teachingToolsDesc", { defaultValue: "Quick links to your teaching workspace" })}
            icon={BookOpen}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: "/dashboard/teacher/schedule", label: t("settings.linkSchedule", { defaultValue: "Schedule & calendar" }) },
                { href: "/dashboard/teacher/students", label: t("settings.linkStudents", { defaultValue: "My students" }) },
                { href: "/dashboard/teacher/ai-generator", label: t("settings.linkAiGen", { defaultValue: "AI quiz generator" }) },
                { href: "/dashboard/teacher/upload", label: t("settings.linkUpload", { defaultValue: "Upload materials" }) },
                { href: "/dashboard/teacher/earnings", label: t("settings.linkEarnings", { defaultValue: "Earnings & payments" }) },
                { href: "/dashboard/chat", label: t("settings.linkAiChat", { defaultValue: "NextGrades AI" }) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-border-default bg-surface-subtle px-4 py-3 text-sm font-medium text-foreground transition hover:border-[var(--brand-gold)]/40 hover:bg-surface-elevated"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </SettingsCard>
          </>
        )}

        {isTeacher && tab === "subscription" && null}
      </div>
    </div>
  );
}

export function TeacherSettingsPanel() {
  return <StudentSettingsPanel role="teacher" />;
}
