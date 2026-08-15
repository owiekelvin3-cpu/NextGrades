import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("about", {
    title: "Über uns | NextGrades",
    description: "Erfahre mehr über NextGrades – Premium-Nachhilfe und Lernbegleitung für SchülerInnen in Österreich.",
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
