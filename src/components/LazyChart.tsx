import { useEffect, useRef, useState } from 'react'

interface LazyChartProps {
  children: React.ReactNode
  minHeight?: number
  /** Enable lazy loading only when true (e.g. when many years selected) */
  enabled?: boolean
}

/** Defers rendering children until in viewport. Use when many charts/years to improve initial load. */
export function LazyChart({ children, minHeight = 420, enabled = true }: LazyChartProps) {
  const [visible, setVisible] = useState(!enabled)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true)
      },
      { rootMargin: '120px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  if (visible) return <>{children}</>

  return (
    <div ref={ref} style={{ minHeight }} className="animate-pulse rounded-xl bg-muted/30" aria-hidden />
  )
}
