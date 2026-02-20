import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncUserAfterAuth } from "@/app/actions/auth";

/**
 * Validate the redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with "/" that don't contain "//".
 */
function getSafeRedirectPath(next: string | null): string {
  const defaultPath = "/dashboard";
  if (!next) return defaultPath;

  // Must start with "/" and must NOT start with "//" (protocol-relative URL)
  if (!next.startsWith("/") || next.startsWith("//")) {
    return defaultPath;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Sync user to Prisma database after successful authentication
        try {
          await syncUserAfterAuth();
        } catch {
          // Non-critical: user will be synced on next request
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // Redirect to login with error indicator if callback fails
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
