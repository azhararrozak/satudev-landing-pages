import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  const hasSession = !!sessionToken;

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
