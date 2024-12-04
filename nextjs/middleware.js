import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Define an array of protected routes
const protectedRoutes = ['/dashboard'];

export async function middleware(request) {
 
  const { supabase } = createClient(request);


  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  if (!user && isProtectedRoute) {
    console.log('User not logged in and trying to access a protected route');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('User logged in or accessing a non-protected route');
  return NextResponse.next();
}

export const config = {
  //this regex makes it so the middleware doesn't run on static files or images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};