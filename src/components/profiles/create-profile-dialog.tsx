"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProfileForm } from "@/components/forms/profile-form"

// ─── Types ──────────────────────────────────────────────────────────────────────

type CreateProfileDialogProps = {
  variant?: "default" | "empty-state"
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function CreateProfileDialog({
  variant = "default",
}: CreateProfileDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "empty-state" ? (
          <Button>
            <Plus className="size-4" />
            יצירת כרטיס פרופיל ראשון
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            צור פרופיל חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>יצירת כרטיס פרופיל חדש</DialogTitle>
          <DialogDescription>
            מלאו את הפרטים ליצירת כרטיס פרופיל. ניתן ליצור כרטיסים עבור עצמכם
            או עבור בני משפחה.
          </DialogDescription>
        </DialogHeader>
        <ProfileForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
