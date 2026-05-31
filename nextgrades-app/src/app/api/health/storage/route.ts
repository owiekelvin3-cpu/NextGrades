import { NextResponse } from "next/server";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { ensureAllStorageBuckets } from "@/lib/storage/ensure-buckets";
import { SERVICE_ROLE_REQUIRED_MESSAGE } from "@/lib/storage/config";

/** Admin/dev check: storage buckets exist and MIME limits are synced. */
export async function GET() {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { ok: false, error: SERVICE_ROLE_REQUIRED_MESSAGE, buckets: [] },
      { status: 503 }
    );
  }

  const result = await ensureAllStorageBuckets();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
