import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Clock, Eye, Hash, Users } from "lucide-react"

import { formatHebrewDate, formatTime } from "@/lib/utils"
import type {
  EventBrowseProfile,
  EventWithDetails,
  InterestRequestWithProfiles,
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EventDetailTabs } from "@/components/browse/event-detail-tabs"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "פרטי אירוע | באשרט",
  description: "צפייה בפרטי האירוע, גלישה בפרופילים והבעת עניין",
}

// ─── Data fetching placeholders ─────────────────────────────────────────────────

async function getEventDetails(
  eventId: string
): Promise<EventWithDetails | null> {
  // Placeholder - will call server action / prisma query:
  // import { getEventById } from "@/app/actions/event"
  // const result = await getEventById(eventId)
  // return result.success ? result.data : null

  // Development stub
  return {
    id: eventId,
    name: "אירוע לדוגמה",
    description: "אירוע שידוכים לדוגמה",
    event_date: new Date(),
    start_time: new Date(),
    end_time: new Date(Date.now() + 3 * 60 * 60 * 1000),
    join_code: "ABC123",
    is_active: true,
    pre_access_hours: 2,
    post_access_hours: 24,
    organizer_id: "org-1",
    matchmaker_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    organizer: { id: "org-1", full_name: "מארגן לדוגמה" },
    matchmaker: null,
    _count: { participations: 0, interest_requests: 0 },
  } as EventWithDetails
}

async function getEventProfiles(
  _eventId: string
): Promise<EventBrowseProfile[]> {
  // Placeholder - will call server action / prisma query:
  // import { getEventBrowseProfiles } from "@/app/actions/browse"
  // const result = await getEventBrowseProfiles(eventId)
  // return result.success ? result.data : []
  return []
}

async function getMyRequests(
  _eventId: string
): Promise<InterestRequestWithProfiles[]> {
  // Placeholder - will call server action / prisma query:
  // import { getMyInterestRequests } from "@/app/actions/interest"
  // const result = await getMyInterestRequests(eventId)
  // return result.success ? result.data : []
  return []
}

async function getUserProfileIds(): Promise<string[]> {
  // Placeholder - returns IDs of profiles owned by current user:
  // import { getMyProfileIds } from "@/app/actions/profile"
  // const result = await getMyProfileIds()
  // return result.success ? result.data : []
  return []
}

async function getSentInterestProfileIds(
  _eventId: string
): Promise<string[]> {
  // Placeholder - returns target profile IDs the user already sent interest to:
  // import { getSentInterestTargetIds } from "@/app/actions/interest"
  // const result = await getSentInterestTargetIds(eventId)
  // return result.success ? result.data : []
  return []
}

// ─── Page Component (Server Component) ──────────────────────────────────────────

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params

  const [event, profiles, requests, userProfileIds, sentInterestProfileIds] =
    await Promise.all([
      getEventDetails(id),
      getEventProfiles(id),
      getMyRequests(id),
      getUserProfileIds(),
      getSentInterestProfileIds(id),
    ])

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">האירוע לא נמצא</h1>
        <p className="mt-2 text-muted-foreground">
          ייתכן שהאירוע הוסר או שאין לכם גישה אליו.
        </p>
        <Button asChild className="mt-6">
          <Link href="/event">חזרה לאירועים</Link>
        </Button>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Event info header */}
      <Card className="mb-8">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">{event.name}</CardTitle>
            {event.description && (
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>
          <Badge variant={event.is_active ? "default" : "secondary"}>
            {event.is_active ? "פעיל" : "לא פעיל"}
          </Badge>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>{formatHebrewDate(eventDate)}</span>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>{event._count.participations} משתתפים</span>
          </div>

          {/* Join code */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="size-4 shrink-0" />
            <span>קוד:</span>
            <code
              dir="ltr"
              className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-start"
            >
              {event.join_code}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Browse link for full-page experience */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">פרופילים ובקשות</h2>
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href={`/event/${id}/browse`}>
            <Eye className="size-4" />
            גלישה מלאה עם סינון
          </Link>
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Tabs: Browse Profiles / My Requests */}
      <EventDetailTabs
        profiles={profiles}
        requests={requests}
        eventId={id}
        userProfileIds={userProfileIds}
        sentInterestProfileIds={sentInterestProfileIds}
      />
    </div>
  )
}
