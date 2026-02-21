"use client"

import * as React from "react"
import type { ProfileWithCreator } from "@/types"
import { Pencil, Trash2, User as UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { calculateAge } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

type ProfileCardItemProps = {
  profile: ProfileWithCreator
  onDelete?: (id: string) => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfileCardItem({ profile, onDelete }: ProfileCardItemProps) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState(false)
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")

  const age = calculateAge(new Date(profile.date_of_birth))
  const genderLabel = profile.gender === "male" ? tCommon("male") : tCommon("female")
  const genderIcon = profile.gender === "male" ? "♂" : "♀"
  const initials =
    (profile.subject_first_name?.[0] ?? "") +
    (profile.subject_last_name?.[0] ?? "")

  function handleDeleteClick() {
    if (deleteConfirm) {
      onDelete?.(profile.id)
      setDeleteConfirm(false)
    } else {
      setDeleteConfirm(true)
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(false), 3000)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="size-14">
          {profile.photo_url ? (
            <AvatarImage
              src={profile.photo_url}
              alt={`${profile.subject_first_name} ${profile.subject_last_name}`}
            />
          ) : null}
          <AvatarFallback className="text-lg">
            {initials || <UserIcon className="size-6" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            {profile.subject_first_name} {profile.subject_last_name}
            <span className="text-muted-foreground" aria-label={genderLabel}>
              {genderIcon}
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{tCommon("age", { age })}</span>
            {profile.hashkafa && (
              <>
                <span aria-hidden="true">&#183;</span>
                <span>{profile.hashkafa}</span>
              </>
            )}
            {profile.occupation && (
              <>
                <span aria-hidden="true">&#183;</span>
                <span>{profile.occupation}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {profile.education && (
            <Badge variant="secondary">{profile.education}</Badge>
          )}
          {profile.ethnicity && (
            <Badge variant="secondary">{profile.ethnicity}</Badge>
          )}
          {profile.height && (
            <Badge variant="outline">{profile.height}</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {/* Edit dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Pencil className="size-4" />
              {t("editButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("editDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("editDialogDescription", {
                  name: `${profile.subject_first_name} ${profile.subject_last_name}`
                })}
              </DialogDescription>
            </DialogHeader>
            <ProfileForm
              initialData={profile}
              onSuccess={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete button */}
        <Button
          variant={deleteConfirm ? "destructive" : "outline"}
          size="sm"
          onClick={handleDeleteClick}
        >
          <Trash2 className="size-4" />
          {deleteConfirm ? t("deleteConfirm") : t("deleteButton")}
        </Button>
      </CardFooter>
    </Card>
  )
}
