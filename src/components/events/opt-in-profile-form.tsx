"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"

import { optInProfile } from "@/app/actions/event"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link } from "@/i18n/navigation"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileOption = {
  id: string
  name: string
}

type OptInProfileFormProps = {
  eventId: string
  userProfileIds: string[]
  /** Display names keyed by profile ID – needed for the multi-profile selector */
  profileOptions?: ProfileOption[]
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function OptInProfileForm({
  eventId,
  userProfileIds,
  profileOptions = [],
}: OptInProfileFormProps) {
  const t = useTranslations("event")
  const tc = useTranslations("common")
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedProfileId, setSelectedProfileId] = React.useState<string>(
    userProfileIds.length === 1 ? userProfileIds[0] : ""
  )

  // ── No profiles at all ────────────────────────────────────────────────────
  if (userProfileIds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground">
            {t("createProfileFirst")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">{t("createProfileLink")}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  async function handleOptIn() {
    const profileId = selectedProfileId
    if (!profileId) return

    setIsPending(true)
    setError(null)

    try {
      const result = await optInProfile(eventId, profileId)

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error ?? t("joinEventError"))
      }
    } catch {
      setError(tc("unexpectedError"))
    } finally {
      setIsPending(false)
    }
  }

  // ── Single profile – simple button ────────────────────────────────────────
  if (userProfileIds.length === 1) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm font-medium">{t("joinWithProfile")}</p>

          <Button
            onClick={handleOptIn}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {t("joinEventButton")}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  // ── Multiple profiles – select + button ───────────────────────────────────
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm font-medium">
          {t("selectProfileForEvent")}
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Select
            value={selectedProfileId}
            onValueChange={setSelectedProfileId}
            dir="rtl"
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectProfile")} />
            </SelectTrigger>
            <SelectContent>
              {profileOptions.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleOptIn}
            disabled={isPending || !selectedProfileId}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {t("joinEventButton")}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
