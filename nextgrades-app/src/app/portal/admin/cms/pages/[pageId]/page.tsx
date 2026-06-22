import { CmsPageEditor } from "@/components/admin/cms/CmsPageEditor";

type Props = { params: Promise<{ pageId: string }> };

export default async function CmsPageEditorRoute({ params }: Props) {
  const { pageId } = await params;
  return <CmsPageEditor pageId={pageId} />;
}
