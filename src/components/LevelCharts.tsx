import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

interface LevelBarChartProps {
  title: string
  values: number[]
  years: number[]
  color: string
  unit?: string
}

export function LevelBarChart({ title, values, years, color, unit = '' }: LevelBarChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'column', height: 240 },
    title: { text: title, style: { fontSize: '14px' } },
    xAxis: {
      categories: years.map(String),
      title: { text: 'Year' },
      crosshair: true,
    },
    yAxis: {
      title: { text: unit || 'Count' },
      gridLineDashStyle: 'Dot',
    },
    plotOptions: { column: { borderWidth: 0 } },
    series: [{ type: 'column', name: title, data: values, color }],
    legend: { enabled: false },
    tooltip: {
      valueSuffix: unit ? ` ${unit}` : '',
      valueDecimals: unit === '%' ? 1 : 0,
    },
    credits: { enabled: false },
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

interface LevelStackedChartProps {
  title: string
  maleValues: number[]
  femaleValues: number[]
  years: number[]
  color: string
}

export function LevelStackedChart({ title, maleValues, femaleValues, years, color }: LevelStackedChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'column', height: 240 },
    title: { text: title, style: { fontSize: '14px' } },
    xAxis: {
      categories: years.map(String),
      title: { text: 'Year' },
      crosshair: true,
    },
    yAxis: {
      title: { text: 'Count' },
      gridLineDashStyle: 'Dot',
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        stacking: 'normal',
      },
    },
    series: [
      { type: 'column', name: 'Male', data: maleValues, color: '#3b82f6' },
      { type: 'column', name: 'Female', data: femaleValues, color: '#ec4899' },
    ],
    legend: { enabled: true },
    tooltip: { shared: true },
    credits: { enabled: false },
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}

interface LevelPieChartProps {
  title: string
  data: { name: string; y: number; color?: string }[]
}

export function LevelPieChart({ title, data }: LevelPieChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'pie', height: 280 },
    title: { text: title, style: { fontSize: '14px' } },
    plotOptions: {
      pie: {
        dataLabels: { enabled: true, format: '{point.percentage:.1f}%' },
        showInLegend: true,
      },
    },
    series: [{ type: 'pie', name: 'Enrolment', data }],
    tooltip: {
      pointFormat: '<b>{point.y:,.0f}</b> ({point.percentage:.1f}%)',
    },
    credits: { enabled: false },
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <HighchartsReact highcharts={Highcharts} options={options} immutable />
    </div>
  )
}
