"use client"

import { ReactLenis } from "lenis/react"
import type { LenisRef } from "lenis/react"
import { type ReactNode, useEffect, useRef, Suspense } from "react"
import { usePathname } from "next/navigation"

function ScrollToTopOnRouteChange({ lenisRef }: { lenisRef: React.RefObject<LenisRef | null> }) {
  const pathname = usePathname()

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, lenisRef])

  return null
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <Suspense fallback={null}>
        <ScrollToTopOnRouteChange lenisRef={lenisRef} />
      </Suspense>
      {children}
    </ReactLenis>
  )
}
