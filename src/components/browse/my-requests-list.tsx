import { Heart, Inbox, User as UserIcon } from "lucide-react"

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

const statusConfig: Record<
  RequestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "ממתין", variant: "outline" },
  reviewed: { label: "נבדק", variant: "secondary" },
  approved: { label: "אושר", variant: "default" },
  rejected: { label: "נדחה", variant: "destructive" },
  archived: { label: "בארכיון", variant: "secondary" },
}

function getStatusBadge(status: string) {
  const config = statusConfig[status as RequestStatus] ?? {
    label: status,
    variant: "outline" as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// ─── Types ──────────────────────────────────────────────────────────────────────

type MyRequestsListProps = {
  requests: InterestRequestWithProfiles[]
}

// ─── Single request card ────────────────────────────────────────────────────────

function RequestCard({ request }: { request: InterestRequestWithProfiles }) {
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
              נשלח ב-{formatHebrewDate(sentDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mutual interest indicator */}
          {request.is_mutual && (
            <span
              className="flex items-center gap-1 text-pink-600"
              title="עניין הדדי"
            >
              <Heart className="size-4 fill-current" />
              <span className="text-xs font-medium">הדדי</span>
            </span>
          )}
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            מפרופיל: {request.requesting_profile.subject_first_name}{" "}
            {request.requesting_profile.subject_last_name}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── List component ─────────────────────────────────────────────────────────────

export function MyRequestsList({ requests }: MyRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">אין בקשות עדיין</h3>
        <p className="text-sm text-muted-foreground mt-2">
          גלשו בפרופילים והביעו עניין כדי לראות את הבקשות שלכם כאן.
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
