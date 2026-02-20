import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  // TODO: Get user session from auth context to show role-based nav
  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Heart className="size-6 text-primary" />
          <span className="text-xl font-bold text-primary">בשערט</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              {/* TODO: Show role-based navigation links */}
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                לוח בקרה
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                פרופילים
              </Link>
              <Button variant="ghost" size="sm">
                {/* TODO: Implement logout */}
                יציאה
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  כניסה
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">הרשמה</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  );
}
