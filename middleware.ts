import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/backend/auth';
import type { UserRole } from '@/schema/auth-schema';

export async function middleware(request: NextRequest) {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Auth pages - redirect to dashboard if already logged in (admin/penulis only)
  if (pathname === '/auth/signin' || pathname === '/auth/register') {
    if (session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      const userRole = (user.role || 'user') as UserRole;
      
      // Redirect to dashboard if admin or penulis, otherwise to homepage
      if (userRole === 'admin' || userRole === 'penulis') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Public routes
  const publicRoutes = ['/', '/privacy-policy', '/terms-of-service'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  const userRole = (user.role || 'user') as UserRole;

  // Dashboard access - only for admin and penulis
  if (pathname.startsWith('/dashboard')) {
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/dashboard/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Penulis and Admin routes (content creation)
  if (pathname.startsWith('/dashboard/posts/new') || pathname.startsWith('/dashboard/posts/edit')) {
    if (userRole !== 'admin' && userRole !== 'penulis') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
  ],
};
