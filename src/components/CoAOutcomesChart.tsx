import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatRow } from '../types'

const COA_METRICS = [
  { key: 'CoA_Civil_Dismissed', name: 'Civil Dismissed', color: '#422AFB' },
  { key: 'CoA_Civil_Allowed', name: 'Civil Allowed', color: '#7551ff' },
  { key: 'CoA_Civil_Withdrawn', name: 'Civil Withdrawn', color: '#6B7FFF' },
  { key: 'CoA_Criminal_Dismissed', name: 'Criminal Dismissed', color: '#4318FF' },
  { key: 'CoA_Criminal_Allowed', name: 'Criminal Allowed', color: '#7c3aed' },
  { key: 'CoA_Criminal_Withdrawn', name: 'Criminal Withdrawn', color: '#6366f1' },
] as const

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const CoAOutcomesChart = memo(function CoAOutcomesChart({ data, selectedYears, getValue }: Props) {
  const court = 'Court of Appeal'
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const chartData = sortedYears.flatMap((year) => {
    const point: Record<string, string | number> = { year }
    let hasAny = false
    COA_METRICS.forEach(({ key }) => {
      const v = getValue(court, key, year)
      if (v != null) {
        point[key] = v
        hasAny = true
      }
    })
    return hasAny ? [point] : []
  })

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Court of Appeal Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No CoA outcomes data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const series = COA_METRICS.map(({ key, name, color }) => ({
    name,
    data: chartData.map((r) => (r[key] as number) ?? 0),
    type: 'column' as const,
    color,
    stack: 'coa',
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: { categories: chartData.map((r) => String(r.year)), crosshair: true },
    yAxis: { min: 0, max: 100, title: { text: 'Outcome share (%)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: { shared: true, valueSuffix: '%' },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Court of Appeal Outcomes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Civil and criminal appeal outcomes – dismissed, allowed, withdrawn (%).
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
