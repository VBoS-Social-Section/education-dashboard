import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { getInstitutionColor } from '@/lib/education-colors'

const LEVEL_KEYS = ['ECCE', 'Primary', 'Junior Secondary', 'Senior Secondary'] as const
const LEVEL_COLORS = LEVEL_KEYS.map((l) => getInstitutionColor(l === 'Junior Secondary' ? 'Secondary' : l))

const CHART_DEFAULTS: Partial<Highcharts.Options> = {
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'Inter, system-ui, sans-serif' },
  },
  title: { style: { fontSize: '16px', fontWeight: '600', color: '#262E3B' } },
  subtitle: { style: { fontSize: '13px', color: '#3E4050' } },
  xAxis: {
    labels: { style: { fontSize: '12px', color: '#3E4050' } },
    lineColor: '#e2e8f0',
    tickColor: '#e2e8f0',
  },
  yAxis: {
    title: { style: { fontSize: '12px', color: '#3E4050' } },
    labels: { style: { fontSize: '12px', color: '#3E4050' } },
    gridLineColor: '#f1f5f9',
    gridLineDashStyle: 'Solid',
  },
  legend: {
    itemStyle: { fontSize: '12px', fontWeight: '500' },
    itemHoverStyle: { color: '#4B6DEB' },
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    shadow: true,
    style: { fontSize: '12px' },
  },
}

/** Stacked bar chart: categories on x-axis, levels stacked */
interface Sdg4StackedBarProps {
  title: string
  description?: string
  categories: string[]
  dataByLevel: Record<string, number[]>
  className?: string
}

export function Sdg4StackedBarChart({ title, description, categories, dataByLevel, className = '' }: Sdg4StackedBarProps) {
  const series = LEVEL_KEYS.map((level, i) => ({
    name: level,
    type: 'column' as const,
    data: dataByLevel[level] ?? categories.map(() => 0),
    color: LEVEL_COLORS[i],
    stacking: 'normal' as const,
    borderWidth: 0,
    borderRadius: 4,
  })).filter((s) => s.data.some((v) => v > 0))

  const options: Highcharts.Options = {
    ...CHART_DEFAULTS,
    chart: { ...CHART_DEFAULTS.chart, type: 'column', height: 340 },
    title: { ...CHART_DEFAULTS.title, text: title },
    subtitle: description ? { ...CHART_DEFAULTS.subtitle, text: description } : undefined,
    xAxis: { ...CHART_DEFAULTS.xAxis, categories, crosshair: true },
    yAxis: {
      ...CHART_DEFAULTS.yAxis,
      title: { text: 'Enrolment' },
      labels: {
        ...CHART_DEFAULTS.yAxis?.labels,
        formatter: function () { return (this.value as number) >= 1000 ? `${(this.value as number) / 1000}k` : String(this.value) },
      },
      min: 0,
    },
    plotOptions: {
      column: { borderWidth: 0, borderRadius: 4, dataLabels: { enabled: false } },
    },
    series,
    legend: { enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    tooltip: {
      shared: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const pts = this.points ?? []
        const total = pts.reduce((s, p) => s + ((p.y as number) ?? 0), 0)
        let html = `<b>${this.x}</b><br/>`
        pts.forEach((p) => {
          html += `<span style="color:${p.color}">●</span> ${p.series.name}: ${(p.y ?? 0).toLocaleString()}<br/>`
        })
        html += `<b>Total: ${total.toLocaleString()}</b>`
        return html
      },
    },
    credits: { enabled: false },
  }

  return (
    <div className={`rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

/** Bar chart for single province/entity by level */
interface Sdg4BarByLevelProps {
  title: string
  levels: string[]
  values: number[]
  colors?: string[]
  className?: string
}

export function Sdg4BarByLevelChart({ title, levels, values, colors, className = '' }: Sdg4BarByLevelProps) {
  const seriesData = levels.map((name, i) => ({
    name,
    y: values[i] ?? 0,
    color: colors?.[i] ?? getInstitutionColor(name === 'Junior Secondary' ? 'Secondary' : name),
  })).filter((d) => d.y > 0)

  const options: Highcharts.Options = {
    ...CHART_DEFAULTS,
    chart: { ...CHART_DEFAULTS.chart, type: 'bar', height: 280 },
    title: { ...CHART_DEFAULTS.title, text: title },
    xAxis: { ...CHART_DEFAULTS.xAxis, categories: seriesData.map((d) => d.name) },
    yAxis: {
      ...CHART_DEFAULTS.yAxis,
      title: { text: 'Enrolment' },
      min: 0,
    },
    plotOptions: {
      bar: { borderWidth: 0, borderRadius: 4, dataLabels: { enabled: true, format: '{y:,.0f}' } },
    },
    series: [{ type: 'bar', name: 'Enrolment', data: seriesData.map((d) => ({ ...d, color: d.color })), colorByPoint: true }],
    legend: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:,.0f}</b>' },
    credits: { enabled: false },
  }

  return (
    <div className={`rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

/** Pie chart for Rural vs Urban (or similar 2-category split) */
interface Sdg4PieProps {
  title: string
  data: { name: string; y: number; color?: string }[]
  className?: string
}

export function Sdg4PieChart({ title, data, className = '' }: Sdg4PieProps) {
  const options: Highcharts.Options = {
    ...CHART_DEFAULTS,
    chart: { ...CHART_DEFAULTS.chart, type: 'pie', height: 300 },
    title: { ...CHART_DEFAULTS.title, text: title },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f}%',
          style: { fontSize: '12px', fontWeight: '500' },
        },
        showInLegend: true,
        borderWidth: 2,
        borderColor: '#fff',
      },
    },
    series: [{ type: 'pie', name: 'Enrolment', data }],
    tooltip: { pointFormat: '<b>{point.y:,.0f}</b> ({point.percentage:.1f}%)' },
    credits: { enabled: false },
  }

  return (
    <div className={`rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

/** Stacked bar for GER or NER by province and level */
interface Sdg4GerNerStackedProps {
  title: string
  provinces: string[]
  dataByLevel: Record<string, number[]>
  levels: readonly string[]
  className?: string
}

export function Sdg4GerNerStackedChart({ title, provinces, dataByLevel, levels, className = '' }: Sdg4GerNerStackedProps) {
  const series = levels.map((level, i) => ({
    name: level,
    type: 'column' as const,
    data: provinces.map((_, j) => dataByLevel[level]?.[j] ?? 0),
    color: LEVEL_COLORS[i],
    stacking: 'normal' as const,
    borderWidth: 0,
    borderRadius: 4,
  })).filter((s) => s.data.some((v) => v > 0))

  const options: Highcharts.Options = {
    ...CHART_DEFAULTS,
    chart: { ...CHART_DEFAULTS.chart, type: 'column', height: 340 },
    title: { ...CHART_DEFAULTS.title, text: title },
    xAxis: { ...CHART_DEFAULTS.xAxis, categories: provinces, crosshair: true },
    yAxis: {
      title: { text: 'Rate (%)' },
      min: 0,
      max: 150,
      gridLineDashStyle: 'Dot',
      labels: { format: '{value}%' },
    },
    plotOptions: {
      column: { borderWidth: 0, borderRadius: 4, stacking: 'normal', dataLabels: { enabled: false } },
    },
    series,
    legend: { enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    tooltip: { shared: true, valueSuffix: '%' },
    credits: { enabled: false },
  }

  return (
    <div className={`rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

/** Bar chart for GER/NER by level (single province) */
interface Sdg4GerNerSingleProps {
  title: string
  province: string
  levels: readonly string[]
  gerValues: number[]
  nerValues: number[]
  className?: string
}

export function Sdg4GerNerSingleChart({ title, province, levels, gerValues, nerValues, className = '' }: Sdg4GerNerSingleProps) {
  const series = [
    { name: 'GER', type: 'column' as const, data: gerValues, color: '#4B6DEB', borderWidth: 0, borderRadius: 4 },
    { name: 'NER', type: 'column' as const, data: nerValues, color: '#6DEBB9', borderWidth: 0, borderRadius: 4 },
  ]

  const options: Highcharts.Options = {
    ...CHART_DEFAULTS,
    chart: { ...CHART_DEFAULTS.chart, type: 'column', height: 320 },
    title: { ...CHART_DEFAULTS.title, text: title },
    xAxis: { categories: levels, crosshair: true },
    yAxis: {
      title: { text: 'Rate (%)' },
      min: 0,
      max: 130,
      gridLineDashStyle: 'Dot',
      labels: { format: '{value}%' },
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        borderRadius: 4,
        grouping: true,
        pointPadding: 0.2,
        groupPadding: 0.2,
      },
    },
    series,
    legend: { enabled: true },
    tooltip: { valueSuffix: '%' },
    credits: { enabled: false },
  }

  return (
    <div className={`rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}
