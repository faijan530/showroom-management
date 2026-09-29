import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Define Public Discovery Routes where browsing is 100% public (No login required)
  const isPublicDiscovery =
    pathname === '/' ||
    pathname === '/vehicles' ||
    pathname.startsWith('/vehicles/') ||
    pathname === '/spare-parts' ||
    pathname.startsWith('/spare-parts/') ||
    pathname === '/services' ||
    pathname === '/customer/services' ||
    pathname === '/showrooms' ||
    pathname.startsWith('/showrooms/') ||
    pathname === '/about' ||
    pathname === '/platform/login' ||
    pathname.startsWith('/auth/');

  // 1. Guard SuperAdmin / Platform routes (/platform/*)
  if (pathname.startsWith('/platform') && pathname !== '/platform/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
  }

  // 2. Guard Authenticated Application & Personal Workflow routes
  // Protected paths: /admin/*, /worker/*, /inventory/*, and /customer/* (except /customer/services)
  const isProtectedAppRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/worker') ||
    pathname.startsWith('/inventory') ||
    (pathname.startsWith('/customer') && pathname !== '/customer/services');

  if (isProtectedAppRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If token exists and visiting /auth/* pages, redirect to main landing
  if (token && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
