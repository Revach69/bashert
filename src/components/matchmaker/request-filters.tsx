"use client"

import * as React from "react"
import { Search, Heart } from "lucide-react"

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

// ─── Status tabs config ─────────────────────────────────────────────────────────

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "pending", label: "ממתין" },
  { value: "reviewed", label: "נבדק" },
  { value: "approved", label: "מאושר" },
  { value: "rejected", label: "נדחה" },
  { value: "archived", label: "בארכיון" },
]

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
            placeholder="חיפוש לפי שם..."
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
          הדדיות בלבד
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
