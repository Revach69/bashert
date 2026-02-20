"use client"

import * as React from "react"
import { Filter } from "lucide-react"

import type { EventBrowseProfile, ProfileFilters } from "@/types"
import { calculateAge } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProfileBrowseGrid } from "@/components/browse/profile-browse-grid"
import { ProfileFiltersPanel } from "@/components/browse/profile-filters"

// ─── Types ──────────────────────────────────────────────────────────────────────

type BrowsePageContentProps = {
  allProfiles: EventBrowseProfile[]
  eventId: string
  userProfileIds: string[]
  sentInterestProfileIds: string[]
}

// ─── Filter logic ───────────────────────────────────────────────────────────────

function applyFilters(
  profiles: EventBrowseProfile[],
  filters: ProfileFilters
): EventBrowseProfile[] {
  return profiles.filter((profile) => {
    // Gender filter
    if (filters.gender && profile.gender !== filters.gender) {
      return false
    }

    // Age range filter
    const age = calculateAge(new Date(profile.date_of_birth))
    if (filters.min_age && age < filters.min_age) {
      return false
    }
    if (filters.max_age && age > filters.max_age) {
      return false
    }

    // Hashkafa filter (case-insensitive contains)
    if (
      filters.hashkafa &&
      profile.hashkafa &&
      !profile.hashkafa.includes(filters.hashkafa)
    ) {
      return false
    }
    if (filters.hashkafa && !profile.hashkafa) {
      return false
    }

    // Ethnicity filter (case-insensitive contains)
    if (
      filters.ethnicity &&
      profile.ethnicity &&
      !profile.ethnicity.includes(filters.ethnicity)
    ) {
      return false
    }
    if (filters.ethnicity && !profile.ethnicity) {
      return false
    }

    return true
  })
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function BrowsePageContent({
  allProfiles,
  eventId,
  userProfileIds,
  sentInterestProfileIds,
}: BrowsePageContentProps) {
  const [filters, setFilters] = React.useState<ProfileFilters>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  const filteredProfiles = applyFilters(allProfiles, filters)

  function handleFiltersChange(newFilters: ProfileFilters) {
    setFilters(newFilters)
    setMobileFiltersOpen(false)
  }

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar filters */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border bg-card p-4">
          <ProfileFiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile filter trigger */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm text-muted-foreground">
            {filteredProfiles.length} פרופילים
          </span>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="size-4" />
                סינון
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>סינון פרופילים</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <ProfileFiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop result count */}
        <div className="mb-4 hidden lg:block">
          <span className="text-sm text-muted-foreground">
            {filteredProfiles.length} פרופילים מתוך {allProfiles.length}
          </span>
        </div>

        {/* Profile grid */}
        <ProfileBrowseGrid
          profiles={filteredProfiles}
          eventId={eventId}
          userProfileIds={userProfileIds}
          sentInterestProfileIds={sentInterestProfileIds}
        />
      </div>
    </div>
  )
}
