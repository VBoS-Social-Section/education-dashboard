import { COURT_ORDER, getCourtColor } from '@/lib/court-colors'

interface CourtColorLegendProps {
  /** Courts that have data - only show these in the legend */
  courts?: string[]
  className?: string
}

export function CourtColorLegend({ courts = COURT_ORDER, className }: CourtColorLegendProps) {
  const displayCourts = courts.length > 0 ? courts : COURT_ORDER
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground ${className ?? ''}`}>
      {displayCourts.map((court) => (
        <span key={court} className="flex items-center gap-1.5">
          <span
            className="inline-block size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: getCourtColor(court) }}
          />
          <span>{court.replace(/ Court$/, '')}</span>
        </span>
      ))}
    </div>
  )
}
