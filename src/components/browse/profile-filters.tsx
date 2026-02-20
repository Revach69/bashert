"use client"

import * as React from "react"
import { Filter, X } from "lucide-react"

import type { ProfileFilters } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProfileFiltersProps = {
  filters: ProfileFilters
  onFiltersChange: (filters: ProfileFilters) => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfileFiltersPanel({
  filters,
  onFiltersChange,
}: ProfileFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState<ProfileFilters>(filters)

  // Sync with parent filters
  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  function handleGenderChange(value: string) {
    setLocalFilters((prev) => ({
      ...prev,
      gender: value === "all" ? undefined : (value as "male" | "female"),
    }))
  }

  function handleMinAgeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value ? Number(e.target.value) : undefined
    setLocalFilters((prev) => ({ ...prev, min_age: value }))
  }

  function handleMaxAgeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value ? Number(e.target.value) : undefined
    setLocalFilters((prev) => ({ ...prev, max_age: value }))
  }

  function handleHashkafaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || undefined
    setLocalFilters((prev) => ({ ...prev, hashkafa: value }))
  }

  function handleEthnicityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || undefined
    setLocalFilters((prev) => ({ ...prev, ethnicity: value }))
  }

  function handleApplyFilters() {
    onFiltersChange(localFilters)
  }

  function handleClearFilters() {
    const emptyFilters: ProfileFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters =
    localFilters.gender ||
    localFilters.min_age ||
    localFilters.max_age ||
    localFilters.hashkafa ||
    localFilters.ethnicity

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Filter className="size-5" />
        <h3 className="text-lg font-semibold">סינון</h3>
      </div>

      <Separator />

      {/* Gender filter */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="gender-filter">מגדר</Label>
        <Select
          value={localFilters.gender ?? "all"}
          onValueChange={handleGenderChange}
        >
          <SelectTrigger id="gender-filter">
            <SelectValue placeholder="הכל" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="male">זכר</SelectItem>
            <SelectItem value="female">נקבה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Age range */}
      <div className="flex flex-col gap-2">
        <Label>טווח גילאים</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="מ-"
            min={18}
            max={120}
            value={localFilters.min_age ?? ""}
            onChange={handleMinAgeChange}
            className="flex-1"
          />
          <span className="text-muted-foreground text-sm">עד</span>
          <Input
            type="number"
            placeholder="עד-"
            min={18}
            max={120}
            value={localFilters.max_age ?? ""}
            onChange={handleMaxAgeChange}
            className="flex-1"
          />
        </div>
      </div>

      {/* Hashkafa filter */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="hashkafa-filter">השקפה</Label>
        <Input
          id="hashkafa-filter"
          placeholder="לדוגמה: דתי-לאומי"
          value={localFilters.hashkafa ?? ""}
          onChange={handleHashkafaChange}
        />
      </div>

      {/* Ethnicity filter */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="ethnicity-filter">מוצא עדתי</Label>
        <Input
          id="ethnicity-filter"
          placeholder="לדוגמה: אשכנזי"
          value={localFilters.ethnicity ?? ""}
          onChange={handleEthnicityChange}
        />
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1 gap-2">
          <Filter className="size-4" />
          סננו
        </Button>
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="gap-2"
        >
          <X className="size-4" />
          נקו
        </Button>
      </div>
    </div>
  )
}
