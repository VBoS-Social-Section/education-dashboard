import { useMemo } from 'react'
import { LazyChart } from '../components/LazyChart'
import { EnrolmentChart } from '../components/EnrolmentChart'
import { TrendChart } from '../components/TrendChart'
import { GenderHeatmapChart } from '../components/GenderHeatmapChart'
import { LevelPieChart } from '../components/LevelCharts'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import { getInstitutionColor, sortInstitutionsByOrder } from '@/lib/education-colors'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function EnrolmentPage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  const institutions = useMemo(
    () => sortInstitutionsByOrder([...new Set(data.filter((r) => r.Metric === 'Enrolment').map((r) => r.Court))]).filter((c) => c !== 'Total'),
    [data]
  )

  const pieData = useMemo(() => {
    const latestYear = selectedYears[selectedYears.length - 1]
    const total = getValue('Total', 'Enrolment', latestYear) ?? 0
    if (total <= 0) return []
    return institutions.map((l) => {
      const v = getValue(l, 'Enrolment', latestYear) ?? 0
      return { name: l, y: v, color: getInstitutionColor(l) }
    }).filter((d) => d.y > 0)
  }, [institutions, selectedYears, getValue])

  return (
    <div className="space-y-6">
      <LazyChart enabled={lazy}>
        <EnrolmentChart data={data} selectedYears={selectedYears} getValue={getValue} />
      </LazyChart>
      
      {/* Trend analysis for multi-year data */}
      {selectedYears.length > 1 && (
        <LazyChart enabled={lazy}>
          <TrendChart
            data={data}
            selectedYears={selectedYears}
            getValue={getValue}
            metric="Enrolment"
            title="Enrolment Trends Over Time"
            description="Line chart showing enrollment trends by education level across multiple years. Track growth patterns and identify changes in educational participation."
          />
        </LazyChart>
      )}
      
      {/* Gender breakdown heatmap */}
      {data.some(r => r.Metric === 'Enrolment_Male') && (
        <LazyChart enabled={lazy}>
          <GenderHeatmapChart
            data={data}
            selectedYears={selectedYears}
            getValue={getValue}
          />
        </LazyChart>
      )}
      
      {pieData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChart enabled={lazy}>
            <LevelPieChart title="Enrolment share by level (latest year)" data={pieData} />
          </LazyChart>
        </div>
      )}
    </div>
  )
}
