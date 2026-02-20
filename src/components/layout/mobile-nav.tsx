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

interface MobileNavProps {
  isAuthenticated: boolean;
}

export function MobileNav({ isAuthenticated }: MobileNavProps) {
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
              {/* TODO: Show role-based navigation links */}
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
              <Separator />
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  // TODO: Implement logout
                  setOpen(false);
                }}
              >
                יציאה
              </Button>
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
