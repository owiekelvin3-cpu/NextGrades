"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, Play, Check, ChevronDown } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationSoundId,
} from "@/lib/notifications/types";
import { NOTIFICATION_SOUND_OPTIONS, playNotificationSound, unlockAudio } from "@/lib/notifications/sounds";
import { categoryLabel } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";

export function NotificationSoundSettings() {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences } = useNotifications();
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const save = useCallback(
    async (patch: Partial<typeof preferences>) => {
      setSaving("patch");
      await updatePreferences(patch);
      setSaving(null);
    },
    [updatePreferences]
  );

  const preview = (soundId: NotificationSoundId) => {
    unlockAudio();
    playNotificationSound(soundId);
  };

  const setDefaultSound = async (soundId: NotificationSoundId) => {
    await save({ defaultSoundId: soundId });
    preview(soundId);
  };

  const setCategorySound = async (category: NotificationCategory, soundId: NotificationSoundId) => {
    await save({
      categorySounds: { ...preferences.categorySounds, [category]: soundId },
    });
    preview(soundId);
  };

  const clearCategorySound = async (category: NotificationCategory) => {
    const next = { ...preferences.categorySounds };
    delete next[category];
    await save({ categorySounds: next });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-elevated shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-surface-subtle"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/20">
            <Volume2 className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("notifications.sounds.title", { defaultValue: "Notification sounds" })}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {t("notifications.sounds.subtitle", {
                defaultValue: "Choose a default tone and customize sounds per notification type.",
              })}
            </p>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-gray-400 transition", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-6 border-t border-border-default px-5 py-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("notifications.sounds.default", { defaultValue: "Default sound" })}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {NOTIFICATION_SOUND_OPTIONS.map((opt) => {
                const active = preferences.defaultSoundId === opt.id;
                return (
                  <SoundChip
                    key={opt.id}
                    label={t(opt.labelKey, { defaultValue: opt.id })}
                    active={active}
                    disabled={saving !== null}
                    onSelect={() => void setDefaultSound(opt.id)}
                    onPreview={() => preview(opt.id)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("notifications.sounds.perCategory", { defaultValue: "Sound per notification type" })}
            </p>
            <ul className="divide-y divide-border-default rounded-xl border border-border-default bg-surface-subtle">
              {NOTIFICATION_CATEGORIES.map((cat) => {
                const selected = preferences.categorySounds[cat] ?? preferences.defaultSoundId;
                const hasCustom = Boolean(preferences.categorySounds[cat]);
                return (
                  <li key={cat} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{categoryLabel(cat, i18n.language)}</p>
                      {hasCustom && (
                        <button
                          type="button"
                          onClick={() => void clearCategorySound(cat)}
                          className="mt-0.5 text-[11px] font-medium text-[#D4AF37] hover:underline"
                        >
                          {t("notifications.sounds.useDefault", { defaultValue: "Use default" })}
                        </button>
                      )}
                    </div>
                    <select
                      value={selected}
                      onChange={(e) => void setCategorySound(cat, e.target.value as NotificationSoundId)}
                      className="min-h-10 rounded-xl border border-border-default bg-surface-elevated px-3 text-sm text-foreground focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      aria-label={categoryLabel(cat, i18n.language)}
                    >
                      {NOTIFICATION_SOUND_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {t(opt.labelKey, { defaultValue: opt.id })}
                        </option>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle px-4 py-3.5">
            <span className="text-sm font-medium text-foreground">
              {t("notifications.prefs.sound", { defaultValue: "Play sounds for new notifications" })}
            </span>
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={(e) => void save({ soundEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function SoundChip({
  label,
  active,
  disabled,
  onSelect,
  onPreview,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border p-1 transition",
        active
          ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm"
          : "border-border-default bg-surface-elevated hover:border-[#D4AF37]/40"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex min-h-10 flex-1 items-center gap-1.5 rounded-lg px-2 text-left text-xs font-medium touch-manipulation",
          active ? "text-[#0D1B2A]" : "text-foreground"
        )}
      >
        {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />}
        <span className="truncate">{label}</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onPreview}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 touch-manipulation"
        aria-label={`Preview ${label}`}
      >
        <Play className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
