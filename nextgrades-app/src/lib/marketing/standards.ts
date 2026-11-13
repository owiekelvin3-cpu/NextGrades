/** Verified marketing stats only — do not invent ratings or counts. */
export const GLOBAL_STATS = [
  { number: "1:1", label: "Premium-Nachhilfe" },
  { number: "3–5", label: "SchülerInnen pro Gruppe" },
  { number: "39 €", label: "pro Stunde (1:1)" },
  { number: "29 €", label: "pro Stunde (Gruppe)" },
] as const;

export const PROGRAM_PRICES = {
  oneOnOne: "39 €",
  group: "29 €",
  library: "49 €",
  matura: "149 €",
} as const;
