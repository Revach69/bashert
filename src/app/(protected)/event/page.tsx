import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreateEventDialog } from "@/components/events/create-event-dialog"
import { EventList } from "@/components/events/event-list"
import { JoinEventForm } from "@/components/events/join-event-form"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "אירועים | באשרט",
  description: "ניהול אירועים והצטרפות לאירועים חדשים",
}

// ─── Data fetching placeholder ──────────────────────────────────────────────────

async function getMyEvents() {
  // Placeholder - will call server action / prisma query
  // import { getMyEvents } from "@/app/actions/event"
  // const result = await getMyEvents()
  // return result.success ? result.data : []
  return []
}

// ─── Page Component (Server Component) ──────────────────────────────────────────

export default async function EventPage() {
  const events = await getMyEvents()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">אירועים</h1>
        <p className="mt-2 text-muted-foreground">
          הצטרפו לאירועים בקוד הזמנה וגלשו בפרופילים של משתתפים אחרים.
        </p>
      </div>

      {/* Join Event section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>הצטרפות לאירוע</CardTitle>
          <CardDescription>
            הזינו את קוד האירוע שקיבלתם מהמארגן
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JoinEventForm />
        </CardContent>
      </Card>

      <Separator className="mb-8" />

      {/* My Events section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">האירועים שלי</h2>
        <CreateEventDialog />
      </div>

      <EventList events={events} />
    </div>
  )
}
