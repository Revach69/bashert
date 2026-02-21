"use client"

import { MessageSquare, Heart, CheckCircle, Clock } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventStatsCardProps = {
  totalRequests: number
  pendingCount: number
  mutualCount: number
  approvedCount: number
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function EventStatsCard({
  totalRequests,
  pendingCount,
  mutualCount,
  approvedCount,
}: EventStatsCardProps) {
  const t = useTranslations("matchmaker")

  const stats = [
    {
      label: t("totalRequests"),
      value: totalRequests,
      icon: MessageSquare,
    },
    {
      label: t("pendingRequests"),
      value: pendingCount,
      icon: Clock,
    },
    {
      label: t("mutualRequests"),
      value: mutualCount,
      icon: Heart,
    },
    {
      label: t("approvedRequests"),
      value: approvedCount,
      icon: CheckCircle,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
