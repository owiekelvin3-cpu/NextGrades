import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("consultation", {
    title: "Kostenloses Erstgespräch | NextGrades",
    description: "Buche ein kostenloses Erstgespräch mit NextGrades – unverbindlich und persönlich.",
  });
}

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
