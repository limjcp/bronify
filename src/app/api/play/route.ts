import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { songId } = body;

    if (!songId) {
      console.error("Missing songId in request");
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    console.log("Updating play count for song:", songId);

    // Fetch current song data
    const { data: song, error: fetchError } = await supabase
      .from("songs")
      .select("play_count")
      .eq("id", songId)
      .single();

    if (fetchError) {
      console.error("Error fetching song:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!song) {
      console.error("Song not found:", songId);
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Ensure play_count exists and is a number
    const currentPlayCount =
      typeof song.play_count === "number" ? song.play_count : 0;
    const newCount = currentPlayCount + 1;

    console.log("Updating song with new count:", newCount);

    // Update song play count
    const { error: updateError } = await supabase
      .from("songs")
      .update({ play_count: newCount })
      .eq("id", songId);

    if (updateError) {
      console.error("Error updating play count:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("Successfully updated play count for song:", songId);
    return NextResponse.json({
      message: "Play count updated",
      newCount,
    });
  } catch (error) {
    console.error("Unexpected error updating play count:", error);
    return NextResponse.json(
      { error: "Failed to update play count" },
      { status: 500 }
    );
  }
}
