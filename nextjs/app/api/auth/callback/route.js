import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Auth callback initiated with code:', code ? 'present' : 'absent');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('User authenticated:', user.id);
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select()
        .eq('user_id', user.id) 
        .maybeSingle();


      if (userError) {
        console.error('Error checking existing user:', userError);
      } else if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            auth_email: user.email,
          });

        if (insertError) {
          console.error('Error inserting new user:', insertError);
        } else {
          console.log('New user inserted successfully');
        }
      } else {
        console.log('User exists in users table');
      }
    } else {
      console.log('No user data returned from getUser');
    }
  }

  console.log('Redirecting to:', requestUrl.origin + '/dashboard');
  return NextResponse.redirect(requestUrl.origin + '/dashboard');
}
