"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import { getEventByJoinCode } from "@/app/actions/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Component ──────────────────────────────────────────────────────────────────

export function JoinEventForm() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [code, setCode] = React.useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!code.trim()) return

    setIsPending(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await getEventByJoinCode(code.trim().toUpperCase())

      if (result.success) {
        setSuccess(true)
        setCode("")
        // Navigate to the event detail page
        router.push(`/event/${result.data.id}`)
      } else {
        setError(result.error ?? "קוד האירוע לא נמצא. בדקו את הקוד ונסו שוב.")
      }
    } catch {
      setError("אירעה שגיאה בלתי צפויה. נסו שוב.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="flex gap-3">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="קוד אירוע"
          className="max-w-xs"
          dir="ltr"
          maxLength={6}
          aria-label="קוד הצטרפות לאירוע"
        />
        <Button type="submit" disabled={isPending || !code.trim()}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          הצטרפות
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          הצטרפתם לאירוע בהצלחה!
        </p>
      )}
    </form>
  )
}
