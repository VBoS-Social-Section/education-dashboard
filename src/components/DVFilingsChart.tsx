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

function DVFilingsChartInner({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'DV_Filings').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const series = useMemo(() => {
    const main = courts.map((court) => {
      const dataArr = sortedYears.map((year) => getValue(court, 'DV_Filings', year) ?? 0)
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

  if (courts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domestic Violence (Protection Orders) Filings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No DV filings data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const options: Highcharts.Options = {
    chart: { type: 'line', height: 400 },
    xAxis: { categories: sortedYears.map(String), crosshair: true },
    yAxis: { title: { text: 'DV filings (cases)' }, gridLineDashStyle: 'Dot' },
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
          <CardTitle>Domestic Violence (Protection Orders) Filings</CardTitle>
          <p className="text-sm text-muted-foreground">Violence/DV case filings in Magistrates Court.</p>
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

export const DVFilingsChart = memo(DVFilingsChartInner)
