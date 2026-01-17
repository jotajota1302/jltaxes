"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Accessible Label Component
 * A11Y-01: Uses text-base (18px+ with 18px base)
 * A11Y-04: Labels are always visible (not placeholder-only)
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Visible labels with good size and weight (A11Y-04, A11Y-01)
        "flex items-center gap-2 text-base leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
