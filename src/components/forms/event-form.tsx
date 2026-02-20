"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { createEvent } from "@/app/actions/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventFormProps = {
  onSuccess?: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventForm({ onSuccess }: EventFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createEvent(formData)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error ?? "אירעה שגיאה. נסו שוב.")
      }
    } catch {
      setError("אירעה שגיאה בלתי צפויה. נסו שוב.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Event name */}
      <div className="grid gap-2">
        <Label htmlFor="name">שם האירוע</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="שם האירוע"
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="תיאור האירוע"
          rows={3}
        />
      </div>

      {/* Event date */}
      <div className="grid gap-2">
        <Label htmlFor="event_date">תאריך האירוע</Label>
        <Input
          id="event_date"
          name="event_date"
          type="date"
          required
          dir="ltr"
          className="text-start"
        />
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_time">שעת התחלה</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            required
            dir="ltr"
            className="text-start"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end_time">שעת סיום</Label>
          <Input
            id="end_time"
            name="end_time"
            type="time"
            required
            dir="ltr"
            className="text-start"
          />
        </div>
      </div>

      {/* Access hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pre_access_hours">שעות גישה לפני</Label>
          <Input
            id="pre_access_hours"
            name="pre_access_hours"
            type="number"
            min="0"
            max="72"
            defaultValue="0"
            dir="ltr"
            className="text-start"
          />
          <p className="text-xs text-muted-foreground">
            כמה שעות לפני האירוע ניתן לגלוש בפרופילים
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="post_access_hours">שעות גישה אחרי</Label>
          <Input
            id="post_access_hours"
            name="post_access_hours"
            type="number"
            min="0"
            max="72"
            defaultValue="0"
            dir="ltr"
            className="text-start"
          />
          <p className="text-xs text-muted-foreground">
            כמה שעות אחרי האירוע ניתן להגיש בקשות
          </p>
        </div>
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        יצירת אירוע
      </Button>
    </form>
  )
}
