import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get("since");

    let query = supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (since) {
      query = query.gt("created_at", since);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, message } = await request.json();

    if (!username || !message) {
      return NextResponse.json(
        { error: "Username and message are required" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("chat_messages").insert([
      {
        username,
        message,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Delete old messages keeping only the latest 100
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("created_at")
      .order("created_at", { ascending: false });

    if (messages && messages.length > 100) {
      const cutoffDate = messages[100].created_at;
      await supabase
        .from("chat_messages")
        .delete()
        .lt("created_at", cutoffDate);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting message:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}
