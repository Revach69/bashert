"use client"

import * as React from "react"
import { Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Placeholder action (will be replaced by server actions) ────────────────

async function joinEvent(
  _code: string
): Promise<{ success: boolean; error?: string }> {
  // Placeholder - will be wired to server actions from @/app/actions/event
  return { success: true }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function JoinEventForm() {
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
      const result = await joinEvent(code.trim().toUpperCase())

      if (result.success) {
        setSuccess(true)
        setCode("")
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
