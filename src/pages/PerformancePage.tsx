import { useMemo } from 'react'
import { TrendingUp, Target, Scale, BarChart3, Activity } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { TrendChart } from '../components/TrendChart'
import { EnhancedBarChart } from '../components/EnhancedBarChart'
import { CollapsibleChart, MasonryGrid } from '../components/CollapsibleChart'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

const LEVELS = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary', 'Tertiary'] as const

export function PerformancePage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  const gerData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'GER', y) ?? 0),
    })).filter((s) => s.data.some((v) => v > 0))
  }, [selectedYears, getValue])

  const nerData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'NER', y) ?? 0),
    })).filter((s) => s.data.some((v) => v > 0))
  }, [selectedYears, getValue])

  const gpiData = useMemo(() => {
    return LEVELS.map((inst) => ({
      name: inst,
      data: selectedYears.map((y) => getValue(inst, 'GPI', y) ?? 0),
    })).filter((s) => s.data.some((v) => v > 0))
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
      
      {/* Performance Metrics Overview - Compact Grid */}
      <MasonryGrid columns={{ xs: 1, sm: 2, lg: 3 }}>
        {gerData.some((s) => s.data.some((v) => v > 0)) && (
          <CollapsibleChart
            title="Gross Enrolment Rate (GER)"
            description="Percentage of children of official school age enrolled"
            icon={<TrendingUp className="size-5 text-teal-600" />}
            defaultOpen={true}
            className="h-fit"
          >
            <LazyChart enabled={lazy}>
              <EnhancedBarChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="GER"
                title="Gross Enrolment Rate (GER) %"
                description="GER shows the percentage of children of official school age who are enrolled, regardless of grade. Values above 100% indicate over-enrolment (e.g. late starters or repeaters). Primary often exceeds 100% in Vanuatu."
                showPercentages={true}
              />
            </LazyChart>
          </CollapsibleChart>
        )}
        
        {nerData.some((s) => s.data.some((v) => v > 0)) && (
          <CollapsibleChart
            title="Net Enrolment Rate (NER)"
            description="Percentage enrolled at the correct age for their level"
            icon={<Target className="size-5 text-teal-600" />}
            className="h-fit"
          >
            <LazyChart enabled={lazy}>
              <EnhancedBarChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="NER"
                title="Net Enrolment Rate (NER) %"
                description="NER measures the percentage of children of official age enrolled at the correct grade. It is typically lower than GER because it excludes over-age and under-age students. Higher NER indicates better access and progression."
                showPercentages={true}
              />
            </LazyChart>
          </CollapsibleChart>
        )}
        
        {gpiData.some((s) => s.data.some((v) => v > 0)) && (
          <CollapsibleChart
            title="Gender Parity Index (GPI)"
            description="Ratio of female to male enrolment (1 = parity)"
            icon={<Scale className="size-5 text-teal-600" />}
            className="h-fit"
          >
            <LazyChart enabled={lazy}>
              <EnhancedBarChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="GPI"
                title="Gender Parity Index (GPI)"
                description="GPI is the ratio of female to male enrolment. A value of 1.0 means parity; above 1.0 indicates more girls; below 1.0 more boys. Secondary often shows higher female enrolment in Vanuatu."
                showPercentages={false}
              />
            </LazyChart>
          </CollapsibleChart>
        )}
      </MasonryGrid>
      
      {/* Trend Analysis - Collapsible by Default */}
      {selectedYears.length > 1 && (
        <div className="space-y-6">
          <CollapsibleChart
            title="Performance Trends Over Time"
            description="Track changes in education indicators across multiple years"
            icon={<Activity className="size-5 text-teal-600" />}
          >
            <MasonryGrid columns={{ xs: 1, lg: 2 }}>
              {gerData.some((s) => s.data.some((v) => v > 0)) && (
                <LazyChart enabled={lazy}>
                  <TrendChart
                    data={data}
                    selectedYears={selectedYears}
                    getValue={getValue}
                    metric="GER"
                    title="GER Trends Over Time"
                    description="Line chart showing Gross Enrolment Rate trends by education level. Track progress toward universal access goals."
                    showPercentages={true}
                  />
                </LazyChart>
              )}
              
              {nerData.some((s) => s.data.some((v) => v > 0)) && (
                <LazyChart enabled={lazy}>
                  <TrendChart
                    data={data}
                    selectedYears={selectedYears}
                    getValue={getValue}
                    metric="NER"
                    title="NER Trends Over Time"
                    description="Line chart showing Net Enrolment Rate trends. Monitor age-appropriate enrollment patterns."
                    showPercentages={true}
                  />
                </LazyChart>
              )}
            </MasonryGrid>
          </CollapsibleChart>
        </div>
      )}
    </div>
  )
}
