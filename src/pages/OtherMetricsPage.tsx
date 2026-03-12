import { ChargeOrdersChart } from '../components/ChargeOrdersChart'
import { TrendChart } from '../components/TrendChart'
import { EnhancedBarChart } from '../components/EnhancedBarChart'
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <LazyChart enabled={lazy}>
          <ChargeOrdersChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
        
        {/* Student-Teacher Ratio Chart */}
        <LazyChart enabled={lazy}>
          <EnhancedBarChart
            data={data}
            selectedYears={selectedYears}
            getValue={getValue}
            metric="StudentTeacherRatio"
            title="Student-Teacher Ratio by Level"
            description="Student-teacher ratio by education level. Lower ratios indicate better learning conditions. Track resource allocation effectiveness."
          />
        </LazyChart>
      </div>
      
      {/* Trend analysis for multi-year data */}
      {selectedYears.length > 1 && (
        <LazyChart enabled={lazy}>
          <TrendChart
            data={data}
            selectedYears={selectedYears}
            getValue={getValue}
            metric="StudentTeacherRatio"
            title="Student-Teacher Ratio Trends"
            description="Line chart showing student-teacher ratio trends over time. Monitor changes in learning conditions and resource efficiency."
          />
        </LazyChart>
      )}
    </div>
  )
}
