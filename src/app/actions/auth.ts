'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import type { ActionResponse } from '@/types';
import type { User, Role } from '@prisma/client';

// ─── Sync User After Auth ───────────────────────────────────────────────────
// Called after Supabase auth (login/register). Ensures the user exists in the
// Prisma database. If not, creates a record from Supabase user metadata.

export async function syncUserAfterAuth(): Promise<ActionResponse<User>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'actions.noActiveAuth' };
    }

    const supabaseUser = session.user;

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (existingUser) {
      return { success: true, data: existingUser };
    }

    // Extract metadata from Supabase user
    const metadata = supabaseUser.user_metadata ?? {};
    const fullName =
      (metadata.full_name as string) ||
      (metadata.name as string) ||
      supabaseUser.email?.split('@')[0] ||
      '';
    const phone = (metadata.phone as string) || null;

    // SECURITY: Always assign 'creator' role to new users.
    // Roles from user_metadata are IGNORED to prevent privilege escalation.
    // Role elevation should only be performed by an admin.
    const roles: Role[] = ['creator'];

    const newUser = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: fullName,
        phone,
        roles,
      },
    });

    return { success: true, data: newUser };
  } catch (error) {
    console.error('syncUserAfterAuth error:', error);
    return { success: false, error: 'actions.syncError' };
  }
}

// ─── Update User Roles ──────────────────────────────────────────────────────
// REMOVED: updateUserRoles() was a privilege escalation vulnerability.
// Users could self-assign any role (matchmaker, organizer) without authorization.
// Role changes should only be performed by an admin through a secure admin panel.
