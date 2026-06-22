import { CmsShell } from "@/components/admin/cms/shell/CmsShell";

export default function CmsAdminLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
