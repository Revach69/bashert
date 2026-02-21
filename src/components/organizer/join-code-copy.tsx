"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

// ─── Types ──────────────────────────────────────────────────────────────────────

type OrganizerJoinCodeCopyProps = {
  joinCode: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function OrganizerJoinCodeCopy({ joinCode }: OrganizerJoinCodeCopyProps) {
  const [copied, setCopied] = React.useState(false)
  const tCommon = useTranslations("common")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = joinCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{tCommon("joinCode")}</span>
      <code
        dir="ltr"
        className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-start"
      >
        {joinCode}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        onClick={handleCopy}
        title={tCommon("copyCode")}
      >
        {copied ? (
          <Check className="size-3 text-green-600" />
        ) : (
          <Copy className="size-3" />
        )}
      </Button>
    </div>
  )
}
