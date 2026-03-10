import { TimelinessChart } from '../components/TimelinessChart'
import { AttendanceChart } from '../components/AttendanceChart'
import { ProductivityChart } from '../components/ProductivityChart'
import { LazyChart } from '../components/LazyChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function PerformancePage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  const sortedYears = [...selectedYears].sort((a, b) => a - b)
  const [yearA, yearB] = compareMode && sortedYears.length >= 2 ? [sortedYears[0], sortedYears[1]] : [null, null]
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <LazyChart enabled={lazy}>
        <TimelinessChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      <LazyChart enabled={lazy}>
        <AttendanceChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      {compareMode && yearA != null && yearB != null ? (
        <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Productivity – {yearA}</p>
            <ProductivityChart data={data} selectedYears={[yearA]} getValue={getValue} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Productivity – {yearB}</p>
            <ProductivityChart data={data} selectedYears={[yearB]} getValue={getValue} />
          </div>
        </div>
      ) : (
        <LazyChart enabled={lazy}>
          <ProductivityChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
      )}
    </div>
  )
}
