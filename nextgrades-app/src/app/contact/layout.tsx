import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("contact", {
    title: "Contact | NextGrades",
    description: "Get in touch with NextGrades for tutoring, programs, and support.",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
