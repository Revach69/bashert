import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedPaths = [
  '/dashboard',
  '/profile',
  '/event',
  '/matchmaker',
  '/organizer',
];

const authPaths = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users from protected paths
    if (
      !user &&
      protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth pages to dashboard
    if (
      user &&
      authPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch {
    // On auth errors, pass through and let the page handle it
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
