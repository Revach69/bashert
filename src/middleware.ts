import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { countryToLocale, defaultLocale, type Locale } from '@/i18n/config';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = [
  '/dashboard',
  '/profile',
  '/event',
  '/matchmaker',
  '/organizer',
];

const authPaths = ['/auth/login', '/auth/register'];

/**
 * Detect locale from Vercel's x-vercel-ip-country header on first visit.
 * Only used when no NEXT_LOCALE cookie exists yet.
 */
function detectLocaleFromIP(request: NextRequest): Locale {
  const country = request.headers.get('x-vercel-ip-country');
  if (country && country in countryToLocale) {
    return countryToLocale[country];
  }
  return defaultLocale;
}

/**
 * Strip the locale prefix from a pathname.
 * e.g. "/he/dashboard" → "/dashboard", "/en/auth/login" → "/auth/login"
 */
function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  // segments[0] is empty string, segments[1] is locale
  if (segments.length > 2) {
    return '/' + segments.slice(2).join('/');
  }
  return '/';
}

export async function middleware(request: NextRequest) {
  // Skip locale processing for auth callback (used by Supabase directly)
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // On first visit (no locale cookie), detect locale from IP
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');
  if (!hasLocaleCookie && !request.nextUrl.pathname.match(/^\/(he|en|fr|es|ru|ar|yi|de)(\/|$)/)) {
    const detectedLocale = detectLocaleFromIP(request);
    const response = intlMiddleware(request);
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
    return response;
  }

  // Run next-intl middleware (handles locale routing)
  const response = intlMiddleware(request);

  // After intl middleware, check Supabase auth for protected routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Determine the path without locale prefix for route matching
  const pathWithoutLocale = getPathnameWithoutLocale(request.nextUrl.pathname);
  const isProtected = protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
  const isAuth = authPaths.some((path) => pathWithoutLocale.startsWith(path));

  // Only check auth for protected or auth paths
  if (!isProtected && !isAuth) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Extract locale from the URL for building redirect URLs
    const segments = request.nextUrl.pathname.split('/');
    const locale = segments[1] || defaultLocale;

    // Redirect unauthenticated users from protected paths
    if (!user && isProtected) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth pages to dashboard
    if (user && isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
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
