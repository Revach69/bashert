"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/layout/logout-button";

interface MobileNavProps {
  isAuthenticated: boolean;
  isMatchmaker?: boolean;
  isOrganizer?: boolean;
}

export function MobileNav({
  isAuthenticated,
  isMatchmaker = false,
  isOrganizer = false,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="תפריט ניווט">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="size-5 text-primary" />
            <span className="text-primary">בשערט</span>
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <nav className="flex flex-col gap-2 px-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                לוח בקרה
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                פרופילים
              </Link>
              <Link
                href="/event"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                אירועים
              </Link>
              {isMatchmaker && (
                <Link
                  href="/matchmaker"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  שדכן
                </Link>
              )}
              {isOrganizer && (
                <Link
                  href="/organizer"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  מארגן
                </Link>
              )}
              <Separator />
              <LogoutButton
                variant="ghost"
                className="justify-start"
                onLogout={() => setOpen(false)}
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                כניסה
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}>
                <Button className="w-full">הרשמה</Button>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
