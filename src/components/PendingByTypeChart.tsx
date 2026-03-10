import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

const PENDING_TYPES = ['Criminal', 'Civil', 'Violence', 'PI', 'Maintenance', 'Other'] as const
const COLORS: Record<string, string> = {
  Criminal: '#422AFB', Civil: '#7551ff', Violence: '#6B7FFF', PI: '#4318FF',
  Maintenance: '#7c3aed', Other: '#6366f1',
}

export const PendingByTypeChart = memo(function PendingByTypeChart({ data, selectedYears, getValue }: Props) {
  const pendingTypeMetrics = [...new Set(
    data.filter((r) => r.Metric.startsWith('Pending_') && !r.Metric.endsWith('_Pct')).map((r) => r.Metric)
  )]
  const types = [...new Set(pendingTypeMetrics.map((m) => m.replace('Pending_', '')))]

  const courts = [...new Set(data.filter((r) => r.Metric === 'Pending_Criminal').map((r) => r.Court))]
  if (courts.length === 0) {
    const anyPending = data.find((r) => r.Metric.startsWith('Pending_') && !r.Metric.endsWith('_Pct'))
    if (anyPending) courts.push(anyPending.Court)
  }
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const chartData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const point: Record<string, string | number> = { court, year, name: `${court} ${year}` }
      let hasAny = false
      types.forEach((ct) => {
        const val = getValue(court, `Pending_${ct}`, year)
        if (val != null) {
          point[ct] = val
          hasAny = true
        }
      })
      return hasAny ? [point] : []
    })
  )

  if (chartData.length === 0) return null

  const series = types.map((ct) => ({
    name: ct,
    data: chartData.map((r) => (r[ct] as number) ?? 0),
    type: 'column' as const,
    color: COLORS[ct] ?? '#78909c',
    stack: 'pending',
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories: chartData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { title: { text: 'Pending cases' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: { shared: true, valueSuffix: ' cases' },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Cases by Type</CardTitle>
        <p className="text-sm text-muted-foreground">Breakdown of pending cases by case type per court.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
