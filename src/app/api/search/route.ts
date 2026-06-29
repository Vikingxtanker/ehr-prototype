import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const [subjectsResult, chaptersResult] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("id,title")
        .ilike("title", `%${query}%`)
        .limit(5),

      supabase
        .from("chapters")
        .select("id,title,subject_id")
        .ilike("title", `%${query}%`)
        .limit(5),
    ]);

  return NextResponse.json({
    subjects:
      subjectsResult.data ?? [],

    chapters:
      chaptersResult.data ?? [],
  });
}