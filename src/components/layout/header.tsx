import { Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getSession, getCurrentUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import type { Role } from "@prisma/client";

export async function Header() {
  const t = await getTranslations("common");
  let isAuthenticated = false;
  let isMatchmaker = false;
  let isOrganizer = false;

  try {
    const session = await getSession();
    const user = session ? await getCurrentUser() : null;
    isAuthenticated = !!user;
    const roles: Role[] = user?.roles ?? [];
    isMatchmaker = roles.includes("matchmaker");
    isOrganizer = roles.includes("organizer");
  } catch {
    // Fall back to unauthenticated state on auth/DB errors
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="size-6 text-primary" />
          <span className="text-xl font-bold text-primary">{t("appName")}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("dashboard")}
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("profiles")}
              </Link>
              <Link
                href="/event"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("events")}
              </Link>
              {isMatchmaker && (
                <Link
                  href="/matchmaker"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("matchmaker")}
                </Link>
              )}
              {isOrganizer && (
                <Link
                  href="/organizer"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("organizer")}
                </Link>
              )}
              <LogoutButton />
              <LanguageSwitcher />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
              <LanguageSwitcher />
            </>
          )}
        </nav>

        <div className="md:hidden">
          <MobileNav
            isAuthenticated={isAuthenticated}
            isMatchmaker={isMatchmaker}
            isOrganizer={isOrganizer}
          />
        </div>
      </div>
    </header>
  );
}
