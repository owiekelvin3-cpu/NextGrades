"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

/** Loads Font Awesome CSS only on auth pages (not site-wide). */
export function FontAwesomeSetup() {
  return null;
}
