"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"

import type { EventWithDetails } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { EventCardItem } from "@/components/events/event-card-item"

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventListProps = {
  events: EventWithDetails[]
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין אירועים פעילים</CardTitle>
          <CardDescription className="text-center">
            הצטרפו לאירוע באמצעות קוד הזמנה או צרו אירוע חדש כדי להתחיל
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCardItem key={event.id} event={event} />
      ))}
    </div>
  )
}
