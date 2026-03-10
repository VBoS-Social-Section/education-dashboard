import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'vanuatu-dashboard-hero-dismissed'
const AUTO_HIDE_MS = 60_000 // 1 minute

const MESSAGE =
  'This dashboard visualises key workload, backlog, timeliness and gender metrics from Vanuatu Judiciary annual reports (2017–2025).'

interface HeroBannerProps {
  lastUpdated?: string | null
  className?: string
  /** 'banner' = full-width banner (when not dismissed), 'icon' = ? button (when dismissed) */
  placement?: 'banner' | 'icon'
}

export function HeroBanner({ lastUpdated, className, placement = 'banner' }: HeroBannerProps) {
  const [dismissed, setDismissed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(AUTO_HIDE_MS / 1000))

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setDismissed(stored === 'true')
    } catch {
      setDismissed(false)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!dismissed && placement === 'banner') {
      setSecondsLeft(Math.ceil(AUTO_HIDE_MS / 1000))
      const endTime = Date.now() + AUTO_HIDE_MS

      const timeoutId = setTimeout(() => {
        setDismissed(true)
        try {
          localStorage.setItem(STORAGE_KEY, 'true')
        } catch {}
      }, AUTO_HIDE_MS)

      const intervalId = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
        setSecondsLeft(remaining)
      }, 1000)

      return () => {
        clearTimeout(timeoutId)
        clearInterval(intervalId)
      }
    }
  }, [dismissed, placement])

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
  }

  const message = MESSAGE

  if (!mounted) return null

  if (dismissed) {
    if (placement === 'icon') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground', className)}
              aria-label="About this dashboard"
            >
              <Info className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-sm p-4" align="end">
            <p className="text-sm text-muted-foreground">{message}</p>
          </PopoverContent>
        </Popover>
      )
    }
    return null
  }

  if (placement === 'banner') {
    return (
      <div className={cn('mb-6', className)}>
        <div className="rounded-xl border border-[#7551ff]/30 bg-[#7551ff]/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#422AFB]" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Dismisses in {secondsLeft}s
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:bg-muted"
              aria-label="Dismiss"
              onClick={handleDismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
