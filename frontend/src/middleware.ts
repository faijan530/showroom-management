import { NextResponse, NextRequest } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  if (!isPublic && !token && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
