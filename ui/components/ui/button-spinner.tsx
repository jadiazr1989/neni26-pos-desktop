"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonSpinnerProps = ButtonProps & {
  busy?: boolean
  icon?: ReactNode
  spinner?: ReactNode
}

export function ButtonSpinner({
  busy = false,
  disabled,
  icon,
  spinner,
  className,
  children,
  ...props
}: ButtonSpinnerProps) {
  return (
    <Button
      {...props}
      disabled={disabled || busy}
      className={cn("inline-flex items-center justify-center gap-2", className)}
    >
      {busy ? spinner ?? <Loader2 className="size-5 animate-spin" /> : icon}
      {children}
    </Button>
  )
}
