"use client"

import { ReactLenis } from "lenis/react"
import { type ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isPanel = pathname?.startsWith('/admin') || pathname?.startsWith('/editor') || pathname?.startsWith('/reviewer') || pathname?.startsWith('/author') || pathname?.startsWith('/login')

  useEffect(() => {
    if (!isPanel) {
      window.scrollTo(0, 0)
    }
  }, [pathname, isPanel])

  if (isPanel) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
