import Link from "next/link";
import { Plus, CalendarDays, Users, MessageSquare, Clock } from "lucide-react";

import { getOrganizerStats } from "@/app/actions/dashboard";
import { formatHebrewDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrganizerJoinCodeCopy } from "@/components/organizer/join-code-copy";
import { EventActions } from "@/components/organizer/event-actions";

export default async function OrganizerPage() {
  const result = await getOrganizerStats();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CardTitle className="mb-2 text-destructive">שגיאה</CardTitle>
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
          <h1 className="text-3xl font-bold">לוח בקרה - מארגן/ת</h1>
          <p className="mt-2 text-muted-foreground">
            צרו ונהלו אירועים, הקצו שדכנים והפיצו קודי הזמנה.
          </p>
        </div>
        <Button asChild>
          <Link href="/event">
            <Plus className="size-4" />
            אירוע חדש
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">אירועים</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.length === 0
                ? "עדיין לא נוצרו אירועים"
                : `${events.filter((e) => e.is_active).length} פעילים`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">משתתפים</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              סה״כ בכל האירועים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">בקשות עניין</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              סה״כ בכל האירועים
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="mb-4 size-16 text-muted-foreground/50" />
            <CardTitle className="mb-2">אין אירועים עדיין</CardTitle>
            <CardDescription className="mb-6 text-center">
              צרו את האירוע הראשון שלכם והתחילו להזמין משתתפים
            </CardDescription>
            <Button asChild>
              <Link href="/event">
                <Plus className="size-4" />
                יצירת אירוע ראשון
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">האירועים שלי</h2>
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
                        <Badge variant="secondary">לא פעיל</Badge>
                      ) : isPast ? (
                        <Badge variant="secondary">הסתיים</Badge>
                      ) : (
                        <Badge variant="default">פעיל</Badge>
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
                      <span>{participantCount} משתתפים</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="size-4 shrink-0" />
                      <span>{requestCount} בקשות עניין</span>
                    </div>

                    {event.matchmaker && (
                      <div className="text-sm text-muted-foreground">
                        <span>שדכן/ית: </span>
                        <span className="font-medium text-foreground">
                          {event.matchmaker.full_name}
                        </span>
                      </div>
                    )}

                    {/* Join code - copyable */}
                    <OrganizerJoinCodeCopy joinCode={event.join_code} />
                  </CardContent>

                  <div className="space-y-2 px-6 pb-6">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/event/${event.id}`}>
                        צפייה באירוע
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
