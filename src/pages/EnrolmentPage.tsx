import { useMemo } from 'react'
import { LazyChart } from '../components/LazyChart'
import { EnrolmentChart } from '../components/EnrolmentChart'
import { TrendChart } from '../components/TrendChart'
import { GenderHeatmapChart } from '../components/GenderHeatmapChart'
import { LevelPieChart } from '../components/LevelCharts'
import { Sdg4StackedBarChart, Sdg4BarByLevelChart, Sdg4PieChart } from '../components/Sdg4Charts'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import { getInstitutionColor, sortInstitutionsByOrder } from '@/lib/education-colors'
import type { StatRow, Sdg4Seed } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
  sdg4Seed?: Sdg4Seed | null
  selectedProvince?: string
  selectedAuthority?: string
  selectedLocation?: string
}

const LEVEL_KEYS = ['ECCE', 'Primary', 'Junior Secondary', 'Senior Secondary'] as const

interface DataByLevelResult {
  categories: string[]
  dataByLevel: Record<string, number[]>
}

function toDataByLevel(
  rows: Record<string, Record<string, number>>,
  keys: string[],
  levelKeys: readonly string[]
): DataByLevelResult {
  const categories = keys
  const dataByLevel: Record<string, number[]> = {}
  for (const l of levelKeys) {
    dataByLevel[l] = categories.map((k) => (rows[k] as Record<string, number>)?.[l] ?? 0)
  }
  return { categories, dataByLevel }
}

export function EnrolmentPage({ data, selectedYears, compareMode = false, getValue, sdg4Seed, selectedProvince, selectedAuthority, selectedLocation }: Props) {
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

  const provinceChartData = useMemo(() => {
    if (!sdg4Seed?.enrolmentByProvince2024) return null
    const keys = selectedProvince
      ? [selectedProvince].filter((p) => sdg4Seed.enrolmentByProvince2024?.[p])
      : Object.keys(sdg4Seed.enrolmentByProvince2024)
    if (keys.length === 0) return null
    return toDataByLevel(sdg4Seed.enrolmentByProvince2024, keys, LEVEL_KEYS)
  }, [sdg4Seed?.enrolmentByProvince2024, selectedProvince])

  const authorityChartData = useMemo(() => {
    if (!sdg4Seed?.enrolmentByAuthority2024) return null
    const keys = selectedAuthority
      ? [selectedAuthority]
      : Object.keys(sdg4Seed.enrolmentByAuthority2024)
    return toDataByLevel(sdg4Seed.enrolmentByAuthority2024, keys, LEVEL_KEYS)
  }, [sdg4Seed?.enrolmentByAuthority2024, selectedAuthority])

  const locationChartData = useMemo(() => {
    if (!sdg4Seed?.enrolmentByLocation2024) return null
    const keys = selectedLocation ? [selectedLocation] : Object.keys(sdg4Seed.enrolmentByLocation2024)
    return toDataByLevel(sdg4Seed.enrolmentByLocation2024, keys, LEVEL_KEYS)
  }, [sdg4Seed?.enrolmentByLocation2024, selectedLocation])

  const locationPieData = useMemo(() => {
    if (!sdg4Seed?.enrolmentByLocation2024 || selectedLocation) return null
    return Object.entries(sdg4Seed.enrolmentByLocation2024).map(([name, row]) => ({
      name,
      y: row.Total ?? 0,
      color: name === 'Rural' ? '#6DEBB9' : '#4B6DEB',
    })).filter((d) => d.y > 0)
  }, [sdg4Seed?.enrolmentByLocation2024, selectedLocation])

  return (
    <div className="space-y-8">
      {/* SDG 4 breakdowns (2024) */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">2024 Enrolment Breakdowns</h2>
      {provinceChartData && (
        <LazyChart enabled={true}>
          <Sdg4StackedBarChart
            title="Enrolment by Province and Level (2024)"
            description="MoET/VEMIS data. Filter by province in sidebar to focus on one region."
            categories={provinceChartData.categories}
            dataByLevel={provinceChartData.dataByLevel}
          />
        </LazyChart>
      )}

      {/* Enrolment by Authority (2024) - stacked bar chart */}
      {authorityChartData && (
        <LazyChart enabled={true}>
          <Sdg4StackedBarChart
            title="Enrolment by Authority and Level (2024)"
            description="Government, Church Assisted, Church, and Private schools."
            categories={authorityChartData.categories}
            dataByLevel={authorityChartData.dataByLevel}
          />
        </LazyChart>
      )}

      {/* Enrolment by Location (2024) - pie for Rural/Urban share, stacked bar for level breakdown */}
      {locationPieData && locationPieData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChart enabled={true}>
            <Sdg4PieChart
              title="Enrolment by Location (2024)"
              data={locationPieData}
            />
          </LazyChart>
          {locationChartData && (
            <LazyChart enabled={true}>
              <Sdg4StackedBarChart
                title="Enrolment by Location and Level (2024)"
                categories={locationChartData.categories}
                dataByLevel={locationChartData.dataByLevel}
              />
            </LazyChart>
          )}
        </div>
      )}
      {selectedLocation && sdg4Seed?.enrolmentByLocation2024?.[selectedLocation] && (
        <LazyChart enabled={true}>
          <Sdg4BarByLevelChart
            title={`Enrolment by Level — ${selectedLocation} (2024)`}
            levels={LEVEL_KEYS}
            values={LEVEL_KEYS.map((l) => (sdg4Seed.enrolmentByLocation2024![selectedLocation] as Record<string, number>)[l] ?? 0)}
          />
        </LazyChart>
      )}
      </section>

      {/* Main enrolment trends - always visible */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Enrolment Over Time</h2>
      <LazyChart enabled={false}>
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
          <LazyChart enabled={false}>
            <LevelPieChart title="Enrolment share by level (latest year)" data={pieData} />
          </LazyChart>
        </div>
      )}
      </section>
    </div>
  )
}
