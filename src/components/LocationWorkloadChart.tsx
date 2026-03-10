import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatRow } from '../types'

const PROVINCES = ['Sanma', 'Shefa', 'Malampa', 'Tafea', 'Penama', 'Torba']
const COLORS: Record<string, string> = {
  Sanma: '#422AFB', Shefa: '#7551ff', Malampa: '#6B7FFF', Tafea: '#4318FF',
  Penama: '#7c3aed', Torba: '#6366f1',
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const LocationWorkloadChart = memo(function LocationWorkloadChart({ data, selectedYears, getValue }: Props) {
  const courts = [...new Set(data.filter((r) => r.Metric.startsWith('Location_')).map((r) => r.Court))]
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const chartData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const point: Record<string, string | number> = { court, year, name: `${court} ${year}` }
      let hasAny = false
      PROVINCES.forEach((prov) => {
        const v = getValue(court, `Location_${prov}_Filings`, year)
        if (v != null) {
          point[prov] = v
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
          <CardTitle>Workload by Province</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No location workload data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const series = PROVINCES.map((p) => ({
    name: p,
    data: chartData.map((r) => (r[p] as number) ?? 0),
    type: 'column' as const,
    color: COLORS[p],
    stack: 'location',
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories: chartData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { title: { text: 'Filings (cases)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: { shared: true, valueSuffix: ' filings' },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload by Province (Location)</CardTitle>
        <p className="text-sm text-muted-foreground">Filings by province for MC and Island Court.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
