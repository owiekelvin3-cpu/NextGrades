import type { MouseEvent } from "react";
import type { UiTheme } from "@/lib/preferences";
import { beginThemeAnimation, endThemeAnimation } from "@/lib/preferences";

export type ThemeTransitionOrigin = { x: number; y: number };

function getMaxRadius(origin: ThemeTransitionOrigin): number {
  const { innerWidth: w, innerHeight: h } = window;
  return Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y)) * 1.08;
}

function overlayBackground(theme: UiTheme): string {
  return theme === "dark" ? "var(--background)" : "var(--background)";
}

/** Circular reveal before applying the new theme — subtle, no gold flash. */
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

  beginThemeAnimation();

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "theme-transition-overlay";
  overlay.style.background = overlayBackground(nextTheme);
  overlay.style.clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
  document.body.appendChild(overlay);

  const maxRadius = getMaxRadius(origin);

  try {
    const expand = overlay.animate(
      [
        { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`, opacity: 0.92 },
        { clipPath: `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)`, opacity: 1 },
      ],
      { duration: 480, easing: "cubic-bezier(0.32, 0.72, 0, 1)", fill: "forwards" }
    );

    await expand.finished.catch(() => undefined);
    applyTheme();

    const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 280,
      easing: "ease-out",
      fill: "forwards",
    });
    await fade.finished.catch(() => undefined);
  } finally {
    overlay.remove();
    endThemeAnimation(400);
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
