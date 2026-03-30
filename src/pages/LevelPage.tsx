import { useMemo } from 'react'
import { GraduationCap, School, Users, TrendingUp, Percent, PieChart, ArrowUp, ArrowDown } from 'lucide-react'
import { LazyChart } from '../components/LazyChart'
import { LevelBarChart, LevelStackedChart, LevelPieChart } from '../components/LevelCharts'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import { getInstitutionColor, MENU_LEVELS } from '@/lib/education-colors'
import type { StatRow } from '../types'

interface Props {
  level: string
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

/** GER/NER targets for traffic-light: green >= good, amber >= ok, red < ok */
const GER_TARGETS = { good: 90, ok: 70 }
const NER_TARGETS = { good: 85, ok: 60 }

function getStatusColor(val: number, targets: { good: number; ok: number }): 'green' | 'amber' | 'red' {
  if (val >= targets.good) return 'green'
  if (val >= targets.ok) return 'amber'
  return 'red'
}

/** Metrics that may be available per level (GER, NER, GPI from annual reports) */
const EXTRA_METRICS = [
  { key: 'GER', label: 'Gross Enrolment Rate', desc: 'Gross Enrolment Rate', unit: '%' },
  { key: 'NER', label: 'Net Enrolment Rate', desc: 'Net Enrolment Rate', unit: '%' },
  { key: 'GPI', label: 'Gender Parity Index', desc: 'Gender Parity Index', unit: '' },
  { key: 'NER_GPI', label: 'NER Gender Parity', desc: 'NER Gender Parity', unit: '' },
] as const

export function LevelPage({ level, data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD
  const color = getInstitutionColor(level)

  const enrolment = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Enrolment', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const schools = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Schools', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const teachers = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Teachers', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const ger = useMemo(
    () => selectedYears.map((y) => getValue(level, 'GER', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const ner = useMemo(
    () => selectedYears.map((y) => getValue(level, 'NER', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const teachersMale = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Teachers_Male', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const teachersFemale = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Teachers_Female', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const enrolmentMale = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Enrolment_Male', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const enrolmentFemale = useMemo(
    () => selectedYears.map((y) => getValue(level, 'Enrolment_Female', y) ?? 0),
    [level, selectedYears, getValue]
  )
  const studentTeacherRatio = useMemo(
    () =>
      selectedYears.map((y) => {
        const e = getValue(level, 'Enrolment', y)
        const t = getValue(level, 'Teachers', y)
        if (e != null && t != null && t > 0) return Math.round(e / t)
        return 0
      }),
    [level, selectedYears, getValue]
  )

  const hasEnrolment = enrolment.some((v) => v > 0)
  const hasSchools = schools.some((v) => v > 0)
  const hasTeachers = teachers.some((v) => v > 0)
  const hasGER = ger.some((v) => v > 0)
  const hasNER = ner.some((v) => v > 0)
  const hasTeachersBySex = teachersMale.some((v) => v > 0) || teachersFemale.some((v) => v > 0)
  const hasEnrolmentBySex = enrolmentMale.some((v) => v > 0) || enrolmentFemale.some((v) => v > 0)
  const hasStudentTeacherRatio = studentTeacherRatio.some((v) => v > 0)
  const hasAny = hasEnrolment || hasSchools || hasTeachers

  const extraMetricValues = useMemo(() => {
    const latestYear = selectedYears[selectedYears.length - 1]
    return EXTRA_METRICS.map((m) => ({
      ...m,
      value: getValue(level, m.key, latestYear),
    })).filter((m) => m.value != null && m.value !== 0)
  }, [level, selectedYears, getValue])

  const enrolmentTrend = useMemo(() => {
    if (enrolment.length < 2) return 0
    const prev = enrolment[enrolment.length - 2] ?? 0
    const curr = enrolment[enrolment.length - 1] ?? 0
    if (prev === 0) return 0
    return ((curr - prev) / prev) * 100
  }, [enrolment])

  const pieData = useMemo(() => {
    const latestYear = selectedYears[selectedYears.length - 1]
    const total = getValue('Total', 'Enrolment', latestYear) ?? 0
    if (total <= 0) return []
    return MENU_LEVELS.filter((l) => l !== 'Tertiary' || (getValue(l, 'Enrolment', latestYear) ?? 0) > 0).map(
      (l) => {
        const v = getValue(l, 'Enrolment', latestYear) ?? 0
        return { name: l, y: v, color: getInstitutionColor(l) }
      }
    ).filter((d) => d.y > 0)
  }, [selectedYears, getValue])

  const levelDescriptions: Record<string, string> = {
    ECCE: 'Early Childhood Care and Education (pre-primary).',
    Primary: 'Primary education (Years 1–6).',
    Secondary: 'Secondary education (Years 7+), including junior and senior secondary.',
    Tertiary: 'National University of Vanuatu (NUV) and post-secondary education.',
  }

  const dataDescription = useMemo(() => {
    if (selectedYears.length === 0) return ''
    const yr = selectedYears.length === 1 ? String(selectedYears[0]) : `${selectedYears[0]}–${selectedYears[selectedYears.length - 1]}`
    const parts: string[] = []
    if (hasEnrolment) {
      const latest = enrolment[enrolment.length - 1] ?? 0
      parts.push(`Enrolment: ${latest.toLocaleString()} in latest year`)
    }
    if (hasSchools && level !== 'Tertiary') parts.push(`Schools: ${(schools[schools.length - 1] ?? 0).toLocaleString()}`)
    if (hasTeachers && level !== 'Tertiary') parts.push(`Teachers: ${(teachers[teachers.length - 1] ?? 0).toLocaleString()}`)
    return `Data for ${yr}. ${parts.join('. ')}`
  }, [selectedYears, hasEnrolment, hasSchools, hasTeachers, enrolment, schools, teachers, level])

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          No data for {level} in selected years. {level === 'Tertiary' ? 'Tertiary data comes from NUV reports (2020–2023).' : 'Select different years.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero: level intro + key stats */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{level}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {levelDescriptions[level] ?? ''} {level === 'Tertiary' && 'Data from NUV Annual Report 2020–2023.'}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasEnrolment && (
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <GraduationCap className="size-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Enrolment</p>
                <p className="text-xl font-bold">{(enrolment[enrolment.length - 1] ?? 0).toLocaleString()}</p>
                {enrolmentTrend !== 0 && (
                  <span className={`inline-flex items-center text-xs ${enrolmentTrend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {enrolmentTrend > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(enrolmentTrend).toFixed(1)}% vs prev year
                  </span>
                )}
              </div>
            </div>
          )}
          {hasSchools && level !== 'Tertiary' && (
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <School className="size-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Schools</p>
                <p className="text-xl font-bold">{(schools[schools.length - 1] ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}
          {hasTeachers && level !== 'Tertiary' && (
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <Users className="size-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Teachers</p>
                <p className="text-xl font-bold">{(teachers[teachers.length - 1] ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}
          {extraMetricValues.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
              {extraMetricValues.slice(0, 2).map((m) => {
                const gerVal = m.key === 'GER' ? (m.value as number) : null
                const nerVal = m.key === 'NER' ? (m.value as number) : null
                const status = gerVal != null ? getStatusColor(gerVal, GER_TARGETS) : nerVal != null ? getStatusColor(nerVal, NER_TARGETS) : null
                const statusBg = status === 'green' ? 'bg-emerald-400' : status === 'amber' ? 'bg-amber-400' : status === 'red' ? 'bg-rose-400' : ''
                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
                    <span className="text-lg font-semibold">
                      {typeof m.value === 'number' && m.value % 1 !== 0 ? m.value.toFixed(1) : String(m.value)}
                      {m.unit === '%' ? '%' : ''}
                    </span>
                    {status && (
                      <span
                        className={`size-2 rounded-full ${statusBg}`}
                        title={status === 'green' ? 'On track' : status === 'amber' ? 'Needs attention' : 'Below target'}
                        aria-hidden
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section: Enrolment & Access */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="size-4" style={{ color }} />
          Enrolment & Access
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {hasEnrolment && (
            <LazyChart enabled={lazy}>
              <LevelBarChart
                title="Enrolment over time"
                values={enrolment}
                years={selectedYears}
                color={color}
              />
            </LazyChart>
          )}
          {hasEnrolmentBySex && level !== 'Tertiary' && (
            <LazyChart enabled={lazy}>
              <LevelStackedChart
                title="Enrolment by sex"
                maleValues={enrolmentMale}
                femaleValues={enrolmentFemale}
                years={selectedYears}
                color={color}
              />
            </LazyChart>
          )}
          {pieData.length > 0 && (
            <LazyChart enabled={lazy}>
              <LevelPieChart title="Enrolment share by level (latest year)" data={pieData} />
            </LazyChart>
          )}
        </div>
      </section>

      {/* Section: Resources & Capacity */}
      {(hasSchools || hasTeachers || hasStudentTeacherRatio || hasTeachersBySex) && level !== 'Tertiary' && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <School className="size-4" style={{ color }} />
            Resources & Capacity
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {hasSchools && (
              <LazyChart enabled={lazy}>
                <LevelBarChart title="Schools over time" values={schools} years={selectedYears} color={color} />
              </LazyChart>
            )}
            {hasTeachers && (
              <LazyChart enabled={lazy}>
                <LevelBarChart title="Teachers over time" values={teachers} years={selectedYears} color={color} />
              </LazyChart>
            )}
            {hasTeachersBySex && (
              <LazyChart enabled={lazy}>
                <LevelStackedChart
                  title="Teachers by sex"
                  maleValues={teachersMale}
                  femaleValues={teachersFemale}
                  years={selectedYears}
                  color={color}
                />
              </LazyChart>
            )}
            {hasStudentTeacherRatio && (
              <LazyChart enabled={lazy}>
                <LevelBarChart
                  title="Student–teacher ratio"
                  values={studentTeacherRatio}
                  years={selectedYears}
                  color={color}
                />
              </LazyChart>
            )}
          </div>
        </section>
      )}

      {/* Section: Performance Indicators */}
      {(hasGER || hasNER || extraMetricValues.length > 0) && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Percent className="size-4" style={{ color }} />
            Performance Indicators
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {extraMetricValues.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <PieChart className="size-4" style={{ color }} />
                  Latest year indicators
                </h4>
                <div className="flex flex-wrap gap-6">
                  {extraMetricValues.map((m) => {
                    const gerVal = m.key === 'GER' ? (m.value as number) : null
                    const nerVal = m.key === 'NER' ? (m.value as number) : null
                    const status = gerVal != null ? getStatusColor(gerVal, GER_TARGETS) : nerVal != null ? getStatusColor(nerVal, NER_TARGETS) : null
                    const statusLabel = status === 'green' ? 'On track' : status === 'amber' ? 'Needs attention' : status === 'red' ? 'Below target' : ''
                    const statusColor = status === 'green' ? 'text-emerald-600' : status === 'amber' ? 'text-amber-600' : status === 'red' ? 'text-rose-600' : ''
                    return (
                      <div key={m.key} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {typeof m.value === 'number' && m.value % 1 !== 0 ? m.value.toFixed(1) : String(m.value)}
                            {m.unit === '%' ? '%' : ''}
                          </span>
                          {status && <span className={`text-xs ${statusColor}`}>{statusLabel}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {hasGER && (
              <LazyChart enabled={lazy}>
                <LevelBarChart title="Gross Enrolment Rate" values={ger} years={selectedYears} color={color} unit="%" />
              </LazyChart>
            )}
            {hasNER && (
              <LazyChart enabled={lazy}>
                <LevelBarChart title="Net Enrolment Rate" values={ner} years={selectedYears} color={color} unit="%" />
              </LazyChart>
            )}
          </div>
        </section>
      )}

      {dataDescription && (
        <p className="text-sm leading-relaxed text-muted-foreground">{dataDescription}</p>
      )}
    </div>
  )
}
