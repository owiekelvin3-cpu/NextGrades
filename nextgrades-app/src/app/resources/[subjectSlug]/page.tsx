"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesSubjectExperience } from "@/components/resources/ResourcesSubjectExperience";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { appShell } from "@/lib/theme/shell";

function SubjectPageContent() {
  const params = useParams();
  const subjectSlug = params.subjectSlug as string;
  const [subjectName, setSubjectName] = useState(subjectSlug);

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        const match = (data.subjects ?? []).find(
          (s: { slug?: string; id: string; name: string }) =>
            s.slug === subjectSlug || s.id === subjectSlug
        );
        if (match?.name) setSubjectName(match.name);
      });
  }, [subjectSlug]);

  return (
    <ResourcesSubjectExperience subjectSlug={subjectSlug} subjectName={subjectName} />
  );
}

export default function ResourcesSubjectPage() {
  return (
    <div className={appShell.marketingPageMuted}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20"><LoadingBlock /></div>}>
          <SubjectPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
