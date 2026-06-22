"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

const SCROLL_START = "top 85%";
const MAX_STAGGER_TOTAL = 0.6;

export type AnimationVariant =
  | "fadeUp"
  | "fadeIn"
  | "slideInLeft"
  | "slideInRight"
  | "scaleUp";

type VariantPreset = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration: number;
  ease: string;
};

const VARIANTS: Record<AnimationVariant, VariantPreset> = {
  fadeUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    duration: 0.7,
    ease: "power2.out",
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 0.6,
    ease: "power1.out",
  },
  slideInLeft: {
    from: { opacity: 0, x: -40 },
    to: { opacity: 1, x: 0 },
    duration: 0.65,
    ease: "power2.out",
  },
  slideInRight: {
    from: { opacity: 0, x: 40 },
    to: { opacity: 1, x: 0 },
    duration: 0.65,
    ease: "power2.out",
  },
  scaleUp: {
    from: { opacity: 0, scale: 0.92 },
    to: { opacity: 1, scale: 1 },
    duration: 0.6,
    ease: "back.out(1.4)",
  },
};

const HERO_DELAYS: Record<string, number> = {
  "hero-headline": 0.1,
  "hero-subheadline": 0.25,
  "hero-image": 0.3,
  "hero-cta": 0.4,
};

const STAGGER_PARENT_TYPES = new Set(["staggerChildren", "nav-stagger"]);
const MOUNT_TYPES = new Set([
  "hero-headline",
  "hero-subheadline",
  "hero-image",
  "hero-cta",
  "nav-item",
]);
const SPECIAL_TYPES = new Set([
  ...STAGGER_PARENT_TYPES,
  ...MOUNT_TYPES,
  "counter",
  "step",
  "connector",
]);

function parseDelay(el: Element): number {
  const raw = el.getAttribute("data-animate-delay");
  if (!raw) return 0;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

function parseStagger(el: Element, fallback: number): number {
  const raw = el.getAttribute("data-stagger");
  if (!raw) return fallback;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function effectiveStagger(count: number, perItem: number): number {
  if (count <= 1) return 0;
  const total = perItem * (count - 1);
  if (count > 6 && total > MAX_STAGGER_TOTAL) {
    return MAX_STAGGER_TOTAL / (count - 1);
  }
  return perItem;
}

function releaseGpuLayer(target: Element) {
  gsap.set(target, { clearProps: "transform" });
}

function scrollTriggerVars(
  trigger: gsap.DOMTarget,
  extra?: ScrollTrigger.Vars
): ScrollTrigger.Vars {
  return {
    trigger,
    start: SCROLL_START,
    once: true,
    lazy: true,
    ...extra,
  } as ScrollTrigger.Vars;
}

function runTween(
  target: gsap.TweenTarget,
  preset: VariantPreset,
  options: {
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars | false;
    onComplete?: () => void;
  } = {}
) {
  gsap.set(target, preset.from);

  const tweenVars: gsap.TweenVars = {
    ...preset.to,
    duration: preset.duration,
    ease: preset.ease,
    delay: options.delay ?? 0,
    onComplete: () => {
      if (target instanceof Element) releaseGpuLayer(target);
      else if (Array.isArray(target)) {
        target.forEach((node) => {
          if (node instanceof Element) releaseGpuLayer(node);
        });
      }
      options.onComplete?.();
    },
  };

  if (options.scrollTrigger !== false) {
    tweenVars.scrollTrigger = scrollTriggerVars(
      Array.isArray(target) ? target[0]! : target,
      options.scrollTrigger && typeof options.scrollTrigger === "object"
        ? options.scrollTrigger
        : undefined
    );
  }

  return gsap.to(target, tweenVars);
}

function createVariantRunner(variant: AnimationVariant) {
  return (
    target: gsap.TweenTarget,
    options?: {
      delay?: number;
      scroll?: boolean;
      scrollTrigger?: ScrollTrigger.Vars;
      onComplete?: () => void;
    }
  ) =>
    runTween(target, VARIANTS[variant], {
      delay: options?.delay,
      scrollTrigger: options?.scroll === false ? false : options?.scrollTrigger,
      onComplete: options?.onComplete,
    });
}

export const fadeUp = createVariantRunner("fadeUp");
export const fadeIn = createVariantRunner("fadeIn");
export const slideInLeft = createVariantRunner("slideInLeft");
export const slideInRight = createVariantRunner("slideInRight");
export const scaleUp = createVariantRunner("scaleUp");

export function staggerChildren(
  parent: Element,
  options?: { stagger?: number; variant?: AnimationVariant }
) {
  const children = Array.from(parent.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  );
  if (!children.length) return;

  const variantAttr = parent.getAttribute("data-stagger-variant") as AnimationVariant | null;
  const variant = options?.variant ?? (variantAttr && VARIANTS[variantAttr] ? variantAttr : "fadeUp");
  const stagger = effectiveStagger(
    children.length,
    options?.stagger ?? parseStagger(parent, 0.12)
  );
  const preset = VARIANTS[variant];

  children.forEach((child) => gsap.set(child, preset.from));

  return gsap.to(children, {
    ...preset.to,
    duration: preset.duration,
    ease: preset.ease,
    stagger,
    scrollTrigger: scrollTriggerVars(parent),
    onComplete: () => {
      children.forEach(releaseGpuLayer);
    },
  });
}

function parseCounterParts(raw: string) {
  const match = raw.trim().match(/^([^\d]*?)([\d,.]+)(.*)$/);
  if (!match) {
    return { prefix: "", value: 0, suffix: raw };
  }
  const numeric = parseFloat(match[2].replace(/,/g, ""));
  return {
    prefix: match[1] ?? "",
    value: Number.isFinite(numeric) ? numeric : 0,
    suffix: match[3] ?? "",
  };
}

function animateCounter(el: HTMLElement) {
  const source =
    el.getAttribute("data-counter-value") ?? el.textContent?.trim() ?? "0";
  const { prefix, value, suffix } = parseCounterParts(source);
  const counterTarget = { display: 0 };

  gsap.set(el, { opacity: 0, scale: 0.92 });

  const tween = gsap.to(counterTarget, {
    display: value,
    duration: 1.5,
    ease: "power2.out",
    snap: { display: 1 },
    scrollTrigger: scrollTriggerVars(el),
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(counterTarget.display)}${suffix}`;
    },
    onComplete: () => {
      el.textContent = `${prefix}${value}${suffix}`;
      releaseGpuLayer(el);
    },
  });

  gsap.to(el, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: "back.out(1.4)",
    scrollTrigger: scrollTriggerVars(el),
  });

  return tween;
}

function initHeroAnimations(scope: Element | Document) {
  (["hero-headline", "hero-subheadline", "hero-image", "hero-cta"] as const).forEach(
    (type) => {
      const variant: AnimationVariant =
        type === "hero-image" ? "scaleUp" : "fadeUp";
      scope.querySelectorAll(`[data-animate="${type}"]`).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        runTween(node, VARIANTS[variant], {
          delay: parseDelay(node) || HERO_DELAYS[type],
          scrollTrigger: false,
        });
      });
    }
  );
}

function initNavAnimations(scope: Element | Document) {
  scope.querySelectorAll('[data-animate="nav-stagger"]').forEach((nav) => {
    const items = nav.querySelectorAll('[data-animate="nav-item"]');
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 12 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      stagger: effectiveStagger(items.length, 0.08),
      delay: 0.05,
      onComplete: () => {
        items.forEach((item) => {
          if (item instanceof Element) releaseGpuLayer(item);
        });
      },
    });
  });
}

function initStaggerParents(scope: Element | Document) {
  scope.querySelectorAll('[data-animate="staggerChildren"]').forEach((parent) => {
    staggerChildren(parent);
  });
}

function initScrollElements(scope: Element | Document) {
  scope.querySelectorAll("[data-animate]").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const type = node.getAttribute("data-animate");
    if (!type || SPECIAL_TYPES.has(type)) return;

    if (
      node.parentElement?.getAttribute("data-animate") === "staggerChildren" &&
      node.parentElement.contains(node)
    ) {
      return;
    }

    const variant = type as AnimationVariant;
    if (!VARIANTS[variant]) return;

    runTween(node, VARIANTS[variant], {
      delay: parseDelay(node),
    });
  });
}

function initStepAnimations(scope: Element | Document) {
  const steps = Array.from(scope.querySelectorAll('[data-animate="step"]')).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );

  steps.forEach((step) => {
    const index = parseInt(step.getAttribute("data-animate-index") ?? "0", 10);
    runTween(step, VARIANTS.fadeUp, {
      delay: Number.isFinite(index) ? index * 0.1 : 0,
    });
  });

  scope.querySelectorAll('[data-animate="connector"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    gsap.set(node, { opacity: 0 });
    gsap.to(node, {
      opacity: 1,
      duration: 0.55,
      ease: "power1.out",
      delay: 0.2,
      scrollTrigger: scrollTriggerVars(node),
    });
  });
}

function initCounterAnimations(scope: Element | Document) {
  scope.querySelectorAll('[data-animate="counter"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    animateCounter(node);
  });
}

function initParallax(scope: Element | Document) {
  scope.querySelectorAll("[data-animate-parallax]").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    gsap.to(node, {
      y: 20,
      ease: "none",
      scrollTrigger: scrollTriggerVars(node.parentElement ?? node, {
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }),
    });
  });
}

/** Initialise all scroll / mount animations within a DOM scope. */
export function initPageAnimations(scope: Element | Document = document.body): () => void {
  const mm = gsap.matchMedia();
  let cleanup: (() => void) | null = null;

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      initHeroAnimations(scope);
      initNavAnimations(scope);
      initStaggerParents(scope);
      initScrollElements(scope);
      initStepAnimations(scope);
      initCounterAnimations(scope);
      initParallax(scope);
      ScrollTrigger.refresh();
    }, scope);

    cleanup = () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });

  return () => {
    cleanup?.();
    mm.revert();
  };
}
