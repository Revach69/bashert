"use client"

import * as React from "react"
import type { ProfileCard } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { createProfile, updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileFormProps = {
  initialData?: Partial<ProfileCard>
  onSuccess?: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [gender, setGender] = React.useState<string>(
    initialData?.gender ?? ""
  )
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("gender", gender)

      if (initialData?.id) {
        formData.set("id", initialData.id)
      }

      const result = initialData?.id
        ? await updateProfile(formData)
        : await createProfile(formData)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error ?? tCommon("genericError"))
      }
    } catch {
      setError(tCommon("unexpectedError"))
    } finally {
      setIsPending(false)
    }
  }

  // Format date for date input (YYYY-MM-DD)
  const defaultDateOfBirth = initialData?.date_of_birth
    ? new Date(initialData.date_of_birth).toISOString().split("T")[0]
    : ""

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name fields - two column grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="subject_first_name">{t("firstName")}</Label>
          <Input
            id="subject_first_name"
            name="subject_first_name"
            required
            defaultValue={initialData?.subject_first_name ?? ""}
            placeholder={t("firstName")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject_last_name">{t("lastName")}</Label>
          <Input
            id="subject_last_name"
            name="subject_last_name"
            required
            defaultValue={initialData?.subject_last_name ?? ""}
            placeholder={t("lastName")}
          />
        </div>
      </div>

      {/* Gender & Date of Birth */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gender">{t("gender")}</Label>
          <Select value={gender} onValueChange={setGender} name="gender" required>
            <SelectTrigger id="gender">
              <SelectValue placeholder={t("selectGender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{tCommon("male")}</SelectItem>
              <SelectItem value="female">{tCommon("female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date_of_birth">{t("dateOfBirth")}</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            required
            dir="ltr"
            className="text-start"
            defaultValue={defaultDateOfBirth}
          />
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="subject_email">{t("email")}</Label>
          <Input
            id="subject_email"
            name="subject_email"
            type="email"
            dir="ltr"
            className="text-start"
            defaultValue={initialData?.subject_email ?? ""}
            placeholder="email@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject_phone">{t("phone")}</Label>
          <Input
            id="subject_phone"
            name="subject_phone"
            type="tel"
            dir="ltr"
            className="text-start"
            defaultValue={initialData?.subject_phone ?? ""}
            placeholder="050-1234567"
          />
        </div>
      </div>

      {/* Height & Occupation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="height">{t("height")}</Label>
          <Input
            id="height"
            name="height"
            defaultValue={initialData?.height ?? ""}
            placeholder={t("heightPlaceholder")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="occupation">{t("occupation")}</Label>
          <Input
            id="occupation"
            name="occupation"
            defaultValue={initialData?.occupation ?? ""}
            placeholder={t("occupation")}
          />
        </div>
      </div>

      {/* Education & Ethnicity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="education">{t("education")}</Label>
          <Input
            id="education"
            name="education"
            defaultValue={initialData?.education ?? ""}
            placeholder={t("education")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ethnicity">{t("ethnicity")}</Label>
          <Input
            id="ethnicity"
            name="ethnicity"
            defaultValue={initialData?.ethnicity ?? ""}
            placeholder={t("ethnicity")}
          />
        </div>
      </div>

      {/* Hashkafa */}
      <div className="grid gap-2">
        <Label htmlFor="hashkafa">{t("hashkafa")}</Label>
        <Input
          id="hashkafa"
          name="hashkafa"
          defaultValue={initialData?.hashkafa ?? ""}
          placeholder={t("hashkafaPlaceholder")}
        />
      </div>

      {/* Photo URL */}
      <div className="grid gap-2">
        <Label htmlFor="photo_url">{t("photoUrl")}</Label>
        <Input
          id="photo_url"
          name="photo_url"
          type="url"
          dir="ltr"
          className="text-start"
          defaultValue={initialData?.photo_url ?? ""}
          placeholder="https://example.com/photo.jpg"
        />
        <p className="text-sm text-muted-foreground">{t("photoUrlHelp")}</p>
      </div>

      {/* Family background */}
      <div className="grid gap-2">
        <Label htmlFor="family_background">{t("familyBackground")}</Label>
        <Textarea
          id="family_background"
          name="family_background"
          defaultValue={initialData?.family_background ?? ""}
          placeholder={t("familyBackgroundPlaceholder")}
          rows={3}
        />
      </div>

      {/* Additional info */}
      <div className="grid gap-2">
        <Label htmlFor="additional_info">{t("additionalInfo")}</Label>
        <Textarea
          id="additional_info"
          name="additional_info"
          defaultValue={initialData?.additional_info ?? ""}
          placeholder={t("additionalInfoPlaceholder")}
          rows={3}
        />
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {initialData?.id ? t("updateProfile") : t("createProfile")}
      </Button>
    </form>
  )
}
