import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatRow } from '../types'

const METRICS = [
  { key: 'Pending_WithFutureListing', name: 'Future listing', fullName: 'With Future Listing', color: '#047857' },
  { key: 'Pending_UnderCaseMgmt', name: 'Case mgmt', fullName: 'Under Case Mgmt', color: '#7551ff' },
  { key: 'Pending_NoFutureDate', name: 'No date', fullName: 'No Future Date', color: '#ef4444' },
] as const

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const PendingListedStatusChart = memo(function PendingListedStatusChart({ data, selectedYears, getValue }: Props) {
  const courts = [...new Set(data.filter((r) => r.Metric === 'Pending_WithFutureListing').map((r) => r.Court))]
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const chartData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const point: Record<string, string | number> = { court, year, name: `${court} ${year}` }
      let hasAny = false
      METRICS.forEach(({ key }) => {
        const v = getValue(court, key, year)
        if (v != null) {
          point[key] = v
          hasAny = true
        }
      })
      return hasAny ? [point] : []
    })
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending by Listing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No listing status data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const series = METRICS.map(({ key, name, fullName, color }) => ({
    name,
    fullName,
    data: chartData.map((r) => (r[key] as number) ?? 0),
    type: 'column' as const,
    color,
    stack: 'status',
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories: chartData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { min: 0, max: 100, title: { text: 'Share (%)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (!this.points?.length) return ''
        const header = String(this.x ?? '')
        const lines = this.points.map((p) => {
          const full = (p.series.options as { fullName?: string }).fullName ?? p.series.name
          return `<span style="color:${p.color}">●</span> ${full}: ${p.y}%`
        })
        return `<b>${header}</b><br/>${lines.join('<br/>')}`
      },
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Cases by Listing Status</CardTitle>
        <p className="text-sm text-muted-foreground">
          Benchmark: 80% should have a future listing. Green = on track.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
