import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("resources", {
    title: "Lernbibliothek | NextGrades",
    description: "Strukturierte Lernmaterialien, Übungsblätter und Prüfungsvorbereitung in der NextGrades-Lernbibliothek.",
  });
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
