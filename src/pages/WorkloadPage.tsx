import { useMemo } from 'react'
import { CaseWorkloadByTypeChart } from '../components/CaseWorkloadByTypeChart'
import { LocationWorkloadChart } from '../components/LocationWorkloadChart'
import { DVFilingsChart } from '../components/DVFilingsChart'
import { DVSummaryCard } from '../components/DVSummaryCard'
import { LazyChart } from '../components/LazyChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

function parseVal(v: string): number {
  if (!v || String(v).toLowerCase() === 'na') return 0
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function WorkloadPage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const dvByYear = useMemo(
    () =>
      sortedYears.map((y) =>
        data
          .filter((r) => r.Metric === 'DV_Filings' && r.Year === String(y))
          .reduce((s, r) => s + parseVal(r.Value), 0)
      ),
    [sortedYears, data]
  )
  const hasDVData = dvByYear.length > 0 && dvByYear.some((v) => v > 0)

  const [yearA, yearB] = compareMode && sortedYears.length >= 2 ? [sortedYears[0], sortedYears[1]] : [null, null]

  return (
    <div className="space-y-6">
      {hasDVData && <DVSummaryCard dvByYear={dvByYear} sortedYears={sortedYears} />}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LazyChart enabled={lazy}>
          <CaseWorkloadByTypeChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
        <LazyChart enabled={lazy}>
          <LocationWorkloadChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
        {compareMode && yearA != null && yearB != null ? (
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">{yearA}</p>
              <DVFilingsChart data={data} selectedYears={[yearA]} getValue={getValue} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">{yearB}</p>
              <DVFilingsChart data={data} selectedYears={[yearB]} getValue={getValue} />
            </div>
          </div>
        ) : (
          <LazyChart enabled={lazy}>
            <DVFilingsChart data={data} selectedYears={selectedYears} getValue={getValue} />
          </LazyChart>
        )}
      </div>
    </div>
  )
}
