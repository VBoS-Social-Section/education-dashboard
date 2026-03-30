import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TourStep {
  /** Matches `[data-tour="targetId"]` */
  targetId: string
  title: string
  /** Plain language explanation */
  description: string
}

interface GuidedSpotlightTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: TourStep[]
  /** Extra padding around the highlighted element (px) */
  padding?: number
}

const PANEL_W = 380
const Z_BASE = 250

function ShroudPieces({ rect }: { rect: DOMRect }) {
  const { top, left, width, height } = rect
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0
  const dark = 'bg-black/72'
  return (
    <>
      <div
        className={cn('fixed', dark)}
        style={{ zIndex: Z_BASE, top: 0, left: 0, right: 0, height: top, pointerEvents: 'auto' }}
        aria-hidden
      />
      <div
        className={cn('fixed', dark)}
        style={{ zIndex: Z_BASE, top: top + height, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }}
        aria-hidden
      />
      <div
        className={cn('fixed', dark)}
        style={{ zIndex: Z_BASE, top, left: 0, width: left, height, pointerEvents: 'auto' }}
        aria-hidden
      />
      <div
        className={cn('fixed', dark)}
        style={{ zIndex: Z_BASE, top, left: left + width, width: Math.max(0, vw - left - width), height, pointerEvents: 'auto' }}
        aria-hidden
      />
    </>
  )
}

function HighlightRing({ rect }: { rect: DOMRect }) {
  const { top, left, width, height } = rect
  return (
    <div
      className="pointer-events-none fixed rounded-lg ring-2 ring-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
      style={{
        zIndex: Z_BASE + 1,
        top,
        left,
        width,
        height,
      }}
      aria-hidden
    />
  )
}

function measureTarget(targetId: string, padding: number): DOMRect | null {
  const el = document.querySelector(`[data-tour="${targetId}"]`) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 && r.height < 2) return null
  const pad = padding
  return new DOMRect(r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2)
}

export function GuidedSpotlightTour({ open, onOpenChange, steps, padding = 10 }: GuidedSpotlightTourProps) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [missing, setMissing] = useState(false)

  const step = steps[index]
  const last = steps.length - 1

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  const updateRect = useCallback(() => {
    if (!open || !step) {
      setRect(null)
      setMissing(false)
      return
    }
    const r = measureTarget(step.targetId, padding)
    setRect(r)
    setMissing(!r)
  }, [open, step, padding])

  useEffect(() => {
    if (!open) {
      setRect(null)
      setMissing(false)
      return
    }
    updateRect()
    const el = document.querySelector(`[data-tour="${step.targetId}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const t1 = window.setTimeout(updateRect, 100)
    const t2 = window.setTimeout(updateRect, 400)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [open, index, step, updateRect])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
      if (e.key === 'ArrowRight' && index < last) {
        e.preventDefault()
        setIndex((i) => i + 1)
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        setIndex((i) => i - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, last, onOpenChange])

  const panelStyle = (): CSSProperties => {
    if (typeof window === 'undefined') return {}
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 16
    const panelH = 220
    let top = margin
    let left = margin
    if (rect && rect.width > 0) {
      const below = rect.bottom + margin + panelH < vh
      top = below ? rect.bottom + margin : rect.top - panelH - margin
      top = Math.max(margin, Math.min(top, vh - panelH - margin))
      left = rect.left + rect.width / 2 - PANEL_W / 2
      left = Math.max(margin, Math.min(left, vw - PANEL_W - margin))
    } else {
      left = vw / 2 - PANEL_W / 2
      top = vh / 2 - panelH / 2
    }
    return {
      position: 'fixed',
      zIndex: Z_BASE + 10,
      top,
      left,
      width: Math.min(PANEL_W, vw - margin * 2),
      maxHeight: 'min(50vh, 320px)',
    }
  }

  if (!open || steps.length === 0) return null

  const node = (
    <>
      {rect && rect.width > 0 && !missing ? (
        <>
          <ShroudPieces rect={rect} />
          <HighlightRing rect={rect} />
        </>
      ) : (
        <div
          className="fixed inset-0 bg-black/72"
          style={{ zIndex: Z_BASE, pointerEvents: 'auto' }}
          aria-hidden
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        className="flex flex-col overflow-hidden rounded-xl border border-white/20 bg-white shadow-2xl dark:bg-zinc-900 dark:border-white/10"
        style={panelStyle()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <p id="guided-tour-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Guided help · Step {index + 1} of {steps.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
            aria-label="Close guided help"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          {missing && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              This section is not visible on screen right now. Use Next or close the tour.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#4B6DEB] hover:bg-[#3d5bd4]"
              onClick={() => {
                if (index >= last) onOpenChange(false)
                else setIndex((i) => i + 1)
              }}
            >
              {index >= last ? 'Done' : 'Next'}
              {index < last && <ChevronRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(node, document.body)
}
