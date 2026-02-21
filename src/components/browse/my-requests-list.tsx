"use client"

import { Heart, Inbox, User as UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import type { InterestRequestWithProfiles } from "@/types"
import { formatHebrewDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ─── Status helpers ─────────────────────────────────────────────────────────────

type RequestStatus = "pending" | "reviewed" | "approved" | "rejected" | "archived"

function getStatusConfig(status: RequestStatus, t: (key: string) => string) {
  const configs: Record<
    RequestStatus,
    { variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    pending: { variant: "outline" },
    reviewed: { variant: "secondary" },
    approved: { variant: "default" },
    rejected: { variant: "destructive" },
    archived: { variant: "secondary" },
  }

  return {
    label: t(status),
    variant: configs[status]?.variant ?? "outline",
  }
}

function getStatusBadge(status: string, t: (key: string) => string) {
  const config = getStatusConfig(status as RequestStatus, t)
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// ─── Types ──────────────────────────────────────────────────────────────────────

type MyRequestsListProps = {
  requests: InterestRequestWithProfiles[]
}

// ─── Single request card ────────────────────────────────────────────────────────

function RequestCard({ request }: { request: InterestRequestWithProfiles }) {
  const t = useTranslations("browse")
  const ts = useTranslations("status")

  const target = request.target_profile
  const initials =
    (target.subject_first_name?.[0] ?? "") +
    (target.subject_last_name?.[0] ?? "")

  const sentDate = new Date(request.created_at)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {target.photo_url ? (
              <AvatarImage
                src={target.photo_url}
                alt={`${target.subject_first_name} ${target.subject_last_name}`}
              />
            ) : null}
            <AvatarFallback className="text-sm">
              {initials || <UserIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base">
              {target.subject_first_name} {target.subject_last_name}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {t("sentOn", { date: formatHebrewDate(sentDate) })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mutual interest indicator */}
          {request.is_mutual && (
            <span
              className="flex items-center gap-1 text-pink-600"
              title={t("mutualInterest")}
            >
              <Heart className="size-4 fill-current" />
              <span className="text-xs font-medium">{t("mutual")}</span>
            </span>
          )}
          {getStatusBadge(request.status, ts)}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {t("fromProfile", {
              name: `${request.requesting_profile.subject_first_name} ${request.requesting_profile.subject_last_name}`
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── List component ─────────────────────────────────────────────────────────────

export function MyRequestsList({ requests }: MyRequestsListProps) {
  const t = useTranslations("browse")

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{t("noRequestsTitle")}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t("noRequestsDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}
