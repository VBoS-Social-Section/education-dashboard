import { CaseOutcomesTable } from '../components/CaseOutcomesTable'
import { CoAOutcomesChart } from '../components/CoAOutcomesChart'
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

export function OutcomesPage({ data, selectedYears, compareMode = false, getValue, getRowsByMetric }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <LazyChart enabled={lazy}>
          <CaseOutcomesTable getRowsByMetric={getRowsByMetric} selectedYears={selectedYears} />
        </LazyChart>
        <LazyChart enabled={lazy}>
          <CoAOutcomesChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
      </div>
    </div>
  )
}
