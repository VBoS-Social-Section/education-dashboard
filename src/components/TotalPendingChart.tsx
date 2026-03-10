import { memo, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { linearRegression } from '@/lib/trendline'
import type { StatRow } from '../types'

function parseVal(v: string): number {
  if (!v || String(v).toLowerCase() === 'na') return 0
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
}

export const TotalPendingChart = memo(function TotalPendingChart({ data, selectedYears }: Props) {
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])
  const totalByYear = useMemo(
    () =>
      sortedYears.map((y) =>
        data
          .filter((r) => r.Metric === 'Pending' && r.Year === String(y))
          .reduce((s, r) => s + parseVal(r.Value), 0)
      ),
    [sortedYears, data]
  )

  const hasData = totalByYear.some((v) => v > 0)
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Pending Cases Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const trendData = linearRegression(totalByYear)
  const series: Highcharts.SeriesLineOptions[] = [
    {
      name: 'Total Pending',
      type: 'line',
      data: totalByYear,
      color: '#6B7FFF',
      zIndex: 2,
    },
    {
      name: 'Total Pending (trend)',
      type: 'line',
      data: trendData,
      color: '#6B7FFF',
      dashStyle: 'Dash',
      lineWidth: 1.5,
      marker: { enabled: false },
      zIndex: 1,
    },
  ]

  const options: Highcharts.Options = {
    chart: { type: 'line', height: 300 },
    xAxis: { categories: sortedYears.map(String), crosshair: true },
    yAxis: { title: { text: 'Pending cases' }, min: 0, gridLineDashStyle: 'Dot' },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: ' cases',
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Pending Cases Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">Sum of pending cases across all courts, with trend line.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
