"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          <AlertTriangle className="mb-4 size-12 text-destructive" />
          <CardTitle className="mb-2">{t("pageError")}</CardTitle>
          <CardDescription className="mb-6 text-center">
            {t("pageErrorDescription")}
          </CardDescription>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline">
              {t("tryAgain")}
            </Button>
            <Button asChild>
              <Link href="/">{t("homePage")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
