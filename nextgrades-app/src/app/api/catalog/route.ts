import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { filterCatalogClasses } from "@/lib/catalog/classes";
import { enrichSubject, type CatalogSubjectRow } from "@/lib/catalog/subjects";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);

    const withSlug = await db
      .from("subjects")
      .select("id, name, slug, description, icon, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    let subjectRows: CatalogSubjectRow[] = [];

    if (withSlug.error?.message?.includes("slug")) {
      const withoutSlug = await db
        .from("subjects")
        .select("id, name, description, icon, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (withoutSlug.error) throw withoutSlug.error;
      subjectRows = (withoutSlug.data ?? []) as CatalogSubjectRow[];
    } else {
      if (withSlug.error) throw withSlug.error;
      subjectRows = (withSlug.data ?? []) as CatalogSubjectRow[];
    }

    const { data: classes, error: classesError } = await db
      .from("classes")
      .select("id, name, level, description")
      .order("level", { ascending: true });

    if (classesError) throw classesError;

    return NextResponse.json({
      subjects: subjectRows.map(enrichSubject),
      classes: filterCatalogClasses(classes ?? []),
      semesters: [
        { value: 1, label: "Semester 1" },
        { value: 2, label: "Semester 2" },
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load catalog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
