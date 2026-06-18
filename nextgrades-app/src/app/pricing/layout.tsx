import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preise & Tarife | NextGrades",
  description:
    "Transparente Preise für Lernbibliothek, Lerngruppen, 1:1 Premium-Nachhilfe und Mathe-Matura-Vorbereitung. Keine versteckten Kosten.",
  openGraph: {
    title: "Preise & Tarife | NextGrades",
    description:
      "Finde das passende Lernpaket — von der Lernbibliothek bis zur persönlichen Matura-Vorbereitung.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
