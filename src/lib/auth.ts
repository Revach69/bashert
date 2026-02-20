import { createSupabaseServerClient } from './supabase/server';
import { prisma } from './prisma';

/**
 * Get the current Supabase auth session.
 * Returns null if the user is not authenticated.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the currently authenticated user from the database.
 * Combines Supabase Auth (session) with Prisma (user record).
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
