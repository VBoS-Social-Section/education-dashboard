import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { CollapsibleKPICard } from '../components/CollapsibleChart'
import type { StatRow, Sdg4Seed } from '../types'

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
  sdg4Seed?: Sdg4Seed | null
  selectedProvince?: string
  onNavigateToMethodology?: () => void
}

const CARD_COLORS = {
  enrolment: '#4B6DEB',  // vibrant blue
  schools: '#6DEBB9',    // mint green
  teachers: '#3D6D70',   // dark teal
  primary: '#9CA5B7',   // muted lavender
  secondary: '#262E3B', // darkest blue
} as const

export function OverviewPage({ data, selectedYears, compareMode = false, getValue, sdg4Seed, selectedProvince, onNavigateToMethodology }: Props) {
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const latestYear = sortedYears[sortedYears.length - 1] ?? sortedYears[0]

  // Total Enrolment (latest selected year)
  const totalEnrolment = useMemo(() => {
    return data
      .filter((r) => r.Metric === 'Enrolment' && r.Court === 'Total' && r.Year === String(latestYear))
      .reduce((sum, r) => sum + parseVal(r.Value), 0)
  }, [data, latestYear])

  // Total Schools (latest selected year)
  const totalSchools = useMemo(() => {
    return data
      .filter((r) => r.Court === 'Total' && r.Metric === 'Schools' && r.Year === String(latestYear))
      .reduce((sum, r) => sum + parseVal(r.Value), 0)
  }, [data, latestYear])

  // Total Teachers (latest selected year)
  const totalTeachers = useMemo(() => {
    return data
      .filter((r) => r.Court === 'Total' && r.Metric === 'Teachers' && r.Year === String(latestYear))
      .reduce((sum, r) => sum + parseVal(r.Value), 0)
  }, [data, latestYear])

  return (
    <div className="space-y-6">
      {/* Intro first */}
      <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm" data-tour="overview-intro">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Key education statistics from MoET Annual Reports and VEMIS. SDG 4 aligned. Covers ECCE, Primary, Secondary (junior and senior combined), and Tertiary from NUV where available.
        </p>
        {onNavigateToMethodology && (
          <button
            type="button"
            onClick={onNavigateToMethodology}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Data notes and limitations"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            <span>See Methodology</span>
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-tour="overview-kpis">
        <CollapsibleKPICard 
          title="Total Enrolment" 
          value={totalEnrolment.toLocaleString()} 
          description="All levels"
          color={CARD_COLORS.enrolment}
        />
        <CollapsibleKPICard 
          title="Total Schools" 
          value={totalSchools.toLocaleString()} 
          description="Nationwide"
          color={CARD_COLORS.schools}
        />
        <CollapsibleKPICard 
          title="Total Teachers" 
          value={totalTeachers.toLocaleString()} 
          description="Teaching workforce"
          color={CARD_COLORS.teachers}
        />
      </div>
    </div>
  )
}
