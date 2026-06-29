import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      lessonId,
      currentTime,
      duration,
      seekDetected,
    } = await req.json();

    if (
      !lessonId ||
      typeof currentTime !== "number" ||
      typeof duration !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const isSeekDetected =
      Boolean(seekDetected);

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const existingMax =
      existing?.max_watched_second ?? 0;

    const existingSeekCount =
      existing?.seek_count ?? 0;

    const previousSeekState =
      existing?.seek_detected ?? false;

    let maxWatched =
      existingMax;

    let seekCount =
      existingSeekCount;

    // Track furthest watched position
    maxWatched = Math.max(
      existingMax,
      Math.floor(currentTime)
    );

    // Count only NEW seek events
    if (
      isSeekDetected &&
      !previousSeekState
    ) {
      seekCount += 1;
    }

    const watchPercentage =
      duration > 0
        ? Math.min(
            100,
            (
              maxWatched /
              duration
            ) * 100
          )
        : 0;

    // Completion depends on watch progress
    const completed =
      watchPercentage >= 90;

    const payload = {
      user_id: user.id,

      lesson_id: lessonId,

      last_watched_second:
        Math.floor(currentTime),

      max_watched_second:
        Math.floor(maxWatched),

      watch_percentage:
        watchPercentage,

      seek_count:
        seekCount,

      seek_detected:
        isSeekDetected,

      completed,

      completed_at:
        completed
          ? existing?.completed_at ??
            new Date().toISOString()
          : null,
    };

    const { error } = await supabase
      .from("lesson_progress")
      .upsert(payload, {
        onConflict:
          "user_id,lesson_id",
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      currentTime,

      duration,

      seekDetected:
        isSeekDetected,

      seekCount,

      watchPercentage,

      maxWatched,

      completed,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}