import { useCallback, useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { BarChart3, BookMarked, CircleHelp, Layers, Lightbulb, MapPin, School, Users, Calendar } from 'lucide-react'
import { CollapsibleChart } from '@/components/CollapsibleChart'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { VanstaRow } from '@/types/vansta'
import {
  ACHIEVEMENT_BANDS,
  achievementShortLabel,
  achievementByStrand,
  countByStrand,
  countByYearLevel,
  inferCohortYearLevel,
  inferSubjectStrand,
  normalizeAchievement,
  provinceStrandCounts,
  type CohortYearLevel,
} from '@/lib/vansta-analytics'

const BASE = import.meta.env.BASE_URL

const PALETTE = ['#4B6DEB', '#6DEBB9', '#3D6D70', '#9CA5B7', '#262E3B', '#7C3AED']

const STRAND_LABELS = ['Numeracy', 'English literacy', 'French literacy'] as const
const ACHIEVEMENT_STACK_COLORS = ['#dc2626', '#f59e0b', '#84cc16', '#16a34a']
const COHORT_ORDER: CohortYearLevel[] = ['Year 4', 'Year 6', 'Year 8']

function uniqSorted<T>(arr: T[], key: (t: T) => string): string[] {
  return [...new Set(arr.map(key))].filter(Boolean).sort()
}

function countByField(rows: VanstaRow[], field: keyof VanstaRow): [string, number][] {
  const m = new Map<string, number>()
  for (const r of rows) {
    const raw = r[field]
    const k = (typeof raw === 'string' ? raw : String(raw ?? '')).trim() || 'Unknown'
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function truncateLabel(s: string, max = 52): string {
  const t = s.trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export function VanstaPage() {
  const [rows, setRows] = useState<VanstaRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterProvince, setFilterProvince] = useState<string>('all')
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [filterVANSTATest, setFilterVANSTATest] = useState<string>('all')
  /** all | numeracy | english | french — filter by joined learning area */
  const [filterStrand, setFilterStrand] = useState<string>('all')
  /** all | Year 4 | Year 6 | Year 8 */
  const [filterCohort, setFilterCohort] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetch(`${BASE}data/vanstadataset.csv`)
      .then((r) => {
        if (!r.ok) throw new Error('Could not load VANSTA dataset')
        return r.text()
      })
      .then((text) => {
        if (cancelled) return
        const parsed = Papa.parse<VanstaRow>(text, { header: true, skipEmptyLines: true })
        setRows((parsed.data ?? []) as VanstaRow[])
      })
      .catch((e) => {
        if (!cancelled) setLoadError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const years = useMemo(() => uniqSorted(rows, (r) => String(r.Year)), [rows])
  const provinces = useMemo(() => uniqSorted(rows, (r) => r.Province), [rows])
  const domains = useMemo(() => uniqSorted(rows, (r) => r.DomainName), [rows])
  const vanstaTests = useMemo(() => uniqSorted(rows, (r) => r.VANSTATest), [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterYear !== 'all' && String(r.Year) !== filterYear) return false
      if (filterProvince !== 'all' && r.Province !== filterProvince) return false
      if (filterDomain !== 'all' && r.DomainName !== filterDomain) return false
      if (filterVANSTATest !== 'all' && r.VANSTATest !== filterVANSTATest) return false
      if (filterStrand !== 'all') {
        const s = inferSubjectStrand(r)
        if (filterStrand === 'numeracy' && s !== 'Numeracy') return false
        if (filterStrand === 'english' && s !== 'English literacy') return false
        if (filterStrand === 'french' && s !== 'French literacy') return false
      }
      if (filterCohort !== 'all' && inferCohortYearLevel(r) !== filterCohort) return false
      return true
    })
  }, [rows, filterYear, filterProvince, filterDomain, filterVANSTATest, filterStrand, filterCohort])

  const kpis = useMemo(() => {
    const studentIds = new Set(filtered.map((r) => r.StudentID))
    const schoolIds = new Set(filtered.map((r) => r.SchoolID))
    let atOrAbove = 0
    for (const r of filtered) {
      const a = normalizeAchievement(r.Achievement)
      if (a === 'meeting minimum standard' || a === 'exceeding minimum standard') atOrAbove += 1
    }
    const pctAtOrAbove = filtered.length > 0 ? (100 * atOrAbove) / filtered.length : 0
    return {
      records: filtered.length,
      students: studentIds.size,
      schools: schoolIds.size,
      yearSpan: years.length ? `${years[0]}–${years[years.length - 1]}` : '—',
      pctAtOrAbove,
    }
  }, [filtered, years])

  const strandTotals = useMemo(() => countByStrand(filtered), [filtered])
  const cohortTotals = useMemo(() => countByYearLevel(filtered), [filtered])
  const achievementStrandMap = useMemo(() => achievementByStrand(filtered), [filtered])
  const provinceStrand = useMemo(() => provinceStrandCounts(filtered, 8), [filtered])

  const achievementCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of filtered) {
      const a = (r.Achievement || 'Unknown').trim() || 'Unknown'
      m.set(a, (m.get(a) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [filtered])

  const byProvince = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of filtered) {
      const p = r.Province || 'Unknown'
      m.set(p, (m.get(p) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [filtered])

  const byYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of filtered) {
      const y = String(r.Year)
      m.set(y, (m.get(y) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
  }, [filtered])

  /** Records per VANSTA test paper (e.g. Numeracy - Year 4) */
  const byVANSTATest = useMemo(() => countByField(filtered, 'VANSTATest'), [filtered])

  /** Records per overall domain label (e.g. Overall numeracy (N4)) */
  const byDomainName = useMemo(() => countByField(filtered, 'DomainName'), [filtered])

  /** Top schools by record count (School column) */
  const bySchoolTop = useMemo(() => countByField(filtered, 'School').slice(0, 25), [filtered])

  const achievementChartOptions = useMemo((): Highcharts.Options => {
    const cats = achievementCounts.map(([k]) => k)
    const data = achievementCounts.map(([, v]) => v)
    return {
      chart: { type: 'bar', height: Math.max(320, cats.length * 36), backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: cats, title: { text: 'Achievement' } },
      yAxis: { title: { text: 'Number of records' }, min: 0 },
      series: [{ type: 'bar', name: 'Records', data, color: PALETTE[0] }],
      legend: { enabled: false },
      tooltip: { valueDecimals: 0 },
      credits: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: cats.length <= 8 } } },
    }
  }, [achievementCounts])

  const provinceChartOptions = useMemo((): Highcharts.Options => {
    const top = byProvince.slice(0, 12)
    return {
      chart: { type: 'column', height: 380, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: top.map(([p]) => p), crosshair: true },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [
        {
          type: 'column',
          name: 'Test records',
          data: top.map(([, v]) => v),
          color: PALETTE[1],
        },
      ],
      legend: { enabled: false },
      tooltip: { valueDecimals: 0 },
      credits: { enabled: false },
      plotOptions: { column: { borderRadius: 4 } },
    }
  }, [byProvince])

  const yearTrendOptions = useMemo((): Highcharts.Options => {
    return {
      chart: { type: 'line', height: 340, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: byYear.map(([y]) => y), title: { text: 'Year' } },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [
        {
          type: 'line',
          name: 'Records',
          data: byYear.map(([, v]) => v),
          color: PALETTE[2],
          lineWidth: 3,
          marker: { enabled: true, radius: 4 },
        },
      ],
      legend: { enabled: false },
      tooltip: { valueDecimals: 0 },
      credits: { enabled: false },
    }
  }, [byYear])

  const pieOptions = useMemo((): Highcharts.Options => {
    const pieData = achievementCounts.slice(0, 8).map(([name, y], i) => ({
      name: name.length > 48 ? `${name.slice(0, 45)}…` : name,
      y,
      color: PALETTE[i % PALETTE.length],
    }))
    return {
      chart: { type: 'pie', height: 360, backgroundColor: 'transparent' },
      title: { text: undefined },
      series: [{ type: 'pie', name: 'Records', data: pieData }],
      plotOptions: {
        pie: {
          dataLabels: { enabled: true, format: '{point.percentage:.1f}%' },
          showInLegend: true,
        },
      },
      tooltip: { pointFormat: '<b>{point.y:,.0f}</b> ({point.percentage:.1f}%)' },
      credits: { enabled: false },
    }
  }, [achievementCounts])

  const vanstaTestChartOptions = useMemo((): Highcharts.Options => {
    const cats = byVANSTATest.map(([k]) => truncateLabel(k, 44))
    const data = byVANSTATest.map(([, v]) => v)
    return {
      chart: { type: 'bar', height: Math.max(300, cats.length * 40), backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: cats, title: { text: 'VANSTA test' } },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [{ type: 'bar', name: 'Records', data, color: PALETTE[3] }],
      legend: { enabled: false },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const i = this.point?.index ?? 0
          const full = byVANSTATest[i]?.[0] ?? ''
          return `<b>${full}</b><br/>Records: <b>${this.y?.toLocaleString?.() ?? this.y}</b>`
        },
      },
      credits: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: cats.length <= 12 } } },
    }
  }, [byVANSTATest])

  const domainNameChartOptions = useMemo((): Highcharts.Options => {
    const cats = byDomainName.map(([k]) => truncateLabel(k, 44))
    const data = byDomainName.map(([, v]) => v)
    return {
      chart: { type: 'bar', height: Math.max(300, cats.length * 40), backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: cats, title: { text: 'Domain' } },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [{ type: 'bar', name: 'Records', data, color: PALETTE[4] }],
      legend: { enabled: false },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const i = this.point?.index ?? 0
          const full = byDomainName[i]?.[0] ?? ''
          return `<b>${full}</b><br/>Records: <b>${this.y?.toLocaleString?.() ?? this.y}</b>`
        },
      },
      credits: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: cats.length <= 12 } } },
    }
  }, [byDomainName])

  const schoolTopChartOptions = useMemo((): Highcharts.Options => {
    const cats = bySchoolTop.map(([k]) => truncateLabel(k, 40))
    const data = bySchoolTop.map(([, v]) => v)
    return {
      chart: { type: 'bar', height: Math.max(380, cats.length * 34), backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: cats, title: { text: 'School' } },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [{ type: 'bar', name: 'Records', data, color: PALETTE[5] }],
      legend: { enabled: false },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const i = this.point?.index ?? 0
          const full = bySchoolTop[i]?.[0] ?? ''
          return `<b>${full}</b><br/>Records: <b>${this.y?.toLocaleString?.() ?? this.y}</b>`
        },
      },
      credits: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, dataLabels: { enabled: false } } },
    }
  }, [bySchoolTop])

  const strandVolumeOptions = useMemo((): Highcharts.Options => {
    const data = STRAND_LABELS.map((s, i) => ({
      y: strandTotals[s],
      color: PALETTE[i % PALETTE.length],
    }))
    return {
      chart: { type: 'column', height: 320, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: [...STRAND_LABELS], crosshair: true, title: { text: 'Learning area' } },
      yAxis: { title: { text: 'Test records' }, min: 0 },
      series: [{ type: 'column', name: 'Records', data, borderWidth: 0, borderRadius: 4 }],
      legend: { enabled: false },
      tooltip: { valueDecimals: 0 },
      credits: { enabled: false },
      plotOptions: { column: { dataLabels: { enabled: true } } },
    }
  }, [strandTotals])

  const cohortYearOptions = useMemo((): Highcharts.Options => {
    const cats = COHORT_ORDER
    const data = COHORT_ORDER.map((y) => cohortTotals[y])
    return {
      chart: { type: 'column', height: 300, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: cats, crosshair: true, title: { text: 'Cohort (year level)' } },
      yAxis: { title: { text: 'Records' }, min: 0 },
      series: [{ type: 'column', name: 'Records', data, color: PALETTE[2], borderWidth: 0, borderRadius: 4 }],
      legend: { enabled: false },
      tooltip: { valueDecimals: 0 },
      credits: { enabled: false },
    }
  }, [cohortTotals])

  const achievementByStrandOptions = useMemo((): Highcharts.Options => {
    const categories = [...STRAND_LABELS]
    const series: Highcharts.SeriesColumnOptions[] = ACHIEVEMENT_BANDS.map((band, i) => ({
      type: 'column',
      name: achievementShortLabel(band),
      data: STRAND_LABELS.map((strand) => achievementStrandMap.get(strand)?.get(band) ?? 0),
      color: ACHIEVEMENT_STACK_COLORS[i],
    }))
    return {
      chart: { type: 'column', height: 400, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories, crosshair: true },
      yAxis: {
        title: { text: 'Share of records (%)' },
        min: 0,
        max: 100,
        reversedStacks: false,
        labels: { format: '{value}%' },
      },
      plotOptions: {
        column: { stacking: 'percent', borderWidth: 0, borderRadius: 2 },
      },
      series,
      legend: { enabled: true, reversed: true },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:,.0f}</b> ({point.percentage:.1f}%)<br/>',
      },
      credits: { enabled: false },
    }
  }, [achievementStrandMap])

  const provinceByStrandOptions = useMemo((): Highcharts.Options => {
    const { provinces, numeracy, english, french } = provinceStrand
    if (provinces.length === 0) {
      return { title: { text: 'No data' }, credits: { enabled: false } }
    }
    return {
      chart: { type: 'column', height: Math.max(360, provinces.length * 28), backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: { categories: provinces, crosshair: true },
      yAxis: { title: { text: 'Records' }, min: 0 },
      plotOptions: { column: { grouping: true, borderWidth: 0, borderRadius: 3 } },
      series: [
        { type: 'column', name: 'Numeracy', data: numeracy, color: PALETTE[0] },
        { type: 'column', name: 'English literacy', data: english, color: PALETTE[1] },
        { type: 'column', name: 'French literacy', data: french, color: PALETTE[2] },
      ],
      legend: { enabled: true },
      tooltip: { shared: true, valueDecimals: 0 },
      credits: { enabled: false },
    }
  }, [provinceStrand])

  const resetFilters = useCallback(() => {
    setFilterYear('all')
    setFilterProvince('all')
    setFilterDomain('all')
    setFilterVANSTATest('all')
    setFilterStrand('all')
    setFilterCohort('all')
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-10 animate-spin rounded-full border-2 border-[#4B6DEB] border-t-transparent" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">{loadError}</p>
        </CardContent>
      </Card>
    )
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No assessment data is available to display right now.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-white shadow-sm" data-tour="vansta-intro">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-[#262E3B]">VANSTA</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            National assessment results from student-level test records. Each row includes <strong className="text-foreground">School</strong>{' '}
            (name), <strong className="text-foreground">VANSTATest</strong> (test paper, e.g. numeracy or literacy), and{' '}
            <strong className="text-foreground">DomainName</strong> (overall skill area, e.g. Overall numeracy (N4)). Charts below{' '}
            <strong className="text-foreground">join all numeracy</strong> papers into one learning area, and split literacy into{' '}
            <strong className="text-foreground">English</strong> vs <strong className="text-foreground">French</strong> strands using domain
            codes (LA vs LF) and test titles. Use filters to focus the view. This dataset is separate from MoET annual statistics.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white shadow-sm" data-tour="vansta-understanding">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 shrink-0 text-[#3D6D70]" />
            <h3 className="text-base font-semibold text-[#262E3B]">Understanding this dataset</h3>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Grain:</strong> one row = one student attempt on one VANSTA domain (e.g. overall Year 4
              numeracy). The same student appears multiple times per year when they sit several papers (numeracy + literacy, English + French,
              etc.).
            </li>
            <li>
              <strong className="text-foreground">Learning areas:</strong> we aggregate every numeracy paper into <em>Numeracy</em>, map English
              literacy papers to <em>English literacy</em>, and French / alphabétisation papers to <em>French literacy</em>—so you can compare
              volume and achievement patterns across strands without reading nine separate test labels.
            </li>
            <li>
              <strong className="text-foreground">Achievement:</strong> bands run from critically below → approaching → meeting → exceeding
              minimum standard. The KPI &quot;at or above minimum&quot; is meeting + exceeding—useful as a single quality bar (with the caveat
              that it still counts one row per test, not unique students).
            </li>
            <li>
              <strong className="text-foreground">Reading the charts:</strong> if the finer &quot;Achievement level&quot; label does not vary much
              in the data shown here, use the main <strong className="text-foreground">Achievement</strong> band to compare how students are
              performing.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
            <CircleHelp className="mr-1 inline size-3.5 align-text-bottom text-[#4B6DEB]" />
            Use <strong className="text-foreground">Guided help</strong> in the top bar for a walkthrough of each filter and chart.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" data-tour="vansta-kpis">
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4B6DEB]/10">
              <BarChart3 className="size-5 text-[#4B6DEB]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Filtered records</p>
              <p className="text-lg font-bold text-foreground">{kpis.records.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6DEBB9]/20">
              <Users className="size-5 text-[#3D6D70]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique students</p>
              <p className="text-lg font-bold text-foreground">{kpis.students.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9CA5B7]/20">
              <School className="size-5 text-[#262E3B]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique schools</p>
              <p className="text-lg font-bold text-foreground">{kpis.schools.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D6D70]/15">
              <Calendar className="size-5 text-[#3D6D70]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Years in dataset</p>
              <p className="text-lg font-bold text-foreground">{kpis.yearSpan}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <BarChart3 className="size-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">At or above minimum (meeting + exceeding)</p>
              <p className="text-lg font-bold text-foreground">{kpis.pctAtOrAbove.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[140px] space-y-1.5" data-tour="vansta-filter-year">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Year</p>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] space-y-1.5" data-tour="vansta-filter-province">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Province</p>
              <Select value={filterProvince} onValueChange={setFilterProvince}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All provinces</SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[200px] flex-1 space-y-1.5" data-tour="vansta-filter-domain">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain (DomainName)</p>
              <Select value={filterDomain} onValueChange={setFilterDomain}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="all">All domains</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.length > 60 ? `${d.slice(0, 57)}…` : d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[200px] flex-1 space-y-1.5" data-tour="vansta-filter-test">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VANSTA test</p>
              <Select value={filterVANSTATest} onValueChange={setFilterVANSTATest}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="All tests" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="all">All tests</SelectItem>
                  {vanstaTests.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.length > 70 ? `${t.slice(0, 67)}…` : t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[200px] flex-1 space-y-1.5" data-tour="vansta-filter-strand">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learning area (joined)</p>
              <Select value={filterStrand} onValueChange={setFilterStrand}>
                <SelectTrigger className="w-full max-w-[220px]">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All areas</SelectItem>
                  <SelectItem value="numeracy">Numeracy only</SelectItem>
                  <SelectItem value="english">English literacy only</SelectItem>
                  <SelectItem value="french">French literacy only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px] space-y-1.5" data-tour="vansta-filter-cohort">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cohort</p>
              <Select value={filterCohort} onValueChange={setFilterCohort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All cohorts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cohorts (Y4–Y8)</SelectItem>
                  <SelectItem value="Year 4">Year 4</SelectItem>
                  <SelectItem value="Year 6">Year 6</SelectItem>
                  <SelectItem value="Year 8">Year 8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              type="button"
              data-tour="vansta-filter-reset"
              onClick={resetFilters}
              className="text-sm text-[#4B6DEB] underline-offset-2 hover:underline"
            >
              Reset filters
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div data-tour="vansta-chart-learning-area" className="min-w-0">
          <CollapsibleChart
            title="Records by learning area (joined)"
            description="All numeracy papers combined; English vs French literacy split using domain codes (LA/LF) and test titles. Filtered subset."
            icon={<Layers className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={strandVolumeOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
        <div data-tour="vansta-chart-cohort" className="min-w-0">
          <CollapsibleChart
            title="Records by cohort (year level)"
            description="Year 4, 6, or 8 from the test name / domain code (N4/LA4/LF4, etc.). Filtered subset."
            icon={<BarChart3 className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={cohortYearOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
      </div>

      <div data-tour="vansta-chart-achievement-mix" className="min-w-0">
        <CollapsibleChart
          title="Achievement mix by learning area"
          description="100% stacked: share of achievement bands within each joined learning area (same row grain as other charts)."
          icon={<BarChart3 className="size-5 text-[#4B6DEB]" />}
        >
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <HighchartsReact highcharts={Highcharts} options={achievementByStrandOptions} immutable />
          </div>
        </CollapsibleChart>
      </div>

      <div data-tour="vansta-chart-province-strand" className="min-w-0">
        <CollapsibleChart
          title="Province × learning area"
          description="Side-by-side counts for Numeracy, English literacy, and French literacy in the top provinces (by total records in the current filter)."
          icon={<MapPin className="size-5 text-[#4B6DEB]" />}
        >
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <HighchartsReact highcharts={Highcharts} options={provinceByStrandOptions} immutable />
          </div>
        </CollapsibleChart>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div data-tour="vansta-chart-vansta-test" className="min-w-0">
          <CollapsibleChart
            title="Records by VANSTA test"
            description="Volume of test records per VANSTA test paper (VANSTATest column). Filtered subset."
            icon={<BookMarked className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={vanstaTestChartOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
        <div data-tour="vansta-chart-domain" className="min-w-0">
          <CollapsibleChart
            title="Records by domain"
            description="Volume per overall domain label (DomainName), e.g. Overall numeracy or literacy. Filtered subset."
            icon={<BarChart3 className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={domainNameChartOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
      </div>

      <div data-tour="vansta-chart-schools" className="min-w-0">
        <CollapsibleChart
          title="Top schools by record count"
          description="Schools with the most test records in the filtered subset (School column). Shows up to 25 schools."
          icon={<School className="size-5 text-[#4B6DEB]" />}
        >
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <HighchartsReact highcharts={Highcharts} options={schoolTopChartOptions} immutable />
          </div>
        </CollapsibleChart>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div data-tour="vansta-chart-achievement-dist" className="min-w-0">
          <CollapsibleChart
            title="Achievement distribution"
            description="Count of test records by achievement band (filtered)."
            icon={<BarChart3 className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={achievementChartOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
        <div data-tour="vansta-chart-achievement-pie" className="min-w-0">
          <CollapsibleChart
            title="Share of records by achievement"
            description="Proportional breakdown of the filtered records."
            icon={<BarChart3 className="size-5 text-[#4B6DEB]" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-4">
              <HighchartsReact highcharts={Highcharts} options={pieOptions} immutable />
            </div>
          </CollapsibleChart>
        </div>
      </div>

      <div data-tour="vansta-chart-province-records" className="min-w-0">
        <CollapsibleChart
          title="Records by province"
          description="Top provinces by number of test records (filtered)."
          icon={<MapPin className="size-5 text-[#4B6DEB]" />}
        >
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <HighchartsReact highcharts={Highcharts} options={provinceChartOptions} immutable />
          </div>
        </CollapsibleChart>
      </div>

      <div data-tour="vansta-chart-year-trend" className="min-w-0">
        <CollapsibleChart
          title="Records over time"
          description="Total test records per calendar year in the filtered subset."
          icon={<Calendar className="size-5 text-[#4B6DEB]" />}
        >
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <HighchartsReact highcharts={Highcharts} options={yearTrendOptions} immutable />
          </div>
        </CollapsibleChart>
      </div>
    </div>
  )
}
