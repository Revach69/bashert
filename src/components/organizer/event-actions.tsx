"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { toggleEventActive } from "@/app/actions/event"
import { Button } from "@/components/ui/button"

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventActionsProps = {
  eventId: string
  isActive: boolean
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventActions({ eventId, isActive }: EventActionsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleToggle() {
    setIsPending(true)

    try {
      const result = await toggleEventActive(eventId)

      if (result.success) {
        router.refresh()
      }
    } catch {
      // Silently fail – the page will remain in its current state
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant={isActive ? "destructive" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className="w-full gap-2"
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {isActive ? "השבתת אירוע" : "הפעלת אירוע"}
    </Button>
  )
}
