import { memo, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, getCourtShortLabel, sortCourtsByOrder } from '@/lib/court-colors'
import { linearRegression } from '@/lib/trendline'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

function ProductivityChartInner({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'Productivity').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const series = useMemo(() => {
    const main = courts.map((court) => {
      const dataArr = sortedYears.map((year) => getValue(court, 'Productivity', year) ?? 0)
      return { court, dataArr, color: getCourtColor(court) }
    })
    const mainSeries = main.map(({ court, dataArr, color }) => ({
      name: getCourtShortLabel(court),
      type: 'line' as const,
      data: dataArr,
      color,
      court,
    }))
    const trendSeries = main.map(({ court, dataArr, color }) => ({
      name: `${getCourtShortLabel(court)} (trend)`,
      type: 'line' as const,
      data: linearRegression(dataArr),
      color,
      dashStyle: 'Dash' as const,
      lineWidth: 1.5,
      marker: { enabled: false },
    }))
    return [...mainSeries, ...trendSeries]
  }, [courts, sortedYears, getValue])

  const hasData = series.some((s) => s.data.some((v) => v > 0))
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productivity (cases per judge/magistrate)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No productivity data available for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const options: Highcharts.Options = {
    chart: { type: 'line', height: 400 },
    xAxis: { categories: sortedYears.map(String), crosshair: true },
    yAxis: { title: { text: 'Cases per judge/magistrate' }, min: 0, gridLineDashStyle: 'Dot' },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: ' cases',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        return this.points?.map((p) => {
          const court = (p.series.options as { court?: string }).court ?? p.series.name
          return `<span style="color:${p.color}">●</span> ${court}: ${p.y} cases`
        }).join('<br/>') ?? ''
      },
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Productivity (cases per judge/magistrate)</CardTitle>
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

export const ProductivityChart = memo(ProductivityChartInner)
