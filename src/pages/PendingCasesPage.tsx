import { useMemo } from 'react'
import { PendingCasesTable } from '../components/PendingCasesTable'
import { PendingByTypeChart } from '../components/PendingByTypeChart'
import { PendingAgeChart } from '../components/PendingAgeChart'
import { PendingListedStatusChart } from '../components/PendingListedStatusChart'
import { ReservedJudgmentsChart } from '../components/ReservedJudgmentsChart'
import { TotalPendingChart } from '../components/TotalPendingChart'
import { LazyChart } from '../components/LazyChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
  getRowsByMetric: (metric: string) => (StatRow & { valueNum: number | null })[]
}

export function PendingCasesPage({ data, selectedYears, compareMode = false, getValue, getRowsByMetric }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const [yearA, yearB] = compareMode && sortedYears.length >= 2 ? [sortedYears[0], sortedYears[1]] : [null, null]

  return (
    <div className="space-y-6">
      {compareMode && yearA != null && yearB != null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{yearA}</p>
            <TotalPendingChart data={data} selectedYears={[yearA]} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{yearB}</p>
            <TotalPendingChart data={data} selectedYears={[yearB]} />
          </div>
        </div>
      ) : (
        <LazyChart enabled={lazy}>
          <TotalPendingChart data={data} selectedYears={selectedYears} />
        </LazyChart>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <LazyChart enabled={lazy}>
        <PendingCasesTable getRowsByMetric={getRowsByMetric} selectedYears={selectedYears} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <PendingByTypeChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <PendingAgeChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <PendingListedStatusChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <ReservedJudgmentsChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      </div>
    </div>
  )
}
