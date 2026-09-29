import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { UnauthorizedError } from '@/shared/errors/unauthorized.error';
import { JwtPayload } from '@/shared/types/auth';

export async function authenticateRequest(req: NextRequest): Promise<JwtPayload> {
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.cookies.get('access_token')?.value;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token missing');
  }

  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
