import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: "Missing song ID" }, { status: 400 });
    }

    const { data: song, error } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song details" },
      { status: 500 }
    );
  }
}
