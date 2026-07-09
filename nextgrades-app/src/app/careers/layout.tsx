import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("careers", {
    title: "Careers | NextGrades",
    description: "Join the NextGrades team - careers and open roles.",
  });
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
