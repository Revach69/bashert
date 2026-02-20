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
      return { success: false, error: 'לא נמצאה הרשאה פעילה' };
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

    // Parse roles from metadata, default to ['creator']
    let roles: Role[] = ['creator'];
    if (Array.isArray(metadata.roles)) {
      const validRoles: Role[] = ['creator', 'matchmaker', 'organizer'];
      const parsedRoles = (metadata.roles as string[]).filter((r): r is Role =>
        validRoles.includes(r as Role)
      );
      if (parsedRoles.length > 0) {
        roles = parsedRoles;
      }
    }

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
    return { success: false, error: 'שגיאה בסנכרון המשתמש' };
  }
}

// ─── Update User Roles ──────────────────────────────────────────────────────

export async function updateUserRoles(
  roles: string[]
): Promise<ActionResponse<User>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'יש להתחבר כדי לעדכן תפקידים' };
    }

    // Validate roles
    const validRoles: Role[] = ['creator', 'matchmaker', 'organizer'];
    const filteredRoles = roles.filter((r): r is Role =>
      validRoles.includes(r as Role)
    );

    if (filteredRoles.length === 0) {
      return { success: false, error: 'נא לבחור לפחות תפקיד אחד תקין' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { roles: filteredRoles },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('updateUserRoles error:', error);
    return { success: false, error: 'שגיאה בעדכון התפקידים' };
  }
}
