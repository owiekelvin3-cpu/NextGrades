import { redirect } from "next/navigation";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";

/** Legacy website-content URLs redirect to the CMS studio. */
export default function WebsiteContentLayout() {
  redirect(ADMIN_CMS_PREFIX);
}
