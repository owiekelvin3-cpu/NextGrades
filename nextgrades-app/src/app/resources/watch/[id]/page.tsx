"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ResourceWatchExperience } from "@/components/resources/ResourceWatchExperience";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";

function WatchContent() {
  const params = useParams();
  const id = params.id as string;
  return <ResourceWatchExperience resourceId={id} />;
}

export default function ResourceWatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24"><LoadingBlock /></div>}>
      <WatchContent />
    </Suspense>
  );
}
