import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-white [a&]:hover:bg-primary/90",
        primary: "bg-primary text-white [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary/10 text-secondary border-secondary/20 [a&]:hover:bg-secondary/20",
        brand:
          "bg-primary/10 text-primary border-primary/20 [a&]:hover:bg-primary/20",
        success:
          "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 [a&]:hover:bg-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 border-amber-500/20 [a&]:hover:bg-amber-500/20",
        neutral:
          "bg-muted text-muted-foreground border-border/50 [a&]:hover:bg-muted/80",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
