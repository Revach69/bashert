import { Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export async function Footer() {
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{tc("appName")}</span>
          </div>
          <Separator className="max-w-xs" />
          <p className="text-center text-xs text-muted-foreground">
            {t("footerCopyright", { year: currentYear })}
          </p>
          <p className="text-center text-xs text-muted-foreground">
            {t("footerTagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
