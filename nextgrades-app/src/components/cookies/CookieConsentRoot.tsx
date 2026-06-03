"use client";

import { CookieBanner } from "./CookieBanner";
import { CookiePreferenceModal } from "@/components/modals/CookiePreferenceModal";
import { OpenCookieSettingsButton } from "./OpenCookieSettingsButton";

/** Banner + preference modal mounted once at app root. */
export function CookieConsentRoot() {
  return (
    <>
      <CookieBanner />
      <CookiePreferenceModal />
    </>
  );
}

export { OpenCookieSettingsButton };
