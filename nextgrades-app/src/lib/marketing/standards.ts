/** Canonical marketing statistics - use across all public pages */
export const GLOBAL_STATS = [
  { number: "100+", label: "SchülerInnen" },
  { number: "25+", label: "LehrerInnen" },
  { number: "500+", label: "Lernmaterialien" },
  { number: "4,9/5", label: "Bewertung" },
] as const;

export const PROGRAM_PRICES = {
  oneOnOne: "39 €",
  group: "29 €",
  library: "49 €",
  matura: "149 €",
} as const;
