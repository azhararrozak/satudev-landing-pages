import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies - Better Auth uses this cookie name
  // Check both with and without dot prefix for compatibility
  const sessionToken = 
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('better-auth.session-token')?.value ||
    request.cookies.get('better_auth_session_token')?.value;
  
  const hasSession = !!sessionToken;

  // Enhanced debug logging
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll();
    console.log('Middleware Debug:', { 
      pathname, 
      hasSession,
      sessionToken: sessionToken ? 'present' : 'missing',
      allCookieNames: allCookies.map(c => c.name),
      allCookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
    });
  }

  // Also log in production for debugging (can remove after fix)
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/dashboard')) {
    const allCookies = request.cookies.getAll();
    console.log('Production Middleware:', { 
      pathname, 
      hasSession,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name)
    });
  }

  // Auth pages - redirect to homepage if already logged in
  if (pathname === '/auth/signin' || pathname === '/auth/register') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Public routes
  const publicRoutes = ['/', '/privacy-policy', '/terms-of-service', '/projects'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!hasSession) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For dashboard routes, let the client-side handle role-based checks
  // This avoids Edge Runtime issues with database access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images and static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.webp$|.*\\.ico$|.*\\.css$|.*\\.js$).*)',
  ],
};
