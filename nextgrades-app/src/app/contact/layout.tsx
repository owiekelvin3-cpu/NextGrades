import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("contact", {
    title: "Kontakt | NextGrades",
    description: "Kontaktiere NextGrades für Nachhilfe, Programme und persönlichen Support.",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
