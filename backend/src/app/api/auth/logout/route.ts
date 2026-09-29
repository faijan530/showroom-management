import { NextResponse } from 'next/server';
import { ApiResponse } from '@/shared/response/api-response';

export async function POST() {
  const response = ApiResponse.success({ message: 'Logged out successfully' });
  
  response.cookies.set('access_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
