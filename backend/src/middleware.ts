import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';

  // Get allowed origins from environment variables or fallback defaults
  const envOrigins = (process.env.FRONTEND_URL || '').split(',').map((url) => url.trim());
  const allowedOrigins = [
    ...envOrigins,
    process.env.SUPERADMIN_FRONTEND_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://192.168.0.106:8081',
    'http://192.168.0.106:3000',
  ].filter(Boolean) as string[];

  const isAllowed = allowedOrigins.some((allowed) => allowed && (origin === allowed || origin.startsWith(allowed))) || !origin;

  const targetOrigin = isAllowed && origin ? origin : (envOrigins[0] || '*');

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': targetOrigin,
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers':
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  const response = NextResponse.next();
  if (origin && isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
