"use client"

import * as React from "react"
import {
  Heart,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Eye,
  Archive,
  Save,
  Mail,
  Phone,
} from "lucide-react"
import type { RequestStatus } from "@prisma/client"

import { cn, calculateAge } from "@/lib/utils"
import type { InterestRequestWithProfiles } from "@/types"
import { updateRequestStatus, addMatchmakerNote } from "@/app/actions/matchmaker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ──────────────────────────────────────────────────────────────────────

type RequestCardProps = {
  request: InterestRequestWithProfiles
}

// ─── Status helpers ─────────────────────────────────────────────────────────────

const statusLabels: Record<RequestStatus, string> = {
  pending: "ממתין",
  reviewed: "נבדק",
  approved: "מאושר",
  rejected: "נדחה",
  archived: "בארכיון",
}

const statusVariants: Record<RequestStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  reviewed: "secondary",
  approved: "default",
  rejected: "destructive",
  archived: "secondary",
}

// ─── Profile Side Component ─────────────────────────────────────────────────────

function ProfileSide({
  profile,
  label,
}: {
  profile: InterestRequestWithProfiles["requesting_profile"]
  label: string
}) {
  const age = calculateAge(new Date(profile.date_of_birth))
  const genderLabel = profile.gender === "male" ? "זכר" : "נקבה"
  const initials =
    (profile.subject_first_name?.[0] ?? "") +
    (profile.subject_last_name?.[0] ?? "")

  return (
    <div className="flex-1 space-y-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          {profile.photo_url ? (
            <AvatarImage
              src={profile.photo_url}
              alt={`${profile.subject_first_name} ${profile.subject_last_name}`}
            />
          ) : null}
          <AvatarFallback className="text-sm">
            {initials || <UserIcon className="size-5" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {profile.subject_first_name} {profile.subject_last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {genderLabel}, גיל {age}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {profile.hashkafa && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">השקפה:</span>
            <span>{profile.hashkafa}</span>
          </div>
        )}
        {profile.occupation && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">עיסוק:</span>
            <span>{profile.occupation}</span>
          </div>
        )}
        {profile.education && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">השכלה:</span>
            <span>{profile.education}</span>
          </div>
        )}
        {profile.ethnicity && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">עדה:</span>
            <span>{profile.ethnicity}</span>
          </div>
        )}
        {profile.family_background && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">רקע משפחתי:</span>
            <span>{profile.family_background}</span>
          </div>
        )}
        {profile.height && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">גובה:</span>
            <span>{profile.height}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Contact Info Component ─────────────────────────────────────────────────────

function ContactInfo({
  profile,
}: {
  profile: InterestRequestWithProfiles["requesting_profile"]
}) {
  const creator = profile.creator

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        איש קשר: {creator.full_name}
      </p>
      {creator.email && (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="size-3.5 text-muted-foreground" />
          <a
            href={`mailto:${creator.email}`}
            className="text-primary hover:underline"
            dir="ltr"
          >
            {creator.email}
          </a>
        </div>
      )}
      {creator.phone && (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="size-3.5 text-muted-foreground" />
          <a
            href={`tel:${creator.phone}`}
            className="text-primary hover:underline"
            dir="ltr"
          >
            {creator.phone}
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function RequestCard({ request }: RequestCardProps) {
  const [showContact, setShowContact] = React.useState(false)
  const [showNotes, setShowNotes] = React.useState(false)
  const [noteText, setNoteText] = React.useState(request.matchmaker_notes ?? "")
  const [isPending, startTransition] = React.useTransition()
  const [confirmReject, setConfirmReject] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = React.useState<RequestStatus>(request.status)

  // Reset confirmReject after timeout
  React.useEffect(() => {
    if (confirmReject) {
      const timer = setTimeout(() => setConfirmReject(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confirmReject])

  function handleStatusChange(newStatus: RequestStatus) {
    if (newStatus === "rejected" && !confirmReject) {
      setConfirmReject(true)
      return
    }
    setConfirmReject(false)
    setError(null)

    startTransition(async () => {
      const result = await updateRequestStatus(request.id, newStatus)
      if (result.success) {
        setCurrentStatus(newStatus)
      } else {
        setError(result.error)
      }
    })
  }

  function handleSaveNote() {
    setError(null)
    startTransition(async () => {
      const result = await addMatchmakerNote(request.id, noteText)
      if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <Card className={cn(request.is_mutual && "border-pink-300 dark:border-pink-700")}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {request.is_mutual && (
            <Badge variant="default" className="gap-1 bg-pink-500 hover:bg-pink-600">
              <Heart className="size-3 fill-current" />
              הדדי
            </Badge>
          )}
          <Badge variant={statusVariants[currentStatus]}>
            {statusLabels[currentStatus]}
          </Badge>
        </div>
        <CardTitle className="text-sm text-muted-foreground">
          {new Date(request.created_at).toLocaleDateString("he-IL")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Side-by-side profiles: requesting on the right (start), target on the left (end) */}
        <div className="relative grid gap-6 sm:grid-cols-2">
          <ProfileSide
            profile={request.requesting_profile}
            label="מבקש/ת"
          />
          <div className="hidden sm:block absolute inset-y-0 start-1/2 w-px bg-border" />
          <ProfileSide
            profile={request.target_profile}
            label="מועמד/ת"
          />
        </div>

        {/* Divider on mobile */}
        <div className="sm:hidden h-px bg-border" />

        {/* Contact info (expandable) */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContact(!showContact)}
            className="gap-1.5 text-muted-foreground"
          >
            {showContact ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            פרטי קשר
          </Button>

          {showContact && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 rounded-lg border p-4">
              <div>
                <p className="mb-2 text-xs font-semibold">צד מבקש</p>
                <ContactInfo profile={request.requesting_profile} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">צד מועמד</p>
                <ContactInfo profile={request.target_profile} />
              </div>
            </div>
          )}
        </div>

        {/* Notes section (expandable) */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="gap-1.5 text-muted-foreground"
          >
            {showNotes ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            הערות שדכן/ית
            {request.matchmaker_notes && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </Button>

          {showNotes && (
            <div className="mt-3 space-y-3">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="הוסיפו הערות פנימיות..."
                rows={3}
                className="resize-none"
              />
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={isPending}
                className="gap-1.5"
              >
                <Save className="size-4" />
                {isPending ? "שומר..." : "שמירת הערה"}
              </Button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        {/* Action buttons based on current status */}
        {currentStatus === "pending" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("reviewed")}
              disabled={isPending}
              className="gap-1.5"
            >
              <Eye className="size-4" />
              סימון כנבדק
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("approved")}
              disabled={isPending}
              className="gap-1.5"
            >
              <Check className="size-4" />
              אישור
            </Button>
            <Button
              size="sm"
              variant={confirmReject ? "destructive" : "outline"}
              onClick={() => handleStatusChange("rejected")}
              disabled={isPending}
              className="gap-1.5"
            >
              <X className="size-4" />
              {confirmReject ? "לחצו שוב לאישור דחייה" : "דחייה"}
            </Button>
          </>
        )}

        {currentStatus === "reviewed" && (
          <>
            <Button
              size="sm"
              onClick={() => handleStatusChange("approved")}
              disabled={isPending}
              className="gap-1.5"
            >
              <Check className="size-4" />
              אישור
            </Button>
            <Button
              size="sm"
              variant={confirmReject ? "destructive" : "outline"}
              onClick={() => handleStatusChange("rejected")}
              disabled={isPending}
              className="gap-1.5"
            >
              <X className="size-4" />
              {confirmReject ? "לחצו שוב לאישור דחייה" : "דחייה"}
            </Button>
          </>
        )}

        {currentStatus === "approved" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("archived")}
            disabled={isPending}
            className="gap-1.5"
          >
            <Archive className="size-4" />
            העברה לארכיון
          </Button>
        )}

        {currentStatus === "rejected" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("pending")}
              disabled={isPending}
              className="gap-1.5"
            >
              החזרה לממתין
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("archived")}
              disabled={isPending}
              className="gap-1.5"
            >
              <Archive className="size-4" />
              העברה לארכיון
            </Button>
          </>
        )}

        {currentStatus === "archived" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("pending")}
            disabled={isPending}
            className="gap-1.5"
          >
            החזרה לממתין
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
