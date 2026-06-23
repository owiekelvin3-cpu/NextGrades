import { redirect } from "next/navigation";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";

export default function WebsiteContentPage() {
  redirect(ADMIN_CMS_PREFIX);
}
