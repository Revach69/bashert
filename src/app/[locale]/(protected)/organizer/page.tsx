import { Plus, CalendarDays, Users, MessageSquare, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getOrganizerStats } from "@/app/actions/dashboard";
import { formatHebrewDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrganizerJoinCodeCopy } from "@/components/organizer/join-code-copy";
import { EventActions } from "@/components/organizer/event-actions";
import { Link } from "@/i18n/navigation";

export default async function OrganizerPage() {
  const t = await getTranslations("organizer");
  const tc = await getTranslations("common");
  const result = await getOrganizerStats();

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

  const { events, totalParticipants, totalRequests } = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/event">
            <Plus className="size-4" />
            {t("newEvent")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{t("eventsLabel")}</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.length === 0
                ? t("noEventsYet")
                : t("activeCount", { count: events.filter((e) => e.is_active).length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{t("participantsLabel")}</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">{tc("totalInAllEvents")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{tc("interestRequests")}</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">{tc("totalInAllEvents")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="mb-4 size-16 text-muted-foreground/50" />
            <CardTitle className="mb-2">{t("noEventsTitle")}</CardTitle>
            <CardDescription className="mb-6 text-center">
              {t("noEventsDescription")}
            </CardDescription>
            <Button asChild>
              <Link href="/event">
                <Plus className="size-4" />
                {t("createFirstEvent")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("myEvents")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const startTime = new Date(event.start_time);
              const endTime = new Date(event.end_time);
              const participantCount = event._count.participations;
              const requestCount = event._count.interest_requests;
              const now = new Date();
              const isActive = event.is_active;
              const isPast = now > new Date(event.end_time);

              return (
                <Card key={event.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      {!isActive ? (
                        <Badge variant="secondary">{tc("inactive")}</Badge>
                      ) : isPast ? (
                        <Badge variant="secondary">{tc("ended")}</Badge>
                      ) : (
                        <Badge variant="default">{tc("active")}</Badge>
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

                    {event.matchmaker && (
                      <div className="text-sm text-muted-foreground">
                        <span>{t("matchmakerLabel")}</span>
                        <span className="font-medium text-foreground">
                          {event.matchmaker.full_name}
                        </span>
                      </div>
                    )}

                    <OrganizerJoinCodeCopy joinCode={event.join_code} />
                  </CardContent>

                  <div className="space-y-2 px-6 pb-6">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/event/${event.id}`}>
                        {tc("viewAll")}
                      </Link>
                    </Button>
                    <EventActions eventId={event.id} isActive={isActive} />
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
