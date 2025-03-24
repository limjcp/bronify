import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting upload process");

    // Parse the form data
    console.log("Parsing form data");
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const artist = (formData.get("artist") as string) || "Unknown Artist";
    const file = formData.get("file") as File;
    const thumbnail = (formData.get("thumbnail") as File) || null;
    console.log(
      "Received title:",
      title,
      "Artist:",
      artist,
      "File:",
      file?.name
    );

    if (!file || !title) {
      return NextResponse.json(
        { error: "Missing title or file" },
        { status: 400 }
      );
    }

    // Bucket check
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find((b) => b.name === "songs")) {
        await supabase.storage.createBucket("songs", {
          public: true,
        });
      }
      if (!buckets?.find((b) => b.name === "thumbnails")) {
        await supabase.storage.createBucket("thumbnails", {
          public: true,
        });
      }
    } catch (error) {
      console.error("Bucket check error:", error);
    }

    // Process audio file
    const audioBytes = await file.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);
    const audioFileName = `${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { data: audioData, error: audioError } = await supabase.storage
      .from("songs")
      .upload(audioFileName, audioBuffer, {
        contentType: file.type || "audio/mpeg",
      });

    if (audioError) {
      return NextResponse.json({ error: audioError.message }, { status: 500 });
    }

    // Get public URL for the audio file
    const {
      data: { publicUrl: audioUrl },
    } = supabase.storage.from("songs").getPublicUrl(audioFileName);

    // Process thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnail) {
      const thumbnailBytes = await thumbnail.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      const thumbnailFileName = `${Date.now()}_${thumbnail.name}`;

      const { data: thumbnailData, error: thumbnailError } =
        await supabase.storage
          .from("thumbnails")
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: thumbnail.type || "image/jpeg",
          });

      if (thumbnailError) {
        console.error("Thumbnail upload error:", thumbnailError);
      } else {
        const {
          data: { publicUrl: thumbUrl },
        } = supabase.storage.from("thumbnails").getPublicUrl(thumbnailFileName);
        thumbnailUrl = thumbUrl;
      }
    }

    // Insert record into songs table using admin client to bypass RLS
    try {
      const { error: dbError } = await supabaseAdmin.from("songs").insert([
        {
          title,
          artist,
          file_url: audioUrl,
          thumbnail_url: thumbnailUrl,
          play_count: 0,
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }
    } catch (insertError) {
      console.error("Insert error details:", insertError);
      return NextResponse.json(
        {
          error: "Database insert failed",
          details:
            insertError instanceof Error
              ? insertError.message
              : String(insertError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Song uploaded successfully!",
      audioUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
