import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Accessible Input Component
 * A11Y-01: Uses text-lg (18px+ with 18px base)
 * A11Y-02: Height is 48px (h-12) for touch target
 * A11Y-06: Focus states visible via ring
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles with 48px height (A11Y-02) and large text (A11Y-01)
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-4 py-2 text-lg shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-base file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Focus ring (A11Y-06)
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Error state styling
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
