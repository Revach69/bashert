import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncUserAfterAuth } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync user to Prisma database after successful authentication
      await syncUserAfterAuth();
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login with error indicator if callback fails
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
