import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("programs", {
    title: "Programs | NextGrades",
    description: "Explore NextGrades tutoring programs and learning paths.",
  });
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
