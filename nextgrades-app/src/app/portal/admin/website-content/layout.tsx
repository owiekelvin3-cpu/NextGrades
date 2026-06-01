import { CmsShell } from "@/components/admin/cms/shell/CmsShell";

export default function WebsiteContentLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
