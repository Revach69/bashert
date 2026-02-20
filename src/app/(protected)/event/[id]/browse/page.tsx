import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getEventById } from "@/app/actions/event"
import { getEventBrowseProfiles } from "@/app/actions/browse"
import { getSentInterestTargetIds } from "@/app/actions/interest"
import { getMyProfiles } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BrowsePageContent } from "@/components/browse/browse-page-content"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "גלישה בפרופילים | באשרט",
  description: "גלישה בפרופילי המשתתפים באירוע",
}

// ─── Page Component (Server Component) ──────────────────────────────────────────

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BrowsePage({ params }: PageProps) {
  const { id } = await params

  const [eventResult, profilesResult, myProfilesResult, sentIdsResult] =
    await Promise.all([
      getEventById(id),
      getEventBrowseProfiles(id),
      getMyProfiles(),
      getSentInterestTargetIds(id),
    ])

  const event = eventResult.success ? eventResult.data : null
  const profiles = profilesResult.success ? profilesResult.data : []
  const myProfiles = myProfilesResult.success ? myProfilesResult.data : []
  const userProfileIds = myProfiles.map((p) => p.id)
  const userProfileOptions = myProfiles.map((p) => ({
    value: p.id,
    label: `${p.subject_first_name} ${p.subject_last_name}`,
  }))
  const sentInterestProfileIds = sentIdsResult.success ? sentIdsResult.data : []

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
        userProfileOptions={userProfileOptions}
      />
    </div>
  )
}
