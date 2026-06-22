import { CmsVisualEditor } from "@/components/admin/cms/CmsVisualEditor";

type Props = { params: Promise<{ pageId: string }> };

export default async function CmsPageEditorRoute({ params }: Props) {
  const { pageId } = await params;
  return <CmsVisualEditor pageId={pageId} />;
}
