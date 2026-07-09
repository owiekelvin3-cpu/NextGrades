"use client";

import { CmsClassicEditor } from "@/components/admin/cms/CmsClassicEditor";

type Props = {
  pageId: string;
};

/** WordPress-style form editor - clean labels, collapsible sections, no code view. */
export function CmsPageEditor({ pageId }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <CmsClassicEditor pageId={pageId} />
    </div>
  );
}
