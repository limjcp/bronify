import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET() {
  try {
    console.log('Initializing chat system...');
    // First check if table exists
    const { error: checkError } = await supabaseAdmin
      .from('chat_messages')
      .select('id')
      .limit(1);

    // If we got a "relation does not exist" error, create the table
    if (checkError?.message?.includes('relation "chat_messages" does not exist')) {
      console.log('Creating chat_messages table...');
      const { error: createError } = await supabaseAdmin
        .from('chat_messages')
        .insert([
          {
            id: '00000000-0000-0000-0000-000000000000',
            username: 'system',
            message: 'Chat initialized',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (createError && !createError.message.includes('already exists')) {
        console.error('Error creating chat_messages table:', createError);
        throw createError;
      }

      // Delete the initialization record
      await supabaseAdmin
        .from('chat_messages')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
    }

    return NextResponse.json({ initialized: true });
  } catch (error) {
    console.error('Error in chat initialization:', error);
    return NextResponse.json(
      { error: 'Failed to initialize chat' },
      { status: 500 }
    );
  }
}