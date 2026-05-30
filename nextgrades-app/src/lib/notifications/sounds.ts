let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Subtle professional tone — respects user gesture / autoplay policies */
export function playNotificationSound(variant: "default" | "message" | "success" = "default"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freqs = { default: 880, message: 660, success: 988 };
  osc.frequency.value = freqs[variant];
  osc.type = "sine";

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") void ctx.resume();
}
