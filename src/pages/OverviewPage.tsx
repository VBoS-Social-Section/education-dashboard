import { useMemo } from 'react'
import { GraduationCap, School, Users, BookOpen, Info } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { EnrolmentChart } from '../components/EnrolmentChart'
import { AnimatedKPICard } from '../components/AnimatedChart'
import { CollapsibleChart, MasonryGrid, CollapsibleKPICard } from '../components/CollapsibleChart'
import { TrendChart } from '../components/TrendChart'
import { GenderHeatmapChart } from '../components/GenderHeatmapChart'
import { LevelPieChart } from '../components/LevelCharts'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import { getInstitutionColor, sortInstitutionsByOrder } from '@/lib/education-colors'
import type { StatRow } from '../types'

function parseVal(v: string): number {
  if (!v || String(v).toLowerCase() === 'na') return 0
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
  onNavigateToMethodology?: () => void
}

const CARD_COLORS = {
  enrolment: '#FF6B35',  // Vanuatu red-orange
  schools: '#0047AB',    // Deep blue
  teachers: '#FFD700',   // Golden yellow
  primary: '#228B22',    // Rich green
  secondary: '#2C3E50', // Deep charcoal
} as const

export function OverviewPage({ data, selectedYears, compareMode = false, getValue, onNavigateToMethodology }: Props) {
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const [yearA, yearB] = compareMode && sortedYears.length >= 2 ? [sortedYears[0], sortedYears[1]] : [null, null]
  const institutions = useMemo(() => [...new Set(data.map((r) => r.Court))], [data])

  // Total Enrolment
  const enrolmentByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Enrolment' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalEnrolment = enrolmentByYear.length > 0 ? enrolmentByYear[enrolmentByYear.length - 1] : 0

  // Total Schools
  const schoolsByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Schools' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalSchools = schoolsByYear.length > 0 ? schoolsByYear[schoolsByYear.length - 1] : 0

  // Total Teachers
  const teachersByYear = useMemo(() => sortedYears.map(
    (y) => data.filter((r) => r.Metric === 'Teachers' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0)
  ), [sortedYears, data])
  const totalTeachers = teachersByYear.length > 0 ? teachersByYear[teachersByYear.length - 1] : 0

  // Enrolment by level (latest year) - use institutions from filtered data
  const latestYear = sortedYears[sortedYears.length - 1] ?? sortedYears[0]
  const enrolmentByLevel = useMemo(() => {
    const levels = institutions.filter((c) => c !== 'Total')
    return levels.map((inst) => ({
      inst,
      value: getValue(inst, 'Enrolment', latestYear) ?? 0,
    })).filter((x) => x.value > 0)
  }, [institutions, latestYear, getValue])

  const yoy = (arr: number[]) =>
    arr.length >= 2
      ? (() => {
          const prev = arr[arr.length - 2]
          const curr = arr[arr.length - 1]
          const pct = prev > 0 ? (100 * (curr - prev)) / prev : (curr > prev ? 100 : 0)
          const dir = curr > prev ? 'up' : curr < prev ? 'down' : 'flat'
          return dir === 'flat' ? null : { pct, dir }
        })()
      : null

  const getValForYear = (y: number) => ({
    enrolment: filteredData.filter((r) => r.Metric === 'Enrolment' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    schools: filteredData.filter((r) => r.Metric === 'Schools' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    teachers: filteredData.filter((r) => r.Metric === 'Teachers' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
  })

  const cards: Array<{
    label: string
    value: string
    valueCompare?: string
    icon: typeof GraduationCap
    color: string
    sparklineData: number[] | null
    yoy: { pct: number; dir: 'up' | 'down' } | null
    subtitle?: string
  }> = [
    {
      label: 'Total Enrolment',
      value: totalEnrolment.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).enrolment
        const b = getValForYear(yearB).enrolment
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: GraduationCap,
      color: CARD_COLORS.enrolment,
      sparklineData: enrolmentByYear,
      yoy: yoy(enrolmentByYear),
    },
    {
      label: 'Total Schools',
      value: totalSchools.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).schools
        const b = getValForYear(yearB).schools
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: School,
      color: CARD_COLORS.schools,
      sparklineData: schoolsByYear,
      yoy: yoy(schoolsByYear),
    },
    {
      label: 'Total Teachers',
      value: totalTeachers.toLocaleString(),
      valueCompare: yearA != null && yearB != null ? (() => {
        const a = getValForYear(yearA).teachers
        const b = getValForYear(yearB).teachers
        const pct = a > 0 ? (100 * (b - a)) / a : 0
        return `${yearA}: ${a.toLocaleString()} → ${yearB}: ${b.toLocaleString()} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
      })() : undefined,
      icon: Users,
      color: CARD_COLORS.teachers,
      sparklineData: teachersByYear,
      yoy: yoy(teachersByYear),
    },
    {
      label: 'Enrolment by Level',
      value: enrolmentByLevel.length > 0 ? enrolmentByLevel.map((x) => `${x.inst}: ${x.value.toLocaleString()}`).join(' · ') : 'N/A',
      icon: BookOpen,
      color: CARD_COLORS.primary,
      sparklineData: null,
      yoy: null,
      subtitle: `Latest year: ${latestYear}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This dashboard summarizes key education statistics from the Vanuatu Ministry of Education and Training (MoET) Annual Reports. Data covers enrolment, schools, and teachers across ECCE (Early Childhood Care and Education), Primary, Secondary, and Senior Secondary levels. Select years and education levels in the sidebar to filter the data.
        </p>
        {onNavigateToMethodology && (
          <button
            type="button"
            onClick={onNavigateToMethodology}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Data notes and limitations"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            <span>See Methodology for data sources and limitations</span>
          </button>
        )}
      </div>
      
      {/* Responsive KPI Masonry Grid */}
      <MasonryGrid columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}>
        <CollapsibleKPICard 
          title="Total Enrolment" 
          value={totalEnrolment.toLocaleString()} 
          description="All education levels combined"
          color={CARD_COLORS.enrolment}
        >
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• ECCE: {getValue('ECCE', 'Enrolment', latestYear)?.toLocaleString() || 0}</div>
            <div>• Primary: {getValue('Primary', 'Enrolment', latestYear)?.toLocaleString() || 0}</div>
            <div>• Secondary: {getValue('Secondary', 'Enrolment', latestYear)?.toLocaleString() || 0}</div>
            <div>• Senior Secondary: {getValue('Senior Secondary', 'Enrolment', latestYear)?.toLocaleString() || 0}</div>
          </div>
        </CollapsibleKPICard>
        
        <CollapsibleKPICard 
          title="Total Schools" 
          value={totalSchools.toLocaleString()} 
          description="Educational institutions nationwide"
          color={CARD_COLORS.schools}
        >
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• ECCE: {getValue('ECCE', 'Schools', latestYear)?.toLocaleString() || 0}</div>
            <div>• Primary: {getValue('Primary', 'Schools', latestYear)?.toLocaleString() || 0}</div>
            <div>• Secondary: {getValue('Secondary', 'Schools', latestYear)?.toLocaleString() || 0}</div>
            <div>• Senior Secondary: {getValue('Senior Secondary', 'Schools', latestYear)?.toLocaleString() || 0}</div>
          </div>
        </CollapsibleKPICard>
        
        <CollapsibleKPICard 
          title="Total Teachers" 
          value={totalTeachers.toLocaleString()} 
          description="Teaching workforce across all levels"
          color={CARD_COLORS.teachers}
        >
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• ECCE: {getValue('ECCE', 'Teachers', latestYear)?.toLocaleString() || 0}</div>
            <div>• Primary: {getValue('Primary', 'Teachers', latestYear)?.toLocaleString() || 0}</div>
            <div>• Secondary: {getValue('Secondary', 'Teachers', latestYear)?.toLocaleString() || 0}</div>
            <div>• Senior Secondary: {getValue('Senior Secondary', 'Teachers', latestYear)?.toLocaleString() || 0}</div>
          </div>
        </CollapsibleKPICard>
        
        <CollapsibleKPICard 
          title="Enrolment by Level" 
          value={enrolmentByLevel.length > 0 ? enrolmentByLevel.length : 0}
          description="Education levels with data"
          color={CARD_COLORS.primary}
        >
          <div className="text-xs text-muted-foreground space-y-1">
            {enrolmentByLevel.map((level, index) => (
              <div key={index}>
                • {level.inst}: {level.value.toLocaleString()}
              </div>
            ))}
          </div>
        </CollapsibleKPICard>
      </MasonryGrid>
      
      {/* Detailed Charts - Collapsible by Default */}
      <div className="space-y-6">
        <CollapsibleChart
          title="Enrolment Trends"
          description="Track student enrollment patterns across education levels over time"
        >
          <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
            <TrendChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
              metric="Enrolment"
              title="Enrolment Trends Over Time"
              description="Line chart showing enrollment trends by education level across multiple years. Track growth patterns and identify changes in educational participation."
            />
          </LazyChart>
        </CollapsibleChart>
        
        <CollapsibleChart
          title="Gender Distribution Analysis"
          description="Visualize gender balance across education levels and years"
        >
          <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
            <GenderHeatmapChart
              data={data}
              selectedYears={selectedYears}
              getValue={getValue}
            />
          </LazyChart>
        </CollapsibleChart>
        
        <CollapsibleChart
          title="Detailed Enrollment Breakdown"
          description="Comprehensive view of enrollment by education level and year"
        >
          <LazyChart enabled={selectedYears.length >= MANY_YEARS_THRESHOLD}>
            <EnrolmentChart data={data} selectedYears={selectedYears} getValue={getValue} />
          </LazyChart>
        </CollapsibleChart>
      </div>
    </div>
  )
}
