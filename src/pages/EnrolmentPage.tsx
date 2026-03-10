import { LazyChart } from '../components/LazyChart'
import { EnrolmentChart } from '../components/EnrolmentChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function EnrolmentPage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  return (
    <div className="space-y-6">
      <LazyChart enabled={lazy}>
        <EnrolmentChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
    </div>
  )
}
