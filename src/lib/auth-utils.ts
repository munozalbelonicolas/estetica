import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type UserRole = 'client' | 'professional' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

/**
 * Get the current session user with roles
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permissionKey: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Admin has all permissions
  if (user.roles.includes('admin')) return true;

  const permission = await prisma.rolePermission.findFirst({
    where: {
      permission: { key: permissionKey },
      role: {
        userRoles: {
          some: { userId: user.id },
        },
      },
    },
  });

  return !!permission;
}

/**
 * Require a role or throw an error - use in API routes
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No autenticado');
  }
  if (!user.roles.includes(role) && !user.roles.includes('admin')) {
    throw new Error('No autorizado');
  }
  return user;
}

/**
 * Require permission or throw an error - use in API routes
 */
export async function requirePermission(permissionKey: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No autenticado');
  }
  if (user.roles.includes('admin')) return user;

  const hasPerm = await hasPermission(permissionKey);
  if (!hasPerm) {
    throw new Error('No autorizado');
  }
  return user;
}
