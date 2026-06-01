import { redirect } from "next/navigation";
import { CMS_SIDEBAR_PAGES } from "@/lib/cms/cms-nav";

export default function WebsiteContentHubPage() {
  redirect(CMS_SIDEBAR_PAGES[0].href);
}
