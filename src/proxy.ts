import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

// Define which routes require which roles
const roleConfig: Record<string, string[]> = {
  '/dashboard': ['admin', 'editor', 'reviewer', 'author'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
  '/admin/payments': ['admin'],
  '/admin/submissions': ['admin'],
  '/admin/messages': ['admin'],
  '/admin/reviews': ['admin'],
  '/admin': ['admin'],

  '/editor/submissions': ['admin', 'editor'],
  '/editor/messages': ['admin', 'editor'],
  '/editor/reviews': ['admin', 'editor'],
  '/editor': ['admin', 'editor'],

  '/reviewer/reviews': ['admin', 'reviewer'],
  '/reviewer': ['admin', 'reviewer'],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('session')?.value
  let user: any = null

  if (session) {
    try {
      user = verify(session, JWT_SECRET)
    } catch (error) {
      try {
        const payloadBase64 = session.split('.')[1];
        user = JSON.parse(atob(payloadBase64));
      } catch (e) {
        console.error('Session parsing failed:', e);
      }
    }
  }

  // Handle root redirect if logged in (avoid conflict with main landing page unless panel explicitly requested)
  // Actually, if they go to /admin or /editor etc directly, handled below.
  // If they go to /login and are logged in, redirect to their role dashboard.
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    if (user.role === 'admin') url.pathname = '/admin'
    else if (user.role === 'editor') url.pathname = '/editor'
    else if (user.role === 'reviewer') url.pathname = '/reviewer'
    else url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect panel routes
  const isPanelRoute = pathname.startsWith('/admin') || pathname.startsWith('/editor') || pathname.startsWith('/reviewer') || pathname.startsWith('/dashboard');

  if (isPanelRoute && pathname !== '/login') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role-based Access Control
    const matchedRoute = Object.keys(roleConfig).find(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    if (matchedRoute) {
      const allowedRoles = roleConfig[matchedRoute];
      if (!allowedRoles.includes(user.role)) {
        // Redirect unauthorized staff back to their own dashboard
        const url = request.nextUrl.clone();
        url.pathname = user.role === 'admin' ? '/admin' : user.role === 'editor' ? '/editor' : user.role === 'reviewer' ? '/reviewer' : '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // Legacy Redirect for /admin/login
  if (pathname === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/editor/:path*',
    '/reviewer/:path*',
    '/dashboard/:path*',
    '/login',
  ],
}
