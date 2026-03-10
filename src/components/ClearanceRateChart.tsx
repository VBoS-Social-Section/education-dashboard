import { memo, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, getCourtShortLabel, sortCourtsByOrder } from '@/lib/court-colors'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

function ClearanceRateChartInner({ data, selectedYears, getValue }: Props) {
  const courts = useMemo(
    () => sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'ClearanceRate').map((r) => r.Court))]),
    [data]
  )
  const sortedYears = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears])

  const series = useMemo(
    () =>
      courts.map((court) => ({
        name: getCourtShortLabel(court),
        type: 'line' as const,
        data: sortedYears.map((year) => getValue(court, 'ClearanceRate', year) ?? 0),
        color: getCourtColor(court),
        court,
      })),
    [courts, sortedYears, getValue]
  )

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'line', height: 400 },
      xAxis: { categories: sortedYears.map(String), crosshair: true },
      yAxis: { min: 0, max: 110, title: { text: 'Clearance rate (%)' }, gridLineDashStyle: 'Dot' },
      series,
      legend: { enabled: true },
      tooltip: {
        shared: true,
        valueSuffix: '%',
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const parts = this.points?.map((p) => {
            const court = (p.series.options as { court?: string }).court ?? p.series.name
            return `<span style="color:${p.color}">●</span> ${court}: ${p.y}%`
          }) ?? []
          return parts.join('<br/>')
        },
      },
      credits: { enabled: false },
    }),
    [sortedYears, series]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Clearance Rates by Court (%)</CardTitle>
          <CourtColorLegend courts={courts} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

export const ClearanceRateChart = memo(ClearanceRateChartInner)
