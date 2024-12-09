import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Define an array of protected routes
const protectedRoutes = ['/dashboard'];

export async function middleware(request) {
  const { supabase } = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // If user is authenticated and trying to access root path
  if (user && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};