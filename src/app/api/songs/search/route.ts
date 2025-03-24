import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get("artist");
    const title = searchParams.get("title");
    const sortBy = searchParams.get("sortBy") || "play_count";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Start building the query
    let query = supabase.from("songs").select("*");

    // Apply filters if they exist
    if (artist) {
      query = query.ilike("artist", `%${artist}%`);
    }
    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    // Apply sorting
    if (sortOrder.toLowerCase() === "asc") {
      query = query.order(sortBy, { ascending: true });
    } else {
      query = query.order(sortBy, { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      songs: data,
      count,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error("Error searching songs:", error);
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
