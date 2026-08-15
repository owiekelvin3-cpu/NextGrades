import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("careers", {
    title: "Karriere | NextGrades",
    description: "Werde Teil von NextGrades – offene Stellen und Karriere als TutorIn.",
  });
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
