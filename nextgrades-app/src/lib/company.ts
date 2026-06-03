/** Public company contact details (marketing site, footer, contact page). */

export const COMPANY_COUNTRY = {
  en: "Austria",
  de: "Österreich",
} as const;

/** E.164 — no spaces (for tel: links and APIs). */
export const COMPANY_PHONE_E164 = "+436702064399";

/** Human-readable display. */
export const COMPANY_PHONE_DISPLAY = "+43 670 206 4399";

export const COMPANY_PHONE_TEL = `tel:${COMPANY_PHONE_E164}`;

export const COMPANY_DEFAULT_TIMEZONE = "Europe/Vienna";

export const COMPANY_ADDRESS_DEFAULT = `NextGrades, ${COMPANY_COUNTRY.de}`;
