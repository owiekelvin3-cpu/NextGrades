import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { refreshZoomToken, revokeZoomToken } from "./oauth";

export type ZoomConnection = {
  teacherId: string;
  zoomUserId: string;
  zoomEmail: string | null;
  expiresAt: Date;
  connectedAt: Date;
  scopes: string | null;
};

type TokenRow = {
  teacher_id: string;
  zoom_user_id: string;
  zoom_email: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scopes: string | null;
  connected_at: string;
};

const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

export function checkZoomRateLimit(teacherId: string): boolean {
  const now = Date.now();
  const hits = (rateLimit.get(teacherId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) return false;
  hits.push(now);
  rateLimit.set(teacherId, hits);
  return true;
}

export async function saveZoomConnection(
  teacherId: string,
  data: {
    zoomUserId: string;
    zoomEmail: string | null;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scopes?: string;
  }
): Promise<void> {
  if (!isSupabaseServiceRoleConfigured()) throw new Error("Database not configured");

  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + data.expiresIn * 1000).toISOString();

  const { error } = await admin.from("teacher_zoom_connections").upsert(
    {
      teacher_id: teacherId,
      zoom_user_id: data.zoomUserId,
      zoom_email: data.zoomEmail,
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      expires_at: expiresAt,
      scopes: data.scopes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "teacher_id" }
  );

  if (error) throw new Error(error.message);
}

export async function getZoomConnection(teacherId: string): Promise<ZoomConnection | null> {
  if (!isSupabaseServiceRoleConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("teacher_zoom_connections")
    .select("teacher_id, zoom_user_id, zoom_email, expires_at, scopes, connected_at")
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Omit<TokenRow, "access_token" | "refresh_token">;
  return {
    teacherId: row.teacher_id,
    zoomUserId: row.zoom_user_id,
    zoomEmail: row.zoom_email,
    expiresAt: new Date(row.expires_at),
    connectedAt: new Date(row.connected_at),
    scopes: row.scopes,
  };
}

export async function getZoomAccessToken(teacherId: string): Promise<string | null> {
  if (!isSupabaseServiceRoleConfigured()) return null;
  if (!checkZoomRateLimit(teacherId)) throw new Error("Zoom API rate limit exceeded. Try again shortly.");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("teacher_zoom_connections")
    .select("*")
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as TokenRow;
  const expiresAt = new Date(row.expires_at);
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - bufferMs > Date.now()) {
    return row.access_token;
  }

  try {
    const refreshed = await refreshZoomToken(row.refresh_token);
    await saveZoomConnection(teacherId, {
      zoomUserId: row.zoom_user_id,
      zoomEmail: row.zoom_email,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresIn: refreshed.expires_in,
      scopes: refreshed.scope,
    });
    return refreshed.access_token;
  } catch {
    await admin.from("teacher_zoom_connections").delete().eq("teacher_id", teacherId);
    return null;
  }
}

export async function disconnectZoom(teacherId: string): Promise<void> {
  if (!isSupabaseServiceRoleConfigured()) return;

  const admin = createAdminClient();
  const { data } = await admin
    .from("teacher_zoom_connections")
    .select("refresh_token")
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (data?.refresh_token) {
    await revokeZoomToken(data.refresh_token as string);
  }

  await admin.from("teacher_zoom_connections").delete().eq("teacher_id", teacherId);
}
