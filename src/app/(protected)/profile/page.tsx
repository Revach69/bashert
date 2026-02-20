import type { Metadata } from "next"

import { CreateProfileDialog } from "@/components/profiles/create-profile-dialog"
import { ProfileList } from "@/components/profiles/profile-list"

// ─── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "כרטיסי פרופיל | באשרט",
  description: "ניהול כרטיסי הפרופיל שלכם",
}

// ─── Data fetching placeholder ──────────────────────────────────────────────────

async function getProfiles() {
  // Placeholder - will call server action / prisma query
  // import { getMyProfiles } from "@/app/actions/profile"
  // const result = await getMyProfiles()
  // return result.success ? result.data : []
  return []
}

// ─── Page Component (Server Component) ──────────────────────────────────────────

export default async function ProfilePage() {
  const profiles = await getProfiles()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">כרטיסי פרופיל</h1>
          <p className="mt-2 text-muted-foreground">
            נהלו את כרטיסי הפרופיל שלכם. ניתן ליצור כרטיסים עבור עצמכם או עבור
            בני משפחה.
          </p>
        </div>
        <CreateProfileDialog />
      </div>

      {/* Profile cards grid */}
      <ProfileList profiles={profiles} />
    </div>
  )
}
