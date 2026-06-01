import { CmsVisualEditor } from "@/components/admin/cms/CmsVisualEditor";
import { CMS_SIDEBAR_PAGES } from "@/lib/cms/cms-nav";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ pageId: string }> };

export default async function CmsPageEditorRoute({ params }: Props) {
  const { pageId } = await params;
  const valid = CMS_SIDEBAR_PAGES.some((p) => p.id === pageId);
  if (!valid) notFound();
  return <CmsVisualEditor pageId={pageId} />;
}
