import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("help", {
    title: "Help & FAQ | NextGrades",
    description: "Help centre and frequently asked questions about NextGrades.",
  });
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
