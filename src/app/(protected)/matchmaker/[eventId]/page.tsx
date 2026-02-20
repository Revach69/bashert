import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getShadchanEventRequests } from "@/app/actions/matchmaker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { MatchmakerEventContent } from "@/components/matchmaker/matchmaker-event-content";

// ─── Types ──────────────────────────────────────────────────────────────────────

type MatchmakerEventPageProps = {
  params: Promise<{ eventId: string }>;
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default async function MatchmakerEventPage({ params }: MatchmakerEventPageProps) {
  const { eventId } = await params;
  const result = await getShadchanEventRequests(eventId);

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/matchmaker">
              <ArrowRight className="size-4" />
              חזרה לאירועים
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CardTitle className="mb-2 text-destructive">שגיאה</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requests = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/matchmaker">
            <ArrowRight className="size-4" />
            חזרה לאירועים
          </Link>
        </Button>
      </div>

      {/* Client component handles filtering, interactivity */}
      <MatchmakerEventContent requests={requests} />
    </div>
  );
}
