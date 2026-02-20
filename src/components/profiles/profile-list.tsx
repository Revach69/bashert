"use client"

import * as React from "react"
import type { ProfileCard } from "@prisma/client"
import { UserCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { ProfileCardItem } from "@/components/profiles/profile-card-item"
import { CreateProfileDialog } from "@/components/profiles/create-profile-dialog"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileListProps = {
  profiles: ProfileCard[]
}

// ─── Placeholder delete action (will be wired to server actions) ────────────

async function deleteProfile(
  _id: string
): Promise<{ success: boolean; error?: string }> {
  // Placeholder - will be wired to server actions from @/app/actions/profile
  return { success: true }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfileList({ profiles: initialProfiles }: ProfileListProps) {
  const [profiles, setProfiles] =
    React.useState<ProfileCard[]>(initialProfiles)

  async function handleDelete(id: string) {
    const result = await deleteProfile(id)
    if (result.success) {
      setProfiles((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserCircle className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין עדיין כרטיסי פרופיל</CardTitle>
          <CardDescription className="mb-6 text-center">
            צרו את כרטיס הפרופיל הראשון שלכם כדי להתחיל להשתתף באירועים
          </CardDescription>
          <CreateProfileDialog variant="empty-state" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCardItem
          key={profile.id}
          profile={profile}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
