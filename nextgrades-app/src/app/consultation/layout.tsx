import type { Metadata } from "next";
import { generateCmsMetadata } from "@/lib/cms/create-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("consultation", {
    title: "Free Consultation | NextGrades",
    description: "Book a free consultation with NextGrades.",
  });
}

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
