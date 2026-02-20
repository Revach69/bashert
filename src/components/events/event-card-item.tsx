"use client"

import * as React from "react"
import { CalendarDays, Clock, Users } from "lucide-react"

import { formatHebrewDate, formatTime } from "@/lib/utils"
import type { EventWithDetails } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventCardItemProps = {
  event: EventWithDetails
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getStatusBadge(event: EventWithDetails) {
  const now = new Date()
  const eventDate = new Date(event.event_date)
  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)

  if (!event.is_active) {
    return <Badge variant="secondary">לא פעיל</Badge>
  }

  if (now < startTime) {
    // Event hasn't started
    const isToday = eventDate.toDateString() === now.toDateString()
    if (isToday) {
      return <Badge variant="default">היום</Badge>
    }
    return <Badge variant="outline">ממתין</Badge>
  }

  if (now >= startTime && now <= endTime) {
    return <Badge variant="default">פעיל כעת</Badge>
  }

  return <Badge variant="secondary">הסתיים</Badge>
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventCardItem({ event }: EventCardItemProps) {
  const eventDate = new Date(event.event_date)
  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)
  const participantCount = event._count.participations

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <CardTitle className="text-lg">{event.name}</CardTitle>
        {getStatusBadge(event)}
      </CardHeader>

      <CardContent className="grid gap-3">
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
          <span>{participantCount} משתתפים</span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Join code */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">קוד הצטרפות:</span>
          <code
            dir="ltr"
            className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-start"
          >
            {event.join_code}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}
