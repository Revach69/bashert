"use client"

import * as React from "react"
import type { ProfileCard } from "@prisma/client"
import { Loader2 } from "lucide-react"

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

// ─── Placeholder action (will be replaced by server actions) ────────────────

async function submitProfileForm(
  _formData: FormData
): Promise<{ success: boolean; error?: string }> {
  // Placeholder - will be wired to server actions from @/app/actions/profile
  return { success: true }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [gender, setGender] = React.useState<string>(
    initialData?.gender ?? ""
  )

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

      const result = await submitProfileForm(formData)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error ?? "אירעה שגיאה. נסו שוב.")
      }
    } catch {
      setError("אירעה שגיאה בלתי צפויה. נסו שוב.")
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
          <Label htmlFor="subject_first_name">שם פרטי</Label>
          <Input
            id="subject_first_name"
            name="subject_first_name"
            required
            defaultValue={initialData?.subject_first_name ?? ""}
            placeholder="שם פרטי"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject_last_name">שם משפחה</Label>
          <Input
            id="subject_last_name"
            name="subject_last_name"
            required
            defaultValue={initialData?.subject_last_name ?? ""}
            placeholder="שם משפחה"
          />
        </div>
      </div>

      {/* Gender & Date of Birth */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gender">מגדר</Label>
          <Select value={gender} onValueChange={setGender} name="gender" required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="בחרו מגדר" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">זכר</SelectItem>
              <SelectItem value="female">נקבה</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date_of_birth">תאריך לידה</Label>
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
          <Label htmlFor="subject_email">דוא״ל</Label>
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
          <Label htmlFor="subject_phone">טלפון</Label>
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
          <Label htmlFor="height">גובה</Label>
          <Input
            id="height"
            name="height"
            defaultValue={initialData?.height ?? ""}
            placeholder='לדוגמה: 175 ס"מ'
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="occupation">עיסוק</Label>
          <Input
            id="occupation"
            name="occupation"
            defaultValue={initialData?.occupation ?? ""}
            placeholder="עיסוק"
          />
        </div>
      </div>

      {/* Education & Ethnicity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="education">השכלה</Label>
          <Input
            id="education"
            name="education"
            defaultValue={initialData?.education ?? ""}
            placeholder="השכלה"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ethnicity">עדה</Label>
          <Input
            id="ethnicity"
            name="ethnicity"
            defaultValue={initialData?.ethnicity ?? ""}
            placeholder="עדה"
          />
        </div>
      </div>

      {/* Hashkafa */}
      <div className="grid gap-2">
        <Label htmlFor="hashkafa">השקפה</Label>
        <Input
          id="hashkafa"
          name="hashkafa"
          defaultValue={initialData?.hashkafa ?? ""}
          placeholder="השקפה דתית"
        />
      </div>

      {/* Family background */}
      <div className="grid gap-2">
        <Label htmlFor="family_background">רקע משפחתי</Label>
        <Textarea
          id="family_background"
          name="family_background"
          defaultValue={initialData?.family_background ?? ""}
          placeholder="מידע על הרקע המשפחתי"
          rows={3}
        />
      </div>

      {/* Additional info */}
      <div className="grid gap-2">
        <Label htmlFor="additional_info">מידע נוסף</Label>
        <Textarea
          id="additional_info"
          name="additional_info"
          defaultValue={initialData?.additional_info ?? ""}
          placeholder="מידע נוסף שתרצו לשתף"
          rows={3}
        />
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {initialData?.id ? "עדכון פרופיל" : "יצירת פרופיל"}
      </Button>
    </form>
  )
}
