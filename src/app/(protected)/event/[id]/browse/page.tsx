import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { EventBrowseProfile, EventWithDetails } from "@/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BrowsePageContent } from "@/components/browse/browse-page-content"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "גלישה בפרופילים | באשרט",
  description: "גלישה בפרופילי המשתתפים באירוע",
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

export default async function BrowsePage({ params }: PageProps) {
  const { id } = await params

  const [event, profiles, userProfileIds, sentInterestProfileIds] =
    await Promise.all([
      getEventDetails(id),
      getEventProfiles(id),
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with back navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={`/event/${id}`}>
            <ArrowRight className="size-4" />
            חזרה לאירוע
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">גלישה בפרופילים</h1>
        <p className="mt-2 text-muted-foreground">
          {event.name} &mdash; {event._count.participations} משתתפים
        </p>
      </div>

      <Separator className="mb-6" />

      {/* Browse content with filters */}
      <BrowsePageContent
        allProfiles={profiles}
        eventId={id}
        userProfileIds={userProfileIds}
        sentInterestProfileIds={sentInterestProfileIds}
      />
    </div>
  )
}
