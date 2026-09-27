import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-sans font-semibold tracking-normal transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/90 shadow-sm focus-visible:ring-primary/30",
        primary:
          "bg-primary text-white hover:bg-primary/90 shadow-sm focus-visible:ring-primary/30",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90 shadow-sm focus-visible:ring-secondary/30",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground shadow-2xs focus-visible:ring-ring/30",
        "outline-white":
          "border border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white shadow-2xs focus-visible:ring-white/30",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/30",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm focus-visible:ring-destructive/30",
        white:
          "bg-white text-primary hover:bg-white/95 shadow-sm border-0 focus-visible:ring-white/40",
        link:
          "text-primary underline-offset-4 hover:underline !p-0 !h-auto active:scale-100",
      },
      size: {
        default:
          "text-[13px] sm:text-[14px] xl:text-[15px] 2xl:text-[16px] px-[14px] py-[6px] sm:px-[16px] sm:py-[8px] xl:px-[20px] xl:py-[9px] 2xl:px-[24px] 2xl:py-[11px]",
        xs:
          "text-[11px] px-[8px] py-[3px] rounded-md gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm:
          "text-[11px] sm:text-[12px] xl:text-[13px] 2xl:text-[13px] px-[10px] py-[4px] sm:px-[12px] sm:py-[5px] xl:px-[14px] xl:py-[5px] 2xl:px-[16px] 2xl:py-[6px]",
        lg:
          "text-[14px] sm:text-[15px] xl:text-[16px] 2xl:text-[17px] px-[18px] py-[8px] sm:px-[20px] sm:py-[10px] xl:px-[24px] xl:py-[11px] 2xl:px-[28px] 2xl:py-[13px]",
        icon:
          "p-2 aspect-square rounded-lg",
        "icon-xs":
          "size-6 rounded-md p-0 flex items-center justify-center [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-md p-0 flex items-center justify-center",
        "icon-lg":
          "size-10 rounded-lg p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
