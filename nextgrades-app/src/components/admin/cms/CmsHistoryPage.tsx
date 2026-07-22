"use client";

import { CmsVersionHistory } from "@/components/admin/cms/CmsVersionHistory";
import { CmsActivityPanel } from "@/components/admin/cms/CmsActivityPanel";

export function CmsHistoryPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Version history</h1>
          <p className="mt-1 text-text-muted">Restore previous content or review recent changes.</p>
        </div>
        <CmsVersionHistory isDark={false} onRollback={() => window.location.reload()} />
        <CmsActivityPanel isDark={false} />
      </div>
    </div>
  );
}
