import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("resources", {
    title: "Resources | NextGrades",
    description: "Learning resources and study materials from NextGrades.",
  });
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
