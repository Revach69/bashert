"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("profile")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "empty-state" ? (
          <Button>
            <Plus className="size-4" />
            {t("createFirstProfile")}
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            {t("createNewProfile")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("createDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("createDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <ProfileForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
