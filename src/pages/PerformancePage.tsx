import { useMemo } from 'react'
import { TrendingUp, Target, Scale } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

const LEVELS = ['ECCE', 'Primary', 'Secondary'] as const

export function PerformancePage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  const gerData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'GER', y) ?? 0),
    }))
  }, [selectedYears, getValue])

  const nerData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'NER', y) ?? 0),
    }))
  }, [selectedYears, getValue])

  const gpiData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'GPI', y) ?? 0),
    }))
  }, [selectedYears, getValue])

  const hasData = gerData.some((s) => s.data.some((v) => v > 0)) || nerData.some((s) => s.data.some((v) => v > 0))

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          No GER/NER data available for selected years. These indicators are extracted from Tables 27–28 in MoET reports (2022–2024).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Gross Enrolment Rate (GER)</strong> — percentage of children of official age enrolled in school.{' '}
          <strong>Net Enrolment Rate (NER)</strong> — percentage enrolled at the official age for their level.{' '}
          <strong>Gender Parity Index (GPI)</strong> — ratio of female to male enrolment (1 = parity).
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        {gerData.some((s) => s.data.some((v) => v > 0)) && (
          <LazyChart enabled={lazy}>
            <ChartWithNarrative
              title="Gross Enrolment Rate (GER) %"
              icon={<TrendingUp className="size-4 text-teal-600" />}
              narrative="GER shows the percentage of children of official school age who are enrolled, regardless of grade. Values above 100% indicate over-enrolment (e.g. late starters or repeaters). Primary often exceeds 100% in Vanuatu."
              data={gerData}
              selectedYears={selectedYears}
              color="#0d9488"
              formatDataDesc={(d, years) => {
                const ranges = d.map((s) => {
                  const vals = s.data.filter((v) => v > 0)
                  return vals.length > 0 ? `${s.name}: ${Math.min(...vals).toFixed(1)}–${Math.max(...vals).toFixed(1)}%` : null
                }).filter(Boolean)
                return `Showing GER for ${years.length === 1 ? years[0] : `${years[0]}–${years[years.length - 1]}`}. ${ranges.join('. ')}`
              }}
            />
          </LazyChart>
        )}
        {nerData.some((s) => s.data.some((v) => v > 0)) && (
          <LazyChart enabled={lazy}>
            <ChartWithNarrative
              title="Net Enrolment Rate (NER) %"
              icon={<Target className="size-4 text-teal-600" />}
              narrative="NER measures the percentage of children of official age enrolled at the correct grade. It is typically lower than GER because it excludes over-age and under-age students. Higher NER indicates better access and progression."
              data={nerData}
              selectedYears={selectedYears}
              color="#059669"
              formatDataDesc={(d, years) => {
                const ranges = d.map((s) => {
                  const vals = s.data.filter((v) => v > 0)
                  return vals.length > 0 ? `${s.name}: ${Math.min(...vals).toFixed(1)}–${Math.max(...vals).toFixed(1)}%` : null
                }).filter(Boolean)
                return `Showing NER for ${years.length === 1 ? years[0] : `${years[0]}–${years[years.length - 1]}`}. ${ranges.join('. ')}`
              }}
            />
          </LazyChart>
        )}
        {gpiData.some((s) => s.data.some((v) => v > 0)) && (
          <LazyChart enabled={lazy}>
            <ChartWithNarrative
              title="Gender Parity Index (GPI)"
              icon={<Scale className="size-4 text-teal-600" />}
              narrative="GPI is the ratio of female to male enrolment. A value of 1.0 means parity; above 1.0 indicates more girls; below 1.0 more boys. Secondary often shows higher female enrolment in Vanuatu."
              data={gpiData}
              selectedYears={selectedYears}
              color="#0ea5e9"
              formatDataDesc={(d, years) => {
                const ranges = d.map((s) => {
                  const vals = s.data.filter((v) => v > 0)
                  return vals.length > 0 ? `${s.name}: ${Math.min(...vals).toFixed(2)}–${Math.max(...vals).toFixed(2)}` : null
                }).filter(Boolean)
                return `Showing GPI for ${years.length === 1 ? years[0] : `${years[0]}–${years[years.length - 1]}`}. ${ranges.join('. ')}`
              }}
            />
          </LazyChart>
        )}
      </div>
    </div>
  )
}

function ChartWithNarrative({
  title,
  icon,
  narrative,
  data,
  selectedYears,
  color,
  suffix,
  formatDataDesc,
}: {
  title: string
  icon: React.ReactNode
  narrative: string
  data: { name: string; data: number[] }[]
  selectedYears: number[]
  color: string
  formatDataDesc: (data: { name: string; data: number[] }[], years: number[]) => string
}) {
  const dataDesc = formatDataDesc(data, selectedYears)
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{narrative}</p>
      <div className="h-64">
        <ChartBars data={data} selectedYears={selectedYears} color={color} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{dataDesc}</p>
    </div>
  )
}

function ChartBars({
  data,
  selectedYears,
  color,
}: {
  data: { name: string; data: number[] }[]
  selectedYears: number[]
  color: string
}) {
  const maxVal = Math.max(...data.flatMap((s) => s.data), 1)
  return (
    <div className="flex h-full gap-4">
      {data.map((series) => (
        <div key={series.name} className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">{series.name}</p>
          <div className="flex flex-1 items-end gap-1">
            {series.data.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-opacity hover:opacity-90"
                style={{
                  height: `${maxVal > 0 ? (val / maxVal) * 100 : 0}%`,
                  backgroundColor: color,
                }}
                title={`${selectedYears[i]}: ${val}`}
              />
            ))}
          </div>
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            {selectedYears.map((y, i) => (
              <span key={y} className="flex-1 truncate" title={`${y}: ${series.data[i]}`}>
                {y}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
