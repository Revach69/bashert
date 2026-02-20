"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          <AlertTriangle className="mb-4 size-12 text-destructive" />
          <CardTitle className="mb-2">שגיאה</CardTitle>
          <CardDescription className="mb-6 text-center">
            אירעה שגיאה בטעינת הדף. נסו שוב או חזרו לדף הבית.
          </CardDescription>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline">
              נסו שוב
            </Button>
            <Button asChild>
              <Link href="/">דף הבית</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
