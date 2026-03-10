import { useMemo } from 'react'
import { GraduationCap, School, Users, TrendingUp, BookOpen, Info, ArrowUp, ArrowDown } from 'lucide-react'
import { Sparkline } from '../components/Sparkline'
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
  enrolment: '#422AFB',
  schools: '#7551ff',
  teachers: '#6B7FFF',
  primary: '#047857',
  secondary: '#0284c7',
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

  // Enrolment by level (latest year)
  const latestYear = sortedYears[sortedYears.length - 1] ?? sortedYears[0]
  const enrolmentByLevel = useMemo(() => {
    const levels = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary']
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
    enrolment: data.filter((r) => r.Metric === 'Enrolment' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    schools: data.filter((r) => r.Metric === 'Schools' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
    teachers: data.filter((r) => r.Metric === 'Teachers' && r.Court === 'Total' && r.Year === String(y)).reduce((s, r) => s + parseVal(r.Value), 0),
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
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${card.color}18` }}
                >
                  <card.icon className="size-6" style={{ color: card.color }} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  {compareMode && card.valueCompare ? (
                    <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">{card.valueCompare}</p>
                  ) : (
                    <p className="mt-0.5 truncate text-xl font-bold text-foreground">{card.value}</p>
                  )}
                  {card.subtitle && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground" title={card.subtitle}>
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
              {(card.sparklineData?.length >= 2 || card.yoy) && (
                <div className="flex shrink-0 items-center gap-1">
                  {card.yoy && (
                    <span
                      title={`YoY: ${card.yoy.pct >= 0 ? '+' : ''}${card.yoy.pct.toFixed(1)}%`}
                      className="text-muted-foreground"
                    >
                      {card.yoy.dir === 'up' ? <ArrowUp className="size-3.5" strokeWidth={2.5} /> : <ArrowDown className="size-3.5" strokeWidth={2.5} />}
                    </span>
                  )}
                  {card.sparklineData && card.sparklineData.length >= 2 && (
                    <Sparkline data={card.sparklineData} width={80} height={36} color={card.color} strokeWidth={2} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
