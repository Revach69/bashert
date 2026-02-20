"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" dir="rtl">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <AlertTriangle className="mb-4 size-12 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold">שגיאה</h1>
        <p className="mb-6 text-muted-foreground">
          אירעה שגיאה בטעינת הדף. נסו שוב או חזרו לדף הבית.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} variant="outline">
            נסו שוב
          </Button>
          <Button asChild>
            <Link href="/">דף הבית</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
