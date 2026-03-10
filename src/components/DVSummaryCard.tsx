import { memo } from 'react'
import { ShieldAlert, ArrowUp, ArrowDown } from 'lucide-react'
import { Sparkline } from './Sparkline'
import { getRatePer100k } from '@/lib/population'

const DV_COLOR = '#a855f7'

interface Props {
  dvByYear: number[]
  sortedYears: number[]
}

export const DVSummaryCard = memo(function DVSummaryCard({ dvByYear, sortedYears }: Props) {
  const latestYear = sortedYears[sortedYears.length - 1]
  const latestDV = dvByYear.length > 0 ? dvByYear[dvByYear.length - 1] : 0

  const yoy =
    dvByYear.length >= 2
      ? (() => {
          const prev = dvByYear[dvByYear.length - 2]
          const curr = dvByYear[dvByYear.length - 1]
          const pct = prev > 0 ? (100 * (curr - prev)) / prev : (curr > prev ? 100 : 0)
          return { pct, up: curr > prev }
        })()
      : null

  const ratePer100k = latestYear != null && latestDV > 0 ? getRatePer100k(latestDV, latestYear) : null
  const maxDV = dvByYear.length > 0 ? Math.max(...dvByYear) : 0
  const isRecordHigh = latestDV > 0 && latestDV >= maxDV && dvByYear.length >= 2
  const yearSpan = sortedYears.length

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/8 to-transparent p-5 shadow-sm"
      style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${DV_COLOR}22` }}
          >
            <ShieldAlert className="size-7" style={{ color: DV_COLOR }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Domestic Violence / Protection Orders
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {latestDV > 0 ? latestDV.toLocaleString() : '—'}
              <span className="ml-1.5 text-base font-medium text-muted-foreground">filings</span>
              {latestYear != null && sortedYears.length > 0 && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">in {latestYear}</span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              {yoy != null && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                    yoy.up ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}
                  title="Year-over-year change"
                >
                  {yoy.up ? <ArrowUp className="size-4" strokeWidth={2.5} /> : <ArrowDown className="size-4" strokeWidth={2.5} />}
                  {yoy.pct >= 0 ? '+' : ''}{yoy.pct.toFixed(1)}% YoY
                </span>
              )}
              {ratePer100k != null && (
                <span
                  className="rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground"
                  title="Rate per 100,000 population (VBOS estimates)"
                >
                  {ratePer100k} per 100k pop.
                  {latestYear != null && <span className="ml-1 text-xs">({latestYear})</span>}
                </span>
              )}
              {isRecordHigh && latestYear != null && (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {yearSpan}-year high in {latestYear}
                </span>
              )}
            </div>
          </div>
        </div>
        {dvByYear.length >= 2 && (
          <div className="shrink-0">
            <Sparkline data={dvByYear} width={120} height={48} color={DV_COLOR} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Protection order filings in Magistrates Court. Rising numbers may indicate increased reporting or demand for protection.
      </p>
    </div>
  )
})
