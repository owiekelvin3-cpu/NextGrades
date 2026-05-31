import type { NotificationSoundId } from "./types";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") void ctx.resume();
}

type ToneStep = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

function playToneSequence(steps: ToneStep[], masterGain = 0.2): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = masterGain;
  master.connect(ctx.destination);

  for (const step of steps) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = step.type ?? "sine";
    osc.frequency.setValueAtTime(step.freq, now + step.at);
    const peak = step.gain ?? 1;
    gain.gain.setValueAtTime(0.0001, now + step.at);
    gain.gain.exponentialRampToValueAtTime(peak, now + step.at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + step.at + step.dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + step.at);
    osc.stop(now + step.at + step.dur + 0.05);
  }
}

/** Rich notification tones — Web Audio synthesis (no external files). */
const SOUND_SEQUENCES: Record<NotificationSoundId, ToneStep[]> = {
  chime: [
    { freq: 1046.5, at: 0, dur: 0.55, type: "sine", gain: 0.9 },
    { freq: 1318.5, at: 0.08, dur: 0.45, type: "sine", gain: 0.5 },
  ],
  bell: [
    { freq: 830, at: 0, dur: 0.9, type: "triangle", gain: 1 },
    { freq: 1660, at: 0, dur: 0.35, type: "sine", gain: 0.25 },
  ],
  ping: [
    { freq: 880, at: 0, dur: 0.18, type: "sine", gain: 1 },
    { freq: 1174, at: 0.06, dur: 0.12, type: "sine", gain: 0.4 },
  ],
  soft: [
    { freq: 523, at: 0, dur: 0.4, type: "sine", gain: 0.85 },
    { freq: 659, at: 0.05, dur: 0.35, type: "sine", gain: 0.35 },
  ],
  message: [
    { freq: 660, at: 0, dur: 0.12, type: "sine", gain: 0.8 },
    { freq: 880, at: 0.1, dur: 0.15, type: "sine", gain: 0.75 },
  ],
  success: [
    { freq: 523, at: 0, dur: 0.15, type: "sine", gain: 0.7 },
    { freq: 659, at: 0.1, dur: 0.15, type: "sine", gain: 0.75 },
    { freq: 784, at: 0.2, dur: 0.25, type: "sine", gain: 0.85 },
  ],
  alert: [
    { freq: 740, at: 0, dur: 0.14, type: "square", gain: 0.35 },
    { freq: 740, at: 0.18, dur: 0.14, type: "square", gain: 0.35 },
    { freq: 988, at: 0.36, dur: 0.2, type: "sine", gain: 0.6 },
  ],
  glass: [
    { freq: 1760, at: 0, dur: 0.08, type: "sine", gain: 0.5 },
    { freq: 2217, at: 0.04, dur: 0.2, type: "sine", gain: 0.35 },
    { freq: 2637, at: 0.08, dur: 0.35, type: "triangle", gain: 0.2 },
  ],
  pop: [
    { freq: 420, at: 0, dur: 0.08, type: "sine", gain: 1 },
    { freq: 680, at: 0.04, dur: 0.1, type: "sine", gain: 0.45 },
  ],
  digital: [
    { freq: 1200, at: 0, dur: 0.06, type: "square", gain: 0.2 },
    { freq: 900, at: 0.07, dur: 0.06, type: "square", gain: 0.18 },
    { freq: 1400, at: 0.14, dur: 0.08, type: "square", gain: 0.15 },
  ],
};

export const NOTIFICATION_SOUND_OPTIONS: { id: NotificationSoundId; labelKey: string }[] = [
  { id: "chime", labelKey: "notifications.sounds.chime" },
  { id: "bell", labelKey: "notifications.sounds.bell" },
  { id: "ping", labelKey: "notifications.sounds.ping" },
  { id: "soft", labelKey: "notifications.sounds.soft" },
  { id: "message", labelKey: "notifications.sounds.message" },
  { id: "success", labelKey: "notifications.sounds.success" },
  { id: "alert", labelKey: "notifications.sounds.alert" },
  { id: "glass", labelKey: "notifications.sounds.glass" },
  { id: "pop", labelKey: "notifications.sounds.pop" },
  { id: "digital", labelKey: "notifications.sounds.digital" },
];

export function playNotificationSound(soundId: NotificationSoundId = "chime"): void {
  const sequence = SOUND_SEQUENCES[soundId] ?? SOUND_SEQUENCES.chime;
  playToneSequence(sequence);
}

/** @deprecated Use playNotificationSound(soundId) */
export function playLegacyNotificationSound(variant: "default" | "message" | "success" = "default"): void {
  const map = { default: "chime" as const, message: "message" as const, success: "success" as const };
  playNotificationSound(map[variant]);
}
