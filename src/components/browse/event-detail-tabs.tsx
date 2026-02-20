"use client"

import * as React from "react"

import type { EventBrowseProfile, InterestRequestWithProfiles } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileBrowseGrid } from "@/components/browse/profile-browse-grid"
import { MyRequestsList } from "@/components/browse/my-requests-list"

// ─── Types ──────────────────────────────────────────────────────────────────────

type Tab = "browse" | "requests"

type UserProfileOption = {
  value: string
  label: string
}

type EventDetailTabsProps = {
  profiles: EventBrowseProfile[]
  requests: InterestRequestWithProfiles[]
  eventId: string
  userProfileIds: string[]
  sentInterestProfileIds: string[]
  userProfileOptions?: UserProfileOption[]
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventDetailTabs({
  profiles,
  requests,
  eventId,
  userProfileIds,
  sentInterestProfileIds,
  userProfileOptions,
}: EventDetailTabsProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>("browse")

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6" role="tablist">
        <Button
          variant={activeTab === "browse" ? "default" : "outline"}
          onClick={() => setActiveTab("browse")}
          role="tab"
          aria-selected={activeTab === "browse"}
          className={cn(
            "flex-1",
            activeTab === "browse" && "shadow-sm"
          )}
        >
          גלישה בפרופילים
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          role="tab"
          aria-selected={activeTab === "requests"}
          className={cn(
            "flex-1",
            activeTab === "requests" && "shadow-sm"
          )}
        >
          הבקשות שלי
          {requests.length > 0 && (
            <span className="ms-2 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
              {requests.length}
            </span>
          )}
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Tab content */}
      {activeTab === "browse" && (
        <ProfileBrowseGrid
          profiles={profiles}
          eventId={eventId}
          userProfileIds={userProfileIds}
          sentInterestProfileIds={sentInterestProfileIds}
          userProfileOptions={userProfileOptions}
        />
      )}

      {activeTab === "requests" && (
        <MyRequestsList requests={requests} />
      )}
    </div>
  )
}
