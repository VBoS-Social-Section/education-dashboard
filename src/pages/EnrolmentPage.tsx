import { useMemo } from 'react'
import { GraduationCap, TrendingUp, Users, PieChart, MapPin, Building2 } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { EnrolmentChart } from '../components/EnrolmentChart'
import { TrendChart } from '../components/TrendChart'
import { GenderHeatmapChart } from '../components/GenderHeatmapChart'
import { LevelPieChart } from '../components/LevelCharts'
import { Sdg4StackedBarChart, Sdg4BarByLevelChart, Sdg4PieChart } from '../components/Sdg4Charts'
import { CollapsibleChart } from '../components/CollapsibleChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import { getInstitutionColor, chartInstitutionsFromRawCourts, secondaryEnrolmentFromSeedRow } from '@/lib/education-colors'
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

const LEVEL_KEYS = ['ECCE', 'Primary', 'Secondary'] as const

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
  for (const l of levelKeys) dataByLevel[l] = []
  for (const k of keys) {
    const row = rows[k] as Record<string, number>
    for (const l of levelKeys) {
      const v = l === 'Secondary' ? secondaryEnrolmentFromSeedRow(row) : (row[l] ?? 0)
      dataByLevel[l].push(v)
    }
  }
  return { categories, dataByLevel }
}

export function EnrolmentPage({ data, selectedYears, compareMode = false, getValue, sdg4Seed, selectedProvince, selectedAuthority, selectedLocation }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  const institutions = useMemo(
    () => chartInstitutionsFromRawCourts([...new Set(data.filter((r) => r.Metric === 'Enrolment').map((r) => r.Court))]).filter((c) => c !== 'Total'),
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
      {/* SDG 4 breakdowns (2024) - with card titles like other charts */}
      <section className="space-y-6" data-tour="enrolment-breakdowns-2024">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">2024 Enrolment Breakdowns</h2>
      {provinceChartData && (
        <CollapsibleChart
          title="Enrolment by Province and Level (2024)"
          description="MoET/VEMIS data. Filter by province in sidebar to focus on one region."
          icon={<MapPin className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={true}>
            <Sdg4StackedBarChart
              title="Enrolment by Province and Level (2024)"
              description="MoET/VEMIS data. Filter by province in sidebar to focus on one region."
              categories={provinceChartData.categories}
              dataByLevel={provinceChartData.dataByLevel}
              hideHeader
            />
          </LazyChart>
        </CollapsibleChart>
      )}

      {authorityChartData && (
        <CollapsibleChart
          title="Enrolment by Authority and Level (2024)"
          description="Government, Church Assisted, Church, and Private schools."
          icon={<Building2 className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={true}>
            <Sdg4StackedBarChart
              title="Enrolment by Authority and Level (2024)"
              description="Government, Church Assisted, Church, and Private schools."
              categories={authorityChartData.categories}
              dataByLevel={authorityChartData.dataByLevel}
              hideHeader
            />
          </LazyChart>
        </CollapsibleChart>
      )}

      {locationPieData && locationPieData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CollapsibleChart
            title="Enrolment by Location (2024)"
            description="Rural vs Urban enrolment share."
            icon={<MapPin className="size-5 text-[#4B6DEB]" />}
          >
            <LazyChart enabled={true}>
              <Sdg4PieChart
                title="Enrolment by Location (2024)"
                data={locationPieData}
                hideHeader
              />
            </LazyChart>
          </CollapsibleChart>
          {locationChartData && (
            <CollapsibleChart
              title="Enrolment by Location and Level (2024)"
              description="Enrolment breakdown by level within Rural and Urban."
              icon={<MapPin className="size-5 text-[#4B6DEB]" />}
            >
              <LazyChart enabled={true}>
                <Sdg4StackedBarChart
                  title="Enrolment by Location and Level (2024)"
                  categories={locationChartData.categories}
                  dataByLevel={locationChartData.dataByLevel}
                  hideHeader
                />
              </LazyChart>
            </CollapsibleChart>
          )}
        </div>
      )}
      {selectedLocation && sdg4Seed?.enrolmentByLocation2024?.[selectedLocation] && (
        <CollapsibleChart
          title={`Enrolment by Level — ${selectedLocation} (2024)`}
          description="Enrolment breakdown by education level."
          icon={<MapPin className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={true}>
            <Sdg4BarByLevelChart
              title={`Enrolment by Level — ${selectedLocation} (2024)`}
              levels={LEVEL_KEYS}
              values={LEVEL_KEYS.map((l) => {
                const row = sdg4Seed.enrolmentByLocation2024![selectedLocation] as Record<string, number>
                return l === 'Secondary' ? secondaryEnrolmentFromSeedRow(row) : (row[l] ?? 0)
              })}
              hideHeader
            />
          </LazyChart>
        </CollapsibleChart>
      )}
      </section>

      {/* Main enrolment charts - with card titles like Schools & Teachers */}
      <section className="space-y-6">
        <div data-tour="enrolment-by-level-year" className="min-w-0">
        <CollapsibleChart
          title="Enrolment by Level and Year"
          description="Total student enrolment by education level (ECCE, Primary, Secondary). Secondary combines junior and senior secondary. Primary typically has the highest enrolment."
          icon={<GraduationCap className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={false}>
            <EnrolmentChart data={data} selectedYears={selectedYears} getValue={getValue} hideHeader />
          </LazyChart>
        </CollapsibleChart>
        </div>
      
      {selectedYears.length > 1 && (
        <div data-tour="enrolment-trends" className="min-w-0">
        <CollapsibleChart
          title="Enrolment Trends Over Time"
          description="Line chart showing enrollment trends by education level across multiple years."
          icon={<TrendingUp className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={lazy}>
            <TrendChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
              metric="Enrolment"
              title="Enrolment Trends Over Time"
              description="Line chart showing enrollment trends by education level."
              hideHeader
            />
          </LazyChart>
        </CollapsibleChart>
        </div>
      )}
      
      {data.some(r => r.Metric === 'Enrolment_Male') && (
        <div data-tour="enrolment-by-sex" className="min-w-0">
        <CollapsibleChart
          title="Enrolment by Sex"
          description="Female enrolment share by education level and year."
          icon={<Users className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={lazy}>
            <GenderHeatmapChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
              hideHeader
            />
          </LazyChart>
        </CollapsibleChart>
        </div>
      )}
      
      {pieData.length > 0 && (
        <div data-tour="enrolment-pie-share" className="min-w-0">
        <CollapsibleChart
          title="Enrolment share by level (latest year)"
          description="Distribution of enrolment across education levels."
          icon={<PieChart className="size-5 text-[#4B6DEB]" />}
        >
          <LazyChart enabled={false}>
            <LevelPieChart title="Enrolment share by level (latest year)" data={pieData} hideHeader />
          </LazyChart>
        </CollapsibleChart>
        </div>
      )}
      </section>
    </div>
  )
}
