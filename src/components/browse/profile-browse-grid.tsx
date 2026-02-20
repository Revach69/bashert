"use client"

import * as React from "react"
import { User as UserIcon } from "lucide-react"

import type { EventBrowseProfile } from "@/types"
import { calculateAge } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InterestButton } from "@/components/browse/interest-button"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileBrowseGridProps = {
  profiles: EventBrowseProfile[]
  eventId: string
  /** IDs of profiles owned by the current user (to determine which profile requests from) */
  userProfileIds: string[]
  /** Profile IDs the user has already sent interest requests to */
  sentInterestProfileIds?: string[]
}

// ─── Single browse card ─────────────────────────────────────────────────────────

function ProfileBrowseCard({
  profile,
  eventId,
  userProfileIds,
  alreadySent,
}: {
  profile: EventBrowseProfile
  eventId: string
  userProfileIds: string[]
  alreadySent: boolean
}) {
  const [selectedProfileId, setSelectedProfileId] = React.useState(
    userProfileIds[0] ?? ""
  )

  const age = calculateAge(new Date(profile.date_of_birth))
  const genderLabel = profile.gender === "male" ? "זכר" : "נקבה"
  const genderIcon = profile.gender === "male" ? "♂" : "♀"
  const initials =
    (profile.subject_first_name?.[0] ?? "") +
    (profile.subject_last_name?.[0] ?? "")

  const profileOptions = userProfileIds.length > 1
    ? userProfileIds.map((id, index) => ({
        id,
        label: `פרופיל ${index + 1}`,
      }))
    : undefined

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="size-14">
          {profile.photo_url ? (
            <AvatarImage
              src={profile.photo_url}
              alt={`${profile.subject_first_name} ${profile.subject_last_name}`}
            />
          ) : null}
          <AvatarFallback className="text-lg">
            {initials || <UserIcon className="size-6" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            {profile.subject_first_name} {profile.subject_last_name}
            <span className="text-muted-foreground" aria-label={genderLabel}>
              {genderIcon}
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>גיל {age}</span>
            {profile.hashkafa && (
              <>
                <span aria-hidden="true">&#183;</span>
                <span>{profile.hashkafa}</span>
              </>
            )}
            {profile.occupation && (
              <>
                <span aria-hidden="true">&#183;</span>
                <span>{profile.occupation}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {profile.education && (
            <Badge variant="secondary">{profile.education}</Badge>
          )}
          {profile.ethnicity && (
            <Badge variant="secondary">{profile.ethnicity}</Badge>
          )}
          {profile.height && (
            <Badge variant="outline">{profile.height}</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <InterestButton
          eventId={eventId}
          requestingProfileId={selectedProfileId}
          targetProfileId={profile.id}
          alreadySent={alreadySent}
          profileOptions={profileOptions}
          onProfileSelect={setSelectedProfileId}
        />
      </CardFooter>
    </Card>
  )
}

// ─── Grid component ─────────────────────────────────────────────────────────────

export function ProfileBrowseGrid({
  profiles,
  eventId,
  userProfileIds,
  sentInterestProfileIds = [],
}: ProfileBrowseGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UserIcon className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">אין פרופילים להצגה</h3>
        <p className="text-sm text-muted-foreground mt-2">
          לא נמצאו פרופילים התואמים את הסינון שנבחר. נסו לשנות את הפילטרים.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileBrowseCard
          key={profile.id}
          profile={profile}
          eventId={eventId}
          userProfileIds={userProfileIds}
          alreadySent={sentInterestProfileIds.includes(profile.id)}
        />
      ))}
    </div>
  )
}
