"use client"

import * as React from "react"
import { Heart, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { createInterestRequest } from "@/app/actions/interest"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileOption = {
  id: string
  label: string
}

type InterestButtonProps = {
  eventId: string
  requestingProfileId: string
  targetProfileId: string
  alreadySent: boolean
  /** When user owns multiple profiles, pass them here to let user choose */
  profileOptions?: ProfileOption[]
  onProfileSelect?: (profileId: string) => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function InterestButton({
  eventId,
  requestingProfileId,
  targetProfileId,
  alreadySent,
  profileOptions,
  onProfileSelect,
}: InterestButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSent, setIsSent] = React.useState(alreadySent)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  // Sync with parent prop
  React.useEffect(() => {
    setIsSent(alreadySent)
  }, [alreadySent])

  async function handleExpressInterest() {
    if (isSent || isLoading) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await createInterestRequest(
        eventId,
        requestingProfileId,
        targetProfileId,
      )
      if (!result.success) throw new Error(result.error)

      setIsSent(true)
      setSuccess(true)

      // Clear success feedback after 2 seconds
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחת הבקשה")
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Profile selector - shown when user has multiple profiles */}
      {profileOptions && profileOptions.length > 1 && !isSent && (
        <Select
          value={requestingProfileId}
          onValueChange={(value) => onProfileSelect?.(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="בחרו פרופיל" />
          </SelectTrigger>
          <SelectContent>
            {profileOptions.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Interest button */}
      <Button
        variant={isSent ? "secondary" : "default"}
        size="sm"
        disabled={isSent || isLoading}
        onClick={handleExpressInterest}
        className={cn(
          "w-full gap-2",
          success && "bg-green-600 text-white hover:bg-green-600"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            שולח...
          </>
        ) : isSent ? (
          <>
            <Heart className="size-4 fill-current" />
            נשלח
          </>
        ) : (
          <>
            <Heart className="size-4" />
            הביעו עניין
          </>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      {/* Success message */}
      {success && (
        <p className="text-xs text-green-600 text-center">
          הבקשה נשלחה בהצלחה!
        </p>
      )}
    </div>
  )
}
