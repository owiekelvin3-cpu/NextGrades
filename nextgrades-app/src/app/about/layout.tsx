import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("about", {
    title: "About | NextGrades",
    description: "Learn about NextGrades — expert tutoring for students in Austria.",
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
