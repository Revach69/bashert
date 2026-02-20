import { createSupabaseServerClient } from './supabase/server';
import { prisma } from './prisma';

/**
 * Get the currently authenticated Supabase user.
 * Uses supabase.auth.getUser() which validates the JWT against the
 * Supabase auth server, unlike getSession() which only reads the JWT
 * without validation.
 *
 * Returns a session-like object { user } for backward compatibility,
 * or null if the user is not authenticated.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { user };
}

/**
 * Get the currently authenticated user from the database.
 * Combines Supabase Auth (validated user) with Prisma (user record).
 * Returns null if not authenticated or if no matching DB user exists.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
