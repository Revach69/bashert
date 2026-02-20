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
import { EventForm } from "@/components/forms/event-form"

// ─── Component ──────────────────────────────────────────────────────────────────

export function CreateEventDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          צור אירוע חדש
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>יצירת אירוע חדש</DialogTitle>
          <DialogDescription>
            הגדירו את פרטי האירוע. לאחר יצירת האירוע תקבלו קוד הצטרפות
            לשיתוף עם המשתתפים.
          </DialogDescription>
        </DialogHeader>
        <EventForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
