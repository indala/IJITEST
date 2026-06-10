"use client"

import { ReactLenis } from "lenis/react"
import { type ReactNode, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const lenisRef = useRef<any>(null)
  const isPanel = pathname?.startsWith('/admin') || pathname?.startsWith('/editor') || pathname?.startsWith('/reviewer') || pathname?.startsWith('/author') || pathname?.startsWith('/login')

  useEffect(() => {
    if (!isPanel) {
      const lenis = lenisRef.current?.lenis
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo(0, 0)
      }
    }
  }, [pathname, isPanel])

  if (isPanel) {
    return <>{children}</>
  }

  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
