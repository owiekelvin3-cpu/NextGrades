import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("help", {
    title: "Hilfe & FAQ | NextGrades",
    description: "Hilfe und häufige Fragen zu NextGrades – Buchung, Lernbibliothek, Konto und Support.",
  });
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
