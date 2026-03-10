import { ChargeOrdersChart } from '../components/ChargeOrdersChart'
import { GenderBreakdownChart } from '../components/GenderBreakdownChart'
import { LazyChart } from '../components/LazyChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function OtherMetricsPage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <LazyChart enabled={lazy}>
        <ChargeOrdersChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <GenderBreakdownChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
    </div>
  )
}
