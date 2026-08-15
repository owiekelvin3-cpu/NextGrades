import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("programs", {
    title: "Programme | NextGrades",
    description: "Entdecke die NextGrades-Programme: 1:1 Nachhilfe, Lerngruppen, Matura-Paket und Lernbibliothek.",
  });
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
