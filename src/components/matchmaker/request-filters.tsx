"use client"

import * as React from "react"
import { Search, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Types ──────────────────────────────────────────────────────────────────────

export type StatusFilter = "all" | "pending" | "reviewed" | "approved" | "rejected" | "archived"

type RequestFiltersProps = {
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  mutualOnly: boolean
  onMutualOnlyChange: (mutualOnly: boolean) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  counts: {
    all: number
    pending: number
    reviewed: number
    approved: number
    rejected: number
    archived: number
    mutual: number
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function RequestFilters({
  statusFilter,
  onStatusFilterChange,
  mutualOnly,
  onMutualOnlyChange,
  searchQuery,
  onSearchQueryChange,
  counts,
}: RequestFiltersProps) {
  const tStatus = useTranslations("status")
  const t = useTranslations("matchmaker")

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: tStatus("all") },
    { value: "pending", label: tStatus("pending") },
    { value: "reviewed", label: tStatus("reviewed") },
    { value: "approved", label: tStatus("approved") },
    { value: "rejected", label: tStatus("rejected") },
    { value: "archived", label: tStatus("archived") },
  ]

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = counts[tab.value]
          const isActive = statusFilter === tab.value

          return (
            <Button
              key={tab.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusFilterChange(tab.value)}
              className={cn("gap-1.5", isActive && "shadow-sm")}
            >
              {tab.label}
              {count > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="px-1.5 py-0 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Search and mutual toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchByName")}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="ps-9"
          />
        </div>

        <Button
          variant={mutualOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onMutualOnlyChange(!mutualOnly)}
          className="gap-1.5"
        >
          <Heart className={cn("size-4", mutualOnly && "fill-current")} />
          {t("mutualOnly")}
          {counts.mutual > 0 && (
            <Badge
              variant={mutualOnly ? "secondary" : "outline"}
              className="px-1.5 py-0 text-xs"
            >
              {counts.mutual}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}
