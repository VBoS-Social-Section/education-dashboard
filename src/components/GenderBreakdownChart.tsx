import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, getCourtColorLight, getCourtShortLabel, sortCourtsByOrder } from '@/lib/court-colors'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const GenderBreakdownChart = memo(function GenderBreakdownChart({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'Gender_Male').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const seriesData = courts.flatMap((court) =>
    sortedYears.map((year) => ({
      court, year, name: `${court} ${year}`,
      Male: getValue(court, 'Gender_Male', year) ?? 0,
      Female: getValue(court, 'Gender_Female', year) ?? 0,
    }))
  )
  const categories = seriesData.map((r) => r.name)

  const series: Highcharts.SeriesColumnOptions[] = courts.flatMap((court) => [
    {
      name: `${getCourtShortLabel(court)} Male`,
      data: seriesData.map((r) => (r.court === court ? r.Male : null)),
      type: 'column',
      color: getCourtColor(court),
      stack: 'gender',
      court,
    },
    {
      name: `${getCourtShortLabel(court)} Female`,
      data: seriesData.map((r) => (r.court === court ? r.Female : null)),
      type: 'column',
      color: getCourtColorLight(court),
      stack: 'gender',
      court,
    },
  ])

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories,
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { min: 0, max: 100, title: { text: 'Percentage (%)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: '%',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const lines: string[] = []
        const pt = this.points?.[0]
        const cat = pt?.point.category as string
        if (cat) lines.push(`<b>${cat}</b>`)
        this.points?.forEach((p) => {
          const court = (p.series.options as { court?: string }).court ?? ''
          const suffix = p.series.name?.split(' ').pop() ?? ''
          const label = court ? `${court} – ${suffix}` : p.series.name
          if (p.y != null) lines.push(`<span style="color:${p.color}">●</span> ${label}: ${p.y}%`)
        })
        return lines.join('<br/>')
      },
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Gender Breakdown by Court (%)</CardTitle>
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
})
