import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("subjects", {
    title: "Fächer | NextGrades",
    description: "Alle Fächer bei NextGrades – von Mathematik bis Deutsch, individuell und lehrplankonform.",
  });
}

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
