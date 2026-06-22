import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("subjects", {
    title: "Subjects | NextGrades",
    description: "Browse subjects taught by NextGrades tutors.",
  });
}

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
