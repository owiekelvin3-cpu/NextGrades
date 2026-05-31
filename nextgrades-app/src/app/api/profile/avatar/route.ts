import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { getAuthProfile } from "@/lib/quiz/auth";
import { AVATARS_BUCKET, ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_BYTES } from "@/lib/storage/config";
import { ensureAllStorageBuckets } from "@/lib/storage/ensure-buckets";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set<string>(ALLOWED_AVATAR_MIME_TYPES);
const BUCKET_SETUP_HINT = " Run npm run storage:verify or restart the dev server with SUPABASE_SERVICE_ROLE_KEY set.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, WebP, or GIF image" }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (isSupabaseServiceRoleConfigured()) {
      const setup = await ensureAllStorageBuckets();
      if (!setup.ok) {
        throw new Error(setup.error ?? "Storage buckets not ready");
      }
    }
  } catch (bucketError) {
    const message = bucketError instanceof Error ? bucketError.message : "Failed to prepare avatars bucket";
    return NextResponse.json({ error: `${message}${BUCKET_SETUP_HINT}` }, { status: 500 });
  }

  const storageClient = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;
  const { error: uploadError } = await storageClient.storage
    .from(AVATARS_BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type, cacheControl: "3600" });

  if (uploadError) {
    const hint =
      uploadError.message.includes("Bucket not found") || uploadError.message.includes("not found")
        ? BUCKET_SETUP_HINT
        : "";
    return NextResponse.json({ error: `${uploadError.message}${hint}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ url: `${publicUrl}?v=${Date.now()}` });
}

export async function DELETE() {
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
