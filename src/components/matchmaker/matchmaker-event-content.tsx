"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { useTranslations } from "next-intl"

import type { InterestRequestWithProfiles } from "@/types"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { EventStatsCard } from "@/components/matchmaker/event-stats-card"
import { RequestFilters, type StatusFilter } from "@/components/matchmaker/request-filters"
import { RequestCard } from "@/components/matchmaker/request-card"

// ─── Types ──────────────────────────────────────────────────────────────────────

type MatchmakerEventContentProps = {
  requests: InterestRequestWithProfiles[]
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function MatchmakerEventContent({ requests }: MatchmakerEventContentProps) {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [mutualOnly, setMutualOnly] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const t = useTranslations("matchmaker")
  const tCommon = useTranslations("common")

  // Calculate counts
  const counts = React.useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      reviewed: requests.filter((r) => r.status === "reviewed").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
      archived: requests.filter((r) => r.status === "archived").length,
      mutual: requests.filter((r) => r.is_mutual).length,
    }
  }, [requests])

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    return requests.filter((request) => {
      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false
      }

      // Mutual only
      if (mutualOnly && !request.is_mutual) {
        return false
      }

      // Search query (search by profile names)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const requestingName =
          `${request.requesting_profile.subject_first_name} ${request.requesting_profile.subject_last_name}`.toLowerCase()
        const targetName =
          `${request.target_profile.subject_first_name} ${request.target_profile.subject_last_name}`.toLowerCase()
        if (!requestingName.includes(query) && !targetName.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [requests, statusFilter, mutualOnly, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("requestsTitle")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("requestsDescription")}
        </p>
      </div>

      {/* Stats */}
      <EventStatsCard
        totalRequests={counts.all}
        pendingCount={counts.pending}
        mutualCount={counts.mutual}
        approvedCount={counts.approved}
      />

      {/* Filters */}
      <RequestFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        mutualOnly={mutualOnly}
        onMutualOnlyChange={setMutualOnly}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        counts={counts}
      />

      {/* Request list */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="mb-4 size-16 text-muted-foreground/50" />
            <CardTitle className="mb-2">
              {requests.length === 0
                ? t("noRequestsYet")
                : t("noMatchingResults")}
            </CardTitle>
            <CardDescription className="text-center">
              {requests.length === 0
                ? t("noRequestsYetDescription")
                : t("noMatchingResultsDescription")}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tCommon("requestsOutOf", { count: filteredRequests.length, total: requests.length })}
          </p>
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
