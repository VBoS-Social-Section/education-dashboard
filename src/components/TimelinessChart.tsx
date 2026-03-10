import { memo } from 'react'
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

export const TimelinessChart = memo(function TimelinessChart({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'TimelinessCriminal').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const seriesData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const crim = getValue(court, 'TimelinessCriminal', year)
      const civil = getValue(court, 'TimelinessCivil', year)
      if (crim == null && civil == null) return []
      return [{ court, year, name: `${court} ${year}`, Criminal: crim ?? 0, Civil: civil ?? 0 }]
    })
  )
  const categories = seriesData.map((r) => r.name)

  const series: Highcharts.SeriesColumnOptions[] = courts.flatMap((court) => [
    {
      name: `${getCourtShortLabel(court)} Criminal`,
      data: seriesData.map((r) => (r.court === court ? r.Criminal : null)),
      type: 'column',
      color: getCourtColor(court),
      court,
    },
    {
      name: `${getCourtShortLabel(court)} Civil`,
      data: seriesData.map((r) => (r.court === court ? r.Civil : null)),
      type: 'column',
      color: getCourtColor(court),
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
    yAxis: {
      title: { text: 'Days (to disposition)' },
      gridLineDashStyle: 'Dot',
      plotLines: [
        { value: 180, color: '#422AFB', dashStyle: 'Dash', width: 2, zIndex: 5, label: { text: 'Criminal target (180d)', align: 'right', style: { fontSize: '10px' } } },
        { value: 365, color: '#7551ff', dashStyle: 'Dash', width: 2, zIndex: 5, label: { text: 'Civil target (365d)', align: 'right', style: { fontSize: '10px' } } },
      ],
    },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: ' days',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const parts = this.points?.map((p) => {
          const court = (p.series.options as { court?: string }).court ?? ''
          const type = p.series.name?.split(' ').pop() ?? ''
          return `<span style="color:${p.color}">●</span> ${court} – ${type}: ${p.y} days`
        }) ?? []
        const cat = this.points?.[0]?.point.category
        return (cat ? `<b>${cat}</b><br/>` : '') + parts.join('<br/>')
      },
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Timeliness (days) – Criminal vs Civil</CardTitle>
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
