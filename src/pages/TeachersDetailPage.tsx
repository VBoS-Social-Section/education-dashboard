import { useMemo } from 'react'
import { Users, User, UserCheck } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { TrendChart } from '../components/TrendChart'
import { GenderHeatmapChart } from '../components/GenderHeatmapChart'
import { EnhancedBarChart } from '../components/EnhancedBarChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

const LEVELS = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary'] as const

export function TeachersDetailPage({ data, selectedYears, getValue }: Props) {
  const hasSexData = useMemo(() => {
    return LEVELS.some((inst) =>
      selectedYears.some((y) => (getValue(inst, 'Teachers_Male', y) ?? 0) + (getValue(inst, 'Teachers_Female', y) ?? 0) > 0)
    )
  }, [selectedYears, getValue])

  if (!hasSexData) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          No teachers by sex data for selected years. Extracted from Table 43/38 in MoET reports (2022–2024).
        </p>
      </div>
    )
  }

  const sortedYears = [...selectedYears].sort((a, b) => a - b)
  const levelStats = LEVELS.map((inst) => {
    const maleTotal = sortedYears.reduce((s, y) => s + (getValue(inst, 'Teachers_Male', y) ?? 0), 0)
    const femaleTotal = sortedYears.reduce((s, y) => s + (getValue(inst, 'Teachers_Female', y) ?? 0), 0)
    return { inst, maleTotal, femaleTotal, total: maleTotal + femaleTotal }
  }).filter((x) => x.total > 0)

  const totalMale = levelStats.reduce((s, x) => s + x.maleTotal, 0)
  const totalFemale = levelStats.reduce((s, x) => s + x.femaleTotal, 0)
  const dataDescription =
    sortedYears.length > 0
      ? `Totals for ${sortedYears.length === 1 ? sortedYears[0] : `${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`}. ` +
        `Across the levels shown: ${totalMale.toLocaleString()} male and ${totalFemale.toLocaleString()} female teachers. ` +
        (totalFemale > totalMale ? 'Female teachers outnumber male across all levels.' : '')
      : ''

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Teachers by Sex</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Number of teachers by sex (Male/Female) in each school type. In Vanuatu, female teachers typically outnumber male, especially in ECCE and Primary. Source: MoET Annual Reports, Table 43.
        </p>
      </div>
      
      {/* Enhanced bar charts for teacher gender breakdown */}
      <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
        <EnhancedBarChart
          data={data}
          selectedYears={selectedYears}
          getValue={getValue}
          metric="Teachers_Male"
          title="Male Teachers by Level Trends"
          description="Number of male teachers by education level across selected years. Track gender representation in the teaching workforce."
        />
      </LazyChart>
      
      <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
        <EnhancedBarChart
          data={data}
          selectedYears={selectedYears}
          getValue={getValue}
          metric="Teachers_Female"
          title="Female Teachers by Level Trends"
          description="Number of female teachers by education level. Female teachers typically dominate ECCE and Primary levels in Vanuatu."
        />
      </LazyChart>
      
      {/* Trend analysis for multi-year data */}
      {selectedYears.length > 1 && (
        <>
          <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
            <TrendChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
              metric="Teachers_Male"
              title="Male Teacher Trends Over Time"
              description="Line chart showing male teacher workforce trends. Monitor changes in gender representation over time."
            />
          </LazyChart>
          
          <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
            <TrendChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
              metric="Teachers_Female"
              title="Female Teacher Trends Over Time"
              description="Line chart showing female teacher workforce trends. Track growth patterns in female participation."
            />
          </LazyChart>
        </>
      )}
      
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levelStats.map(({ inst, maleTotal, femaleTotal, total }) => (
          <div key={inst} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="mb-4 text-sm font-semibold">{inst}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  Male
                </span>
                <span className="font-medium">{maleTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCheck className="size-4" />
                  Female
                </span>
                <span className="font-medium">{femaleTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  Total
                </span>
                <span className="font-medium">{total.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {femaleTotal > maleTotal ? (
                  <span className="text-green-600">⚖️ Female majority ({((femaleTotal / total) * 100).toFixed(1)}%)</span>
                ) : (
                  <span className="text-blue-600">⚖️ Male majority ({((maleTotal / total) * 100).toFixed(1)}%)</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {dataDescription && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {dataDescription}
        </p>
      )}
    </div>
  )
}
