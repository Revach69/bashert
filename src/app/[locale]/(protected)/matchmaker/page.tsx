import { Heart, Users, MessageSquare, CalendarDays, Clock, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getShadchanEvents } from "@/app/actions/matchmaker";
import { formatHebrewDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function MatchmakerPage() {
  const t = await getTranslations("matchmaker");
  const tc = await getTranslations("common");
  const result = await getShadchanEvents();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CardTitle className="mb-2 text-destructive">{tc("error")}</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const events = result.data;

  const totalEvents = events.length;
  const totalPendingRequests = events.reduce(
    (sum, event) => sum + event._count.interest_requests,
    0
  );
  const totalParticipants = events.reduce(
    (sum, event) => sum + event._count.participations,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{tc("events")}</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">{t("assignedEvents")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{tc("interestRequests")}</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingRequests}</div>
            <p className="text-xs text-muted-foreground">{t("totalRequestsInEvents")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{tc("profiles")}</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">{t("totalParticipantsInEvents")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="mb-4 size-16 text-muted-foreground/50" />
            <CardTitle className="mb-2">{t("noAssignedEvents")}</CardTitle>
            <CardDescription className="text-center">
              {t("noAssignedEventsDescription")}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{tc("events")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const startTime = new Date(event.start_time);
              const endTime = new Date(event.end_time);
              const requestCount = event._count.interest_requests;
              const participantCount = event._count.participations;

              return (
                <Card key={event.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      {requestCount > 0 && (
                        <Badge variant="default" className="shrink-0">
                          {tc("requests", { count: requestCount })}
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-4 shrink-0" />
                      <span>{formatHebrewDate(eventDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4 shrink-0" />
                      <span>
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 shrink-0" />
                      <span>{tc("participants", { count: participantCount })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="size-4 shrink-0" />
                      <span>{tc("requests", { count: requestCount })}</span>
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <Button asChild className="w-full gap-1.5">
                      <Link href={`/matchmaker/${event.id}`}>
                        {t("viewRequests")}
                        <ArrowLeft className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
