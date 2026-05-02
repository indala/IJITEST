"use client"

import { ReactLenis } from "lenis/react"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.includes('/admin') || pathname?.includes('/dashboard')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
