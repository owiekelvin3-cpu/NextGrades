import type { Metadata } from "next";
import { buildPageMetadata, fetchPageSeo } from "./get-page-seo";

/** Use in `generateMetadata` for marketing pages backed by `cms_seo`. */
export async function generateCmsMetadata(pageName: string, fallback: Metadata): Promise<Metadata> {
  const seo = await fetchPageSeo(pageName);
  return buildPageMetadata(seo, fallback);
}
