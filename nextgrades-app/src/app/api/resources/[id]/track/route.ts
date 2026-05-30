import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action === "download" ? "download" : "view";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("resource_analytics").insert({
      resource_id: id,
      user_id: user?.id ?? null,
      action,
      metadata: body.metadata ?? null,
    });

    const column = action === "download" ? "download_count" : "view_count";
    const { data: current } = await supabase.from("materials").select(column).eq("id", id).single();
    const count = ((current as Record<string, number> | null)?.[column] ?? 0) + 1;

    await supabase.from("materials").update({ [column]: count }).eq("id", id);

    return NextResponse.json({ success: true, [column]: count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to track";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
