import { cn } from '@/lib/utils'

const NA_DISPLAY = '—'

/** Renders a value, or a greyed-out placeholder when null/NA/empty. */
export function NaCell({
  value,
  fallback = NA_DISPLAY,
  suffix,
  className,
}: {
  value: number | string | null | undefined
  fallback?: string
  suffix?: string
  className?: string
}) {
  const isNa =
    value == null ||
    value === '' ||
    String(value).toLowerCase() === 'na' ||
    (typeof value === 'number' && Number.isNaN(value))

  const display = isNa ? fallback : `${value}${suffix ?? ''}`

  return (
    <span
      className={cn('block text-right', isNa && 'text-muted-foreground/80 italic', className)}
      title={isNa ? 'Data not available' : undefined}
    >
      {display}
    </span>
  )
}
