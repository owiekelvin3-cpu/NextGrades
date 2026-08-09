"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  src: string;
  poster?: string | null;
  title?: string;
  onPlay?: () => void;
  onEnded?: () => void;
  className?: string;
};

export function NextGradesVideoPlayer({ src, poster, title, onPlay, onEnded, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setLoading(false);
      setDuration(video.duration || 0);
    };
    const onTime = () => setCurrentTime(video.currentTime);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onError = () => {
      setLoading(false);
      setError("Unable to load this video. Please try again later.");
    };
    const onPlayEv = () => {
      setPlaying(true);
      setHasStarted(true);
      onPlay?.();
      revealControls();
    };
    const onPauseEv = () => {
      setPlaying(false);
      setShowControls(true);
    };
    const onEndEv = () => {
      setPlaying(false);
      setShowControls(true);
      onEnded?.();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    video.addEventListener("play", onPlayEv);
    video.addEventListener("pause", onPauseEv);
    video.addEventListener("ended", onEndEv);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      video.removeEventListener("play", onPlayEv);
      video.removeEventListener("pause", onPauseEv);
      video.removeEventListener("ended", onEndEv);
    };
  }, [onPlay, onEnded, revealControls]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = e.currentTarget;
    if (!video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
    setCurrentTime(video.currentTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const v = Math.min(1, Math.max(0, value));
    video.volume = v;
    setVolume(v);
    setMuted(v === 0);
    video.muted = v === 0;
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen();
  };

  const cycleSpeed = () => {
    const video = videoRef.current;
    if (!video) return;
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    video.playbackRate = next;
    setPlaybackRate(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        video.currentTime = Math.min(duration, video.currentTime + 10);
        break;
      case "ArrowLeft":
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        void toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className={cn("flex aspect-video items-center justify-center rounded-2xl bg-[#0D1B2A] text-white", className)}>
        <div className="text-center px-6">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10",
        className
      )}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="application"
      aria-label={title ? `Video player: ${title}` : "Video player"}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="h-full w-full object-contain bg-black"
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Brand watermark */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-black/40 px-2.5 py-1 backdrop-blur-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-[#D4AF37] text-[10px] font-bold text-[#0D1B2A]">NG</span>
        <span className="text-xs font-semibold text-white/90">NextGrades</span>
      </div>

      {/* Center play button (before start) */}
      {!hasStarted && !loading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
          aria-label="Play video"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/30 transition hover:scale-105">
            <Play className="ml-1 h-9 w-9 text-[#0D1B2A]" fill="currentColor" />
          </span>
        </button>
      )}

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300",
          showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Progress */}
        <div
          className="group/progress mb-3 h-1.5 cursor-pointer rounded-full bg-white/20"
          onClick={seek}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-label="Seek"
        >
          <div
            className="relative h-full rounded-full bg-[#D4AF37] transition-all group-hover/progress:h-2"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#D4AF37] opacity-0 shadow group-hover/progress:opacity-100" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="hidden w-20 accent-[#D4AF37] sm:block"
            aria-label="Volume"
          />

          <span className="text-xs tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            onClick={cycleSpeed}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
            aria-label="Playback speed"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
