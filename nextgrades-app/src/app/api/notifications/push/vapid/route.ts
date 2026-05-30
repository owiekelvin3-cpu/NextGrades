import { NextResponse } from "next/server";
import { getPublicVapidKey, isPushConfigured } from "@/lib/notifications/push";

export async function GET() {
  const key = getPublicVapidKey();
  return NextResponse.json({ publicKey: key, configured: isPushConfigured() });
}
