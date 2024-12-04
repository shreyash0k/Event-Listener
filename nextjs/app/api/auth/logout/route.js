import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}