import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Info, Landmark, ClipboardList, Users2, Baby, TrendingUp } from 'lucide-react'
import { CollapsibleChart, CollapsibleKPICard, MasonryGrid } from '@/components/CollapsibleChart'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CensusMicsSeed, StatRow } from '@/types'

const BASE = import.meta.env.BASE_URL

const PALETTE = {
  moet: '#4B6DEB', // vibrant blue — administrative (MoET/VEMIS)
  census: '#6DEBB9', // mint — 2020 Census
  mics: '#7C3AED', // violet — MICS 2023 household survey
  lfs: '#3D6D70', // dark teal — Labour Force Survey
  male: '#4B6DEB',
  female: '#EC4899',
} as const

/** N evenly spaced shades of one hue, lightest first — used so each selected year gets a distinct but same-family colour. */
function shadeScale(hue: number, saturation: number, count: number): string[] {
  if (count <= 1) return [`hsl(${hue}, ${saturation}%, 45%)`]
  const lightest = 80
  const darkest = 30
  return Array.from({ length: count }, (_, i) => {
    const l = lightest - (i * (lightest - darkest)) / (count - 1)
    return `hsl(${hue}, ${saturation}%, ${l}%)`
  })
}

const LEVEL_CATEGORIES = ['ECCE', 'Primary', 'Junior Secondary', 'Senior Secondary', 'Secondary (combined)'] as const

interface MoetLevelStats {
  NER: Record<string, number>
  GER: Record<string, number>
  GPI: Record<string, number>
}

function parseValue(val: string): number | null {
  if (val == null || val === '' || String(val).toLowerCase() === 'na') return null
  const n = parseFloat(String(val))
  return Number.isNaN(n) ? null : n
}

async function fetchLatestMoetLevelStats(): Promise<{ year: number | null; stats: MoetLevelStats }> {
  const empty: MoetLevelStats = { NER: {}, GER: {}, GPI: {} }
  try {
    const yearsRes = await fetch(`${BASE}data/years.json`)
    if (!yearsRes.ok) return { year: null, stats: empty }
    const yearsJson = (await yearsRes.json()) as { years?: number[] }
    const years = yearsJson.years ?? []
    if (years.length === 0) return { year: null, stats: empty }
    const latest = Math.max(...years)
    const csvRes = await fetch(`${BASE}data/${latest}.csv`)
    if (!csvRes.ok) return { year: latest, stats: empty }
    const text = await csvRes.text()
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
    const rows = (parsed.data ?? []) as StatRow[]
    const stats: MoetLevelStats = { NER: {}, GER: {}, GPI: {} }
    for (const r of rows) {
      if (r.Metric === 'NER' || r.Metric === 'GER' || r.Metric === 'GPI') {
        const v = parseValue(r.Value)
        if (v != null) stats[r.Metric][r.Court] = v
      }
    }
    return { year: latest, stats }
  } catch {
    return { year: null, stats: empty }
  }
}

function buildLevelSeries(values: {
  ECCE?: number
  Primary?: number
  'Junior Secondary'?: number
  'Senior Secondary'?: number
  'Secondary (combined)'?: number
}): (number | null)[] {
  return LEVEL_CATEGORIES.map((c) => values[c] ?? null)
}

function weightedAvg(pairs: [number, number][]): number | null {
  let num = 0
  let den = 0
  for (const [rate, weight] of pairs) {
    if (Number.isFinite(rate) && Number.isFinite(weight) && weight > 0) {
      num += rate * weight
      den += weight
    }
  }
  return den > 0 ? num / den : null
}

function baseChartOptions(): Highcharts.Options {
  return {
    chart: { type: 'column', height: 380, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
    xAxis: { categories: [...LEVEL_CATEGORIES], gridLineDashStyle: 'Dash', gridLineWidth: 1 },
    yAxis: {
      title: { text: 'Percent (%)', style: { fontSize: '13px', fontWeight: '600' } },
      gridLineDashStyle: 'Dash',
      max: 110,
      min: 0,
    },
    plotOptions: { column: { borderWidth: 0, borderRadius: 4 } },
    legend: { enabled: true, itemStyle: { fontSize: '12px', fontWeight: '500' } },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      formatter: function (this: any) {
        const lines: string[] = [`<b>${this.x}</b>`]
        this.points?.forEach((p: any) => {
          if (p.y == null) return
          lines.push(`<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.y}%</b>`)
        })
        return lines.join('<br/>')
      },
    },
    credits: { enabled: false },
  }
}

export function CensusMicsPage() {
  const [seed, setSeed] = useState<CensusMicsSeed | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [moet, setMoet] = useState<{ year: number | null; stats: MoetLevelStats }>({ year: null, stats: { NER: {}, GER: {}, GPI: {} } })
  /** 2020 (actual Census), 2025 (midpoint), 2030 (projection horizon) as a sensible default trend comparison */
  const [pyramidYears, setPyramidYears] = useState<string[]>(['2020', '2025', '2030'])
  const [heatmapSex, setHeatmapSex] = useState<'both' | 'male' | 'female'>('both')

  useEffect(() => {
    fetch(`${BASE}data/seed_census_mics.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load seed_census_mics.json'))))
      .then((json) => setSeed(json as CensusMicsSeed))
      .catch((e) => setLoadError((e as Error).message))
  }, [])

  useEffect(() => {
    fetchLatestMoetLevelStats().then(setMoet)
  }, [])

  const censusAttendanceRatio = useMemo(() => {
    if (!seed) return null
    const pop = seed.schoolAgePopulationProjection.bands
    const attend = seed.census2020.attendanceByLevel.Vanuatu
    const pop2020 = (band: string) => pop[band]?.[0] ?? 0
    const eccePop = pop2020('ECCE (age 4-5)')
    const primaryPop = pop2020('Primary (age 6-11)')
    const jrPop = pop2020('Junior Secondary (age 12-15)')
    const srPop = pop2020('Senior Secondary (age 16-19)')
    const ecce = eccePop > 0 ? (attend.ECCE / eccePop) * 100 : null
    const primary = primaryPop > 0 ? (attend.Primary / primaryPop) * 100 : null
    const jr = jrPop > 0 ? (attend['Junior Secondary'] / jrPop) * 100 : null
    const sr = srPop > 0 ? (attend['Senior Secondary'] / srPop) * 100 : null
    const combinedPop = jrPop + srPop
    const combined =
      combinedPop > 0 ? ((attend['Junior Secondary'] + attend['Senior Secondary']) / combinedPop) * 100 : null
    return {
      ECCE: ecce != null ? Math.round(ecce * 10) / 10 : undefined,
      Primary: primary != null ? Math.round(primary * 10) / 10 : undefined,
      'Junior Secondary': jr != null ? Math.round(jr * 10) / 10 : undefined,
      'Senior Secondary': sr != null ? Math.round(sr * 10) / 10 : undefined,
      'Secondary (combined)': combined != null ? Math.round(combined * 10) / 10 : undefined,
    }
  }, [seed])

  const micsSecondaryCombined = useMemo(() => {
    if (!seed) return null
    const nar = seed.mics2023.netAttendanceRateAdjusted
    const jrPop = seed.schoolAgePopulationProjection.bands['Junior Secondary (age 12-15)']?.[0] ?? 0
    const srPop = seed.schoolAgePopulationProjection.bands['Senior Secondary (age 16-19)']?.[0] ?? 0
    return weightedAvg([
      [nar['Junior Secondary'], jrPop],
      [nar['Senior Secondary'], srPop],
    ])
  }, [seed])

  const attendanceChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed || !censusAttendanceRatio) return null
    const nar = seed.mics2023.netAttendanceRateAdjusted
    const opts = baseChartOptions()
    opts.series = [
      {
        type: 'column',
        name: `MoET NER${moet.year ? ` (${moet.year})` : ''} — admin data`,
        color: PALETTE.moet,
        data: buildLevelSeries({
          ECCE: moet.stats.NER.ECCE,
          Primary: moet.stats.NER.Primary,
          'Secondary (combined)': moet.stats.NER.Secondary,
        }),
      },
      {
        type: 'column',
        name: 'Census 2020 — attendees ÷ same-age population',
        color: PALETTE.census,
        data: buildLevelSeries(censusAttendanceRatio),
      },
      {
        type: 'column',
        name: 'MICS 2023 — adjusted Net Attendance Rate',
        color: PALETTE.mics,
        data: buildLevelSeries({
          ECCE: nar['ECCE (36-59 months)'],
          Primary: nar.Primary,
          'Junior Secondary': nar['Junior Secondary'],
          'Senior Secondary': nar['Senior Secondary'],
          'Secondary (combined)': micsSecondaryCombined ?? undefined,
        }),
      },
    ]
    return opts
  }, [seed, censusAttendanceRatio, moet, micsSecondaryCombined])

  const gpiChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const gpi = seed.mics2023.genderParityIndex
    const opts = baseChartOptions()
    opts.yAxis = {
      title: { text: 'Gender Parity Index (1.0 = parity)', style: { fontSize: '13px', fontWeight: '600' } },
      gridLineDashStyle: 'Dash',
      plotLines: [{ value: 1, color: '#94a3b8', width: 1, dashStyle: 'Dash', zIndex: 3 }],
    }
    opts.tooltip = {
      ...opts.tooltip,
      formatter: function (this: any) {
        const lines: string[] = [`<b>${this.x}</b>`]
        this.points?.forEach((p: any) => {
          if (p.y == null) return
          lines.push(`<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.y}</b>`)
        })
        return lines.join('<br/>')
      },
    }
    opts.series = [
      {
        type: 'column',
        name: `MoET GPI${moet.year ? ` (${moet.year})` : ''} — admin data`,
        color: PALETTE.moet,
        data: buildLevelSeries({
          ECCE: moet.stats.GPI.ECCE,
          Primary: moet.stats.GPI.Primary,
          'Secondary (combined)': moet.stats.GPI.Secondary,
        }),
      },
      {
        type: 'column',
        name: 'MICS 2023 — attendance Gender Parity Index',
        color: PALETTE.mics,
        data: buildLevelSeries({ Primary: gpi.Primary, 'Junior Secondary': gpi['Junior Secondary'], 'Senior Secondary': gpi['Senior Secondary'] }),
      },
    ]
    return opts
  }, [seed, moet])

  const completionChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const c = seed.mics2023.completionRate
    return {
      chart: { type: 'bar', height: 260, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: ['Primary', 'Junior Secondary', 'Senior Secondary'], gridLineWidth: 0 },
      yAxis: { title: { text: 'Completion rate (%)' }, max: 100, min: 0, gridLineDashStyle: 'Dash' },
      series: [
        {
          type: 'bar',
          name: 'MICS 2023 completion rate',
          color: PALETTE.mics,
          data: [c.Primary, c['Junior Secondary'], c['Senior Secondary']],
          dataLabels: { enabled: true, format: '{y}%', style: { fontSize: '12px', fontWeight: '600' } },
        },
      ],
      legend: { enabled: false },
      plotOptions: { bar: { borderWidth: 0, borderRadius: 4 } },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y}%</b>' },
    }
  }, [seed])

  const eceChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const ece = seed.mics2023.eceAttendanceRate3to4
    const part = seed.mics2023.participationRatePrePrimary
    const cats = ['National', 'Male', 'Female', 'Urban', 'Rural', 'Wealth: lowest', 'Wealth: highest']
    return {
      chart: { type: 'column', height: 360, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: cats, gridLineWidth: 0 },
      yAxis: { title: { text: 'Percent (%)' }, max: 100, min: 0, gridLineDashStyle: 'Dash' },
      series: [
        {
          type: 'column',
          name: 'ECE attendance rate (age 3–4)',
          color: PALETTE.mics,
          data: [ece.National, ece.Male, ece.Female, ece.Urban, ece.Rural, ece.WealthLowest, ece.WealthHighest],
        },
        {
          type: 'column',
          name: 'Participation, 1yr before primary entry',
          color: PALETTE.census,
          data: [part.National, part.Male, part.Female, part.Urban, part.Rural, part.WealthLowest, part.WealthHighest],
        },
      ],
      legend: { enabled: true, itemStyle: { fontSize: '12px', fontWeight: '500' } },
      plotOptions: { column: { borderWidth: 0, borderRadius: 4 } },
      credits: { enabled: false },
      tooltip: { shared: true, valueSuffix: '%' },
    }
  }, [seed])

  const sortedPyramidYears = useMemo(() => [...pyramidYears].sort((a, b) => Number(a) - Number(b)), [pyramidYears])

  /** Aggregates single ages into standard 5-year demographic bands (0-4, 5-9, ..., 80-84, 85+); one bar-pair per selected year, shaded lightest-to-darkest by year order */
  const pyramidOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed || sortedPyramidYears.length === 0) return null
    const { years, ages, male, female } = seed.singleAgePopulationProjection

    // Built oldest-to-youngest: Highcharts bar charts render array index 0 at the top,
    // so listing '85+' first and '0-4' last puts 0-4 at the bottom, matching the usual pyramid shape.
    const bandLabels: string[] = ['85+']
    for (let start = 80; start >= 0; start -= 5) bandLabels.push(`${start}-${start + 4}`)

    const bandFor = (arr: number[][], yearIdx: number): number[] => {
      const plusIdx = ages.length - 1
      const out: number[] = [arr[plusIdx]?.[yearIdx] ?? 0]
      for (let start = 80; start >= 0; start -= 5) {
        let sum = 0
        for (let a = start; a <= start + 4; a++) sum += arr[a]?.[yearIdx] ?? 0
        out.push(sum)
      }
      return out
    }

    const blues = shadeScale(228, 75, sortedPyramidYears.length)
    const pinks = shadeScale(330, 80, sortedPyramidYears.length)

    const series: Highcharts.SeriesBarOptions[] = []
    let maxAbs = 0
    sortedPyramidYears.forEach((yr, i) => {
      const yearIdx = years.findIndex((y) => String(y) === yr)
      if (yearIdx < 0) return
      const maleData = bandFor(male, yearIdx).map((v) => -v)
      const femaleData = bandFor(female, yearIdx)
      maxAbs = Math.max(maxAbs, ...maleData.map(Math.abs), ...femaleData)
      series.push({ type: 'bar', name: `${yr} — Male`, color: blues[i], data: maleData })
      series.push({ type: 'bar', name: `${yr} — Female`, color: pinks[i], data: femaleData })
    })

    return {
      chart: { type: 'bar', height: 620, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: bandLabels, title: { text: 'Age' }, gridLineWidth: 0, labels: { style: { fontSize: '11px' } } },
      yAxis: {
        title: { text: 'Population' },
        min: -maxAbs * 1.05,
        max: maxAbs * 1.05,
        gridLineDashStyle: 'Dash',
        labels: { formatter: function (this: any) { return Math.abs(this.value).toLocaleString() } },
      },
      plotOptions: { series: { stacking: undefined, borderWidth: 0, borderRadius: 2, groupPadding: 0.08, pointPadding: 0.03 } },
      series,
      legend: { enabled: true, itemStyle: { fontSize: '11px', fontWeight: '500' } },
      credits: { enabled: false },
      tooltip: {
        formatter: function (this: any) {
          return `<b>${this.series.name}, age ${this.point.category}</b><br/>${Math.abs(this.point.y).toLocaleString()} people`
        },
      },
    }
  }, [seed, sortedPyramidYears])

  const singleAgeHeatmapOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const { years, ages, male, female } = seed.singleAgePopulationProjection
    const valueFor = (ageIdx: number, yearIdx: number): number => {
      const m = male[ageIdx][yearIdx] ?? 0
      const f = female[ageIdx][yearIdx] ?? 0
      if (heatmapSex === 'male') return m
      if (heatmapSex === 'female') return f
      return m + f
    }
    const data: [number, number, number][] = []
    let max = 0
    ages.forEach((_, ageIdx) => {
      years.forEach((_, yearIdx) => {
        const v = valueFor(ageIdx, yearIdx)
        if (v > max) max = v
        data.push([yearIdx, ageIdx, v])
      })
    })
    const seriesLabel = heatmapSex === 'both' ? 'Projected population (both sexes)' : heatmapSex === 'male' ? 'Projected male population' : 'Projected female population'
    return {
      chart: { type: 'heatmap', height: 900, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: years.map(String), title: { text: 'Year' }, gridLineWidth: 0 },
      yAxis: {
        categories: ages,
        title: { text: 'Age' },
        tickInterval: 5,
        gridLineWidth: 0,
      },
      colorAxis: {
        min: 0,
        max,
        stops: [
          [0, '#f0f9ff'],
          [0.5, PALETTE.census],
          [1, '#0f4c46'],
        ],
      },
      legend: { align: 'right', layout: 'vertical', verticalAlign: 'middle', title: { text: 'Population' } },
      series: [
        {
          type: 'heatmap',
          name: seriesLabel,
          data,
          borderWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.7)',
        },
      ],
      credits: { enabled: false },
      tooltip: {
        formatter: function (this: any) {
          return `<b>Age ${ages[this.point.y]}, ${years[this.point.x]}</b><br/>${this.point.value.toLocaleString()} people`
        },
      },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 600 },
            chartOptions: {
              legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal', title: { text: undefined } },
            },
          },
        ],
      },
    }
  }, [seed, heatmapSex])

  const attainmentByProvinceOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const provinces = ['Torba', 'Sanma', 'Penama', 'Malampa', 'Shefa', 'Tafea']
    const postSecondaryShare = provinces.map((p) => {
      const row = seed.census2020.attainment15Plus[p]
      if (!row || !row.Total) return 0
      const postSec =
        (row['Post Secondary'] ?? 0) +
        (row['Bachelor Degree'] ?? 0) +
        (row['Post Graduate Certificate'] ?? 0) +
        (row['Post Graduate Diploma'] ?? 0) +
        (row['Masters'] ?? 0) +
        (row['Doctorate'] ?? 0)
      return Math.round((postSec / row.Total) * 1000) / 10
    })
    return {
      chart: { type: 'column', height: 340, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: provinces, gridLineWidth: 0 },
      yAxis: { title: { text: 'Share of adults (15+) with post-secondary education (%)' }, min: 0, gridLineDashStyle: 'Dash' },
      series: [{ type: 'column', name: 'Post-secondary+ share', color: PALETTE.census, data: postSecondaryShare, borderRadius: 4 }],
      legend: { enabled: false },
      plotOptions: { column: { borderWidth: 0 } },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y}%</b> of adults 15+ have post-secondary education' },
    }
  }, [seed])

  const lfsChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const rows = seed.lfs2024.attainmentVsParticipationRatePercent
    const levels = Object.keys(rows)
    return {
      chart: { type: 'column', height: 380, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: levels, labels: { style: { fontSize: '11px' } }, gridLineWidth: 0 },
      yAxis: { title: { text: 'Labour force participation rate (%)' }, min: 0, max: 100, gridLineDashStyle: 'Dash' },
      series: [
        { type: 'column', name: 'Male', color: PALETTE.moet, data: levels.map((l) => rows[l].Male) },
        { type: 'column', name: 'Female', color: PALETTE.mics, data: levels.map((l) => rows[l].Female) },
      ],
      legend: { enabled: true, itemStyle: { fontSize: '12px', fontWeight: '500' } },
      plotOptions: { column: { borderWidth: 0, borderRadius: 4 } },
      credits: { enabled: false },
      tooltip: { shared: true, valueSuffix: '%' },
    }
  }, [seed])

  const populationChartOptions: Highcharts.Options | null = useMemo(() => {
    if (!seed) return null
    const { years, bands } = seed.schoolAgePopulationProjection
    const bandNames = Object.keys(bands)
    const colors = [PALETTE.lfs, PALETTE.moet, PALETTE.census, '#f59e0b', PALETTE.mics]
    return {
      chart: { type: 'area', height: 400, backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
      xAxis: { categories: years.map(String), gridLineWidth: 0 },
      yAxis: { title: { text: 'Projected population' }, gridLineDashStyle: 'Dash' },
      plotOptions: { area: { stacking: 'normal', marker: { enabled: false }, lineWidth: 1 } },
      series: bandNames.map((name, i) => ({
        type: 'area',
        name,
        color: colors[i % colors.length],
        data: bands[name],
      })),
      legend: { enabled: true, itemStyle: { fontSize: '11px', fontWeight: '500' } },
      credits: { enabled: false },
      tooltip: { shared: true },
    }
  }, [seed])

  if (loadError) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-red-700">{loadError}</p>
        </CardContent>
      </Card>
    )
  }

  if (!seed) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-10 animate-spin rounded-full border-2 border-[#4B6DEB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm" data-tour="censusmics-intro">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Compares MoET administrative data (school-reported enrolment/attendance) against two independent
          household-based sources: the <strong className="text-foreground">2020 Population &amp; Housing Census</strong> and
          the <strong className="text-foreground">2023 Multiple Indicator Cluster Survey (MICS)</strong>, plus attainment
          data from the <strong className="text-foreground">2024 Labour Force Survey</strong>. These count different
          things — MoET counts who a school reports as attending; Census and MICS count who a household reports as
          attending, including children never captured by any school register. Expect the numbers to disagree; that
          gap is itself the finding.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" aria-hidden />
          <span>Sources: {seed.census2020.sourceLabel} · {seed.mics2023.sourceLabel} · {seed.lfs2024.sourceLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="censusmics-kpis">
        <CollapsibleKPICard
          title="Jr. Secondary NAR (MICS)"
          value={`${seed.mics2023.netAttendanceRateAdjusted['Junior Secondary']}%`}
          description="Adjusted net attendance rate, household survey"
          color={PALETTE.mics}
        />
        <CollapsibleKPICard
          title="Sr. Secondary GPI (MICS)"
          value={seed.mics2023.genderParityIndex['Senior Secondary'].toFixed(2)}
          description="Girls attend at much higher rates than boys"
          color={PALETTE.mics}
        />
        <CollapsibleKPICard
          title="Primary completion (MICS)"
          value={`${seed.mics2023.completionRate.Primary}%`}
          description="Falls to 45% by junior secondary"
          color={PALETTE.mics}
        />
        <CollapsibleKPICard
          title="Wealth parity, Primary (MICS)"
          value={seed.mics2023.wealthParityIndex.Primary.toFixed(2)}
          description="Lowest ÷ highest wealth quintile attendance"
          color={PALETTE.census}
        />
      </div>

      <div data-tour="censusmics-attendance">
        <CollapsibleChart
          title="Attendance: MoET vs Census vs MICS"
          description="Same-age school participation, three ways. MoET only publishes one combined 'Secondary' figure; Census and MICS split Junior and Senior Secondary."
          icon={<Landmark className="size-5 text-[#4B6DEB]" />}
        >
          {attendanceChartOptions && <HighchartsReact highcharts={Highcharts} options={attendanceChartOptions} immutable />}
        </CollapsibleChart>
      </div>

      <div data-tour="censusmics-equity">
        <MasonryGrid columns={{ xs: 1, lg: 2 }}>
          <CollapsibleChart
            title="Gender Parity Index — MoET vs MICS"
            description="1.0 = parity. MICS shows disparity widening in girls' favour at higher levels; MoET's combined Secondary figure hides that split."
            icon={<Users2 className="size-5 text-[#7C3AED]" />}
          >
            {gpiChartOptions && <HighchartsReact highcharts={Highcharts} options={gpiChartOptions} immutable />}
          </CollapsibleChart>
          <CollapsibleChart
            title="Completion rates (MICS 2023)"
            description="Share of children who complete each level, regardless of age. Not available from MoET admin data — this is unique to the household survey."
            icon={<ClipboardList className="size-5 text-[#7C3AED]" />}
          >
            {completionChartOptions && <HighchartsReact highcharts={Highcharts} options={completionChartOptions} immutable />}
          </CollapsibleChart>
        </MasonryGrid>
      </div>

      <div data-tour="censusmics-ece">
        <CollapsibleChart
          title="Early childhood & pre-primary participation (MICS 2023)"
          description="Attendance at age 3–4, and participation in learning one year before official primary entry age — by sex, area, and household wealth quintile. No MoET equivalent breakdown exists."
          icon={<Baby className="size-5 text-[#7C3AED]" />}
        >
          {eceChartOptions && <HighchartsReact highcharts={Highcharts} options={eceChartOptions} immutable />}
        </CollapsibleChart>
      </div>

      <div data-tour="censusmics-attainment">
        <MasonryGrid columns={{ xs: 1, lg: 2 }}>
          <CollapsibleChart
            title="Adult educational attainment by province (Census 2020)"
            description="Share of the population aged 15+ whose highest completed qualification is post-secondary or higher."
            icon={<TrendingUp className="size-5 text-[#6DEBB9]" />}
          >
            {attainmentByProvinceOptions && <HighchartsReact highcharts={Highcharts} options={attainmentByProvinceOptions} immutable />}
          </CollapsibleChart>
          <CollapsibleChart
            title="Education vs labour force participation (LFS 2024)"
            description="Labour force participation rate by highest education level attained, by sex. Higher attainment tracks with higher participation, especially for women."
            icon={<TrendingUp className="size-5 text-[#3D6D70]" />}
          >
            {lfsChartOptions && <HighchartsReact highcharts={Highcharts} options={lfsChartOptions} immutable />}
          </CollapsibleChart>
        </MasonryGrid>
      </div>

      <div data-tour="censusmics-population">
        <CollapsibleChart
          title="School-age population projection, 2020–2030"
          description="Census-based projection of Vanuatu's school-age population by level. Useful as an independent denominator for NER/GER, separate from whatever population estimate MoET reports use."
          icon={<Landmark className="size-5 text-[#4B6DEB]" />}
        >
          {populationChartOptions && <HighchartsReact highcharts={Highcharts} options={populationChartOptions} immutable />}
        </CollapsibleChart>
      </div>

      <div data-tour="censusmics-single-age">
        <CollapsibleChart
          title="Population pyramid, single years of age (Census 2020)"
          description="Age structure by sex, in 5-year bands built from single-age Census data. Select multiple years to compare the trend directly — each year gets its own shade, lightest for the earliest year selected and darkest for the latest."
          icon={<Users2 className="size-5 text-[#4B6DEB]" />}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Years</span>
            {seed.singleAgePopulationProjection.years.map((y) => {
              const val = String(y)
              const checked = pyramidYears.includes(val)
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() =>
                    setPyramidYears((prev) => (checked ? prev.filter((p) => p !== val) : [...prev, val]))
                  }
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    checked
                      ? 'border-[#4B6DEB] bg-[#4B6DEB]/10 text-[#4B6DEB]'
                      : 'border-border/60 text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  {y}
                </button>
              )
            })}
          </div>
          {sortedPyramidYears.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Select at least one year.</p>
          )}
          {pyramidOptions && <HighchartsReact highcharts={Highcharts} options={pyramidOptions} immutable />}
        </CollapsibleChart>

        <div className="mt-6">
          <CollapsibleChart
            title="Every single age at once (Census 2020)"
            description="Age (0–85+) by year, coloured by projected population. Read a row for one age's trend across years, or watch the darker band shift upward over time as a cohort ages."
            icon={<Users2 className="size-5 text-[#6DEBB9]" />}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Sex</span>
              {(['both', 'male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHeatmapSex(s)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                    heatmapSex === s
                      ? 'border-[#4B6DEB] bg-[#4B6DEB]/10 text-[#4B6DEB]'
                      : 'border-border/60 text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {singleAgeHeatmapOptions && <HighchartsReact highcharts={Highcharts} options={singleAgeHeatmapOptions} immutable />}
          </CollapsibleChart>
        </div>
      </div>
    </div>
  )
}
