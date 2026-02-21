import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getShadchanEventRequests } from "@/app/actions/matchmaker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { MatchmakerEventContent } from "@/components/matchmaker/matchmaker-event-content";
import { Link } from "@/i18n/navigation";

type MatchmakerEventPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function MatchmakerEventPage({ params }: MatchmakerEventPageProps) {
  const { eventId } = await params;
  const t = await getTranslations("matchmaker");
  const tc = await getTranslations("common");
  const result = await getShadchanEventRequests(eventId);

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/matchmaker">
              <ArrowRight className="size-4 ltr:rotate-180" />
              {t("backToEvents")}
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CardTitle className="mb-2 text-destructive">{tc("error")}</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requests = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/matchmaker">
            <ArrowRight className="size-4 ltr:rotate-180" />
            {t("backToEvents")}
          </Link>
        </Button>
      </div>

      <MatchmakerEventContent requests={requests} />
    </div>
  );
}
