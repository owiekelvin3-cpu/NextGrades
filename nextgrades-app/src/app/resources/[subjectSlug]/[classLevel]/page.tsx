"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesSubjectExperience } from "@/components/resources/ResourcesSubjectExperience";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { appShell } from "@/lib/theme/shell";

function ClassPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectSlug = params.subjectSlug as string;
  const classLevel = params.classLevel as string;
  const semester = searchParams.get("semester") || "1";

  const [subjectName, setSubjectName] = useState(subjectSlug);
  const [className, setClassName] = useState(`Grade ${classLevel}`);

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        const sub = (data.subjects ?? []).find(
          (s: { slug?: string; id: string; name: string }) => s.slug === subjectSlug || s.id === subjectSlug
        );
        if (sub?.name) setSubjectName(sub.name);
        const cls = (data.classes ?? []).find((c: { level: number; name: string }) => String(c.level) === classLevel);
        if (cls?.name) setClassName(cls.name);
      });
  }, [subjectSlug, classLevel]);

  return (
    <ResourcesSubjectExperience
      subjectSlug={subjectSlug}
      subjectName={subjectName}
      classLevel={classLevel}
      className={className}
      semester={semester}
    />
  );
}

export default function ResourcesClassPage() {
  return (
    <div className={appShell.marketingPageMuted}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20"><LoadingBlock /></div>}>
          <ClassPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
