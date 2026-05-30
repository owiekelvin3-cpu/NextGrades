import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/auth-utils";

// GET - Fetch all tags
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("resource_tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
