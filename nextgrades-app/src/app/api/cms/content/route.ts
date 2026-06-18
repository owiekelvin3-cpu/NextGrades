import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { getApiAuth, requireAdminApi } from "@/lib/auth/api-auth";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";
import {
  CMS_CONTENT_PUBLIC_SELECT,
  stripCmsDraftFields,
} from "@/lib/cms/sanitize-public-content";
import { publicCacheHeaders } from "@/lib/cache/public-cache";

async function canReadCmsDrafts(): Promise<boolean> {
  const auth = await getApiAuth();
  if (!auth.profile || auth.profile.role !== "admin") return false;
  if (!auth.user) return false;
  return isLoginMfaSatisfied(auth.user.id);
}

export async function GET(request: Request) {
  try {
    const includeDrafts = await canReadCmsDrafts();
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    const { data, error } = includeDrafts
      ? await (sectionId
          ? db.from("cms_content").select("*").eq("section_id", sectionId)
          : db.from("cms_content").select("*")
        ).order("sort_order", { ascending: true })
      : await (sectionId
          ? db.from("cms_content").select(CMS_CONTENT_PUBLIC_SELECT).eq("section_id", sectionId)
          : db.from("cms_content").select(CMS_CONTENT_PUBLIC_SELECT)
        ).order("sort_order", { ascending: true });

    if (error) throw error;

    const rows = includeDrafts ? data : stripCmsDraftFields((data ?? []) as Record<string, unknown>[]);
    if (includeDrafts) return NextResponse.json(rows);
    return NextResponse.json(rows, { headers: publicCacheHeaders() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data, error } = await gate.auth!.supabase
      .from("cms_content")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const { data, error } = await gate.auth!.supabase
      .from("cms_content")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
