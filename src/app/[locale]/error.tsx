"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <AlertTriangle className="mb-4 size-12 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold">{t("pageError")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("pageErrorDescription")}
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} variant="outline">
            {t("tryAgain")}
          </Button>
          <Button asChild>
            <Link href="/">{t("homePage")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
