// app/api/songs/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    // Fetch songs sorted by play_count descending (leaderboard)
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("play_count", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ songs: data });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
