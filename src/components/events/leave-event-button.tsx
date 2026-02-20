"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"

import { leaveEvent } from "@/app/actions/event"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ─── Types ──────────────────────────────────────────────────────────────────────

type LeaveEventButtonProps = {
  eventId: string
  profileId: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function LeaveEventButton({ eventId, profileId }: LeaveEventButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleLeave() {
    setIsPending(true)
    setError(null)

    try {
      const result = await leaveEvent(eventId, profileId)

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error ?? "שגיאה בעזיבת האירוע")
        setTimeout(() => setError(null), 3000)
      }
    } catch {
      setError("אירעה שגיאה בלתי צפויה. נסו שוב.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-2 text-destructive hover:text-destructive"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            עזיבת אירוע
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>עזיבת אירוע</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתם בטוחים שברצונכם לעזוב את האירוע? פעולה זו תסיר את הפרופיל
              מהאירוע ותמחק את כל בקשות העניין הקשורות אליו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLeave}>
              עזיבת אירוע
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
