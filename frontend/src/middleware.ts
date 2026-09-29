import { NextResponse, NextRequest } from 'next/server';

const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/platform/login',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));

  // 1. Guard /platform/* routes
  if (pathname.startsWith('/platform') && pathname !== '/platform/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
  }

  // 2. Guard general application routes when unauthenticated
  if (!isPublic && !token && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
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
