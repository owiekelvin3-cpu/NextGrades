import { CmsBlogEditorPage } from "@/components/admin/cms/CmsBlogEditorPage";

type Props = { params: Promise<{ postId: string }> };

export default async function CmsBlogPostRoute({ params }: Props) {
  const { postId } = await params;
  return <CmsBlogEditorPage postId={postId} />;
}
