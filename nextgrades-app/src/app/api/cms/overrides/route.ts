import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { rowsToOverrideMap } from "@/lib/cms/admin-auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);

    type CmsRow = {
      i18n_key: string | null;
      field_key: string;
      field_type: string;
      content_value: string | null;
      content_json: { en?: unknown; de?: unknown } | null;
    };

    const primary = await db
      .from("cms_content")
      .select("i18n_key, field_key, field_type, content_value, content_json")
      .not("i18n_key", "is", null);

    let rows: CmsRow[] = [];

    if (primary.error?.message?.includes("i18n_key")) {
      const fallback = await db
        .from("cms_content")
        .select("field_key, field_type, content_value, content_json")
        .not("field_key", "is", null);

      if (fallback.error) {
        console.warn("CMS overrides unavailable:", fallback.error.message);
        return NextResponse.json({});
      }

      rows = (fallback.data || []).map((row) => ({
        ...row,
        i18n_key: null,
      }));
    } else if (primary.error) {
      console.warn("CMS overrides unavailable:", primary.error.message);
      return NextResponse.json({});
    } else {
      rows = (primary.data || []) as CmsRow[];
    }

    const mapped = rows.map((row) => ({
      i18n_key: row.i18n_key || row.field_key,
      content_json: row.content_json,
      content_value: row.content_value,
      field_type: row.field_type,
    }));

    return NextResponse.json(rowsToOverrideMap(mapped), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load CMS overrides";
    console.warn("CMS overrides unavailable:", message);
    return NextResponse.json({}, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  }
}
