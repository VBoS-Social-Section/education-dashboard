import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatRow } from '../types'

const CASE_TYPES = ['Total', 'Criminal', 'Civil', 'PI', 'Maintenance', 'Violence'] as const
const COLORS: Record<string, string> = {
  Total: '#422AFB', Criminal: '#7551ff', Civil: '#6B7FFF', PI: '#4318FF',
  Maintenance: '#7c3aed', Violence: '#6366f1',
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const CaseWorkloadByTypeChart = memo(function CaseWorkloadByTypeChart({ data, selectedYears, getValue }: Props) {
  const courts = [...new Set(data.filter((r) => r.Metric.startsWith('Workload_')).map((r) => r.Court))]
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const typesWithData = CASE_TYPES.filter((ct) =>
    data.some((r) => r.Metric === `Workload_${ct}_Filings`)
  )

  const chartData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const point: Record<string, string | number> = { court, year, name: `${court} ${year}` }
      let hasAny = false
      typesWithData.forEach((ct) => {
        const filings = getValue(court, `Workload_${ct}_Filings`, year)
        if (filings != null) {
          point[ct] = filings
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
          <CardTitle>Case Workload by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No workload-by-type data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const series = typesWithData.map((ct) => ({
    name: ct,
    data: chartData.map((r) => (r[ct] as number) ?? 0),
    type: 'column' as const,
    color: COLORS[ct] ?? '#78909c',
    stack: 'workload',
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
        <CardTitle>Case Workload by Type (Filings)</CardTitle>
        <p className="text-sm text-muted-foreground">Filings by case type per court.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
