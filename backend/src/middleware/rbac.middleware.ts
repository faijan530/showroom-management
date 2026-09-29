import { NextRequest } from 'next/server';
import { authenticateRequest } from './auth.middleware';
import { ForbiddenError } from '@/shared/errors/forbidden.error';
import { JwtPayload, Role } from '@/shared/types/auth';

export async function authorizeRoles(req: NextRequest, allowedRoles: Role[]): Promise<JwtPayload> {
  const user = await authenticateRequest(req);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
  }
  return user;
}
