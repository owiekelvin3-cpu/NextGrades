import type { MouseEvent } from "react";
import type { UiTheme } from "@/lib/preferences";

export type ThemeTransitionOrigin = { x: number; y: number };

function getMaxRadius(origin: ThemeTransitionOrigin): number {
  const { innerWidth: w, innerHeight: h } = window;
  return Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y)) * 1.12;
}

function overlayBackground(theme: UiTheme, origin: ThemeTransitionOrigin): string {
  if (theme === "dark") {
    return [
      `radial-gradient(circle at ${origin.x}px ${origin.y}px, rgba(212,175,55,0.28) 0%, transparent 42%)`,
      "linear-gradient(165deg, #0D1B2A 0%, #112240 55%, #0A1628 100%)",
    ].join(", ");
  }
  return [
    `radial-gradient(circle at ${origin.x}px ${origin.y}px, rgba(212,175,55,0.18) 0%, transparent 38%)`,
    "linear-gradient(165deg, #FFFFFF 0%, #FAFAFA 100%)",
  ].join(", ");
}

/** Circular reveal that covers the screen before applying the new theme. */
export async function runThemeTransition(
  nextTheme: UiTheme,
  origin: ThemeTransitionOrigin,
  applyTheme: () => void
): Promise<void> {
  if (typeof window === "undefined") {
    applyTheme();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme();
    return;
  }

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "theme-transition-overlay";
  overlay.style.background = overlayBackground(nextTheme, origin);
  overlay.style.clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
  document.body.appendChild(overlay);

  const maxRadius = getMaxRadius(origin);

  try {
    const expand = overlay.animate(
      [
        { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
        { clipPath: `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)` },
      ],
      { duration: 520, easing: "cubic-bezier(0.32, 0.72, 0, 1)", fill: "forwards" }
    );

    await expand.finished.catch(() => undefined);
    applyTheme();

    const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: "ease-out",
      fill: "forwards",
    });
    await fade.finished.catch(() => undefined);
  } finally {
    overlay.remove();
  }
}

export function getClickOrigin(event?: MouseEvent<HTMLElement>): ThemeTransitionOrigin {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX || rect.left + rect.width / 2,
      y: event.clientY || rect.top + rect.height / 2,
    };
  }

  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}
