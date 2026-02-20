import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock, Eye, Hash, Users } from "lucide-react"

import { formatHebrewDate, formatTime } from "@/lib/utils"
import { getEventById, getEventParticipants } from "@/app/actions/event"
import { getEventBrowseProfiles } from "@/app/actions/browse"
import { getInterestRequestsForEvent, getSentInterestTargetIds } from "@/app/actions/interest"
import { getMyProfiles } from "@/app/actions/profile"
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
import { OptInProfileForm } from "@/components/events/opt-in-profile-form"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "פרטי אירוע | באשרט",
  description: "צפייה בפרטי האירוע, גלישה בפרופילים והבעת עניין",
}

// ─── Page Component (Server Component) ──────────────────────────────────────────

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params

  const [eventResult, profilesResult, requestsResult, myProfilesResult, sentIdsResult, participantsResult] =
    await Promise.all([
      getEventById(id),
      getEventBrowseProfiles(id),
      getInterestRequestsForEvent(id),
      getMyProfiles(),
      getSentInterestTargetIds(id),
      getEventParticipants(id),
    ])

  const event = eventResult.success ? eventResult.data : null
  const profiles = profilesResult.success ? profilesResult.data : []
  const requests = requestsResult.success ? requestsResult.data : []
  const myProfiles = myProfilesResult.success ? myProfilesResult.data : []
  const userProfileIds = myProfiles.map((p) => p.id)
  const sentInterestProfileIds = sentIdsResult.success ? sentIdsResult.data : []
  const participants = participantsResult.success ? participantsResult.data : []

  // Determine which of the user's profiles are already participating in this event
  const participantProfileIds = new Set(participants.map((p) => p.id))
  const userOptedInProfileIds = userProfileIds.filter((pid) => participantProfileIds.has(pid))
  const userNotOptedInProfileIds = userProfileIds.filter((pid) => !participantProfileIds.has(pid))
  const hasOptedIn = userOptedInProfileIds.length > 0

  // Build profile options for the opt-in dropdown (only profiles not yet opted in)
  const profileOptions = myProfiles
    .filter((p) => !participantProfileIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name: `${p.subject_first_name} ${p.subject_last_name}`,
    }))

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

      {/* Opt-in section */}
      {hasOptedIn && userNotOptedInProfileIds.length === 0 ? (
        <div className="mb-8 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
          <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            אתם משתתפים באירוע זה
          </p>
        </div>
      ) : userNotOptedInProfileIds.length > 0 ? (
        <div className="mb-8 space-y-3">
          {hasOptedIn && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
              <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                חלק מהפרופילים שלכם כבר משתתפים באירוע
              </p>
            </div>
          )}
          <OptInProfileForm
            eventId={id}
            userProfileIds={userNotOptedInProfileIds}
            profileOptions={profileOptions}
          />
        </div>
      ) : userProfileIds.length === 0 ? (
        <div className="mb-8">
          <OptInProfileForm
            eventId={id}
            userProfileIds={[]}
            profileOptions={[]}
          />
        </div>
      ) : null}

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
