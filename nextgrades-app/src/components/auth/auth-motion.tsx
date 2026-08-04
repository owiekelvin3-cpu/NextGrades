"use client";

import { motion, type Variants } from "framer-motion";

export const AUTH_EASE = [0.22, 1, 0.36, 1] as const;

export const authStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const authFadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: AUTH_EASE },
  },
};

export const authFadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: AUTH_EASE } },
};

export const authSlideUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: AUTH_EASE } },
};

export const authScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: AUTH_EASE } },
};

export const authSlideFromLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: AUTH_EASE } },
};

export function AuthMotionStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={authStaggerContainer} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function AuthMotionItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={authFadeUp} className={className}>
      {children}
    </motion.div>
  );
}
