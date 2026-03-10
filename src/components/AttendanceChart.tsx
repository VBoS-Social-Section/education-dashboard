import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, getCourtShortLabel, sortCourtsByOrder } from '@/lib/court-colors'
import type { StatRow } from '../types'

const ATTENDANCE_METRICS = ['AttendanceCriminal', 'AttendanceCivil', 'AttendanceEnforcement'] as const

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const AttendanceChart = memo(function AttendanceChart({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => (ATTENDANCE_METRICS as readonly string[]).includes(r.Metric)).map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const seriesData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const crim = getValue(court, 'AttendanceCriminal', year)
      const civil = getValue(court, 'AttendanceCivil', year)
      const enforcement = getValue(court, 'AttendanceEnforcement', year)
      if (crim == null && civil == null && enforcement == null) return []
      return [{
        court, year, name: `${court} ${year}`,
        Criminal: crim ?? 0, Civil: civil ?? 0, Enforcement: enforcement ?? 0,
      }]
    })
  )

  if (seriesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No attendance data available for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const categories = seriesData.map((r) => r.name)
  const series = courts.flatMap((court) => [
    {
      name: `${getCourtShortLabel(court)} Criminal`,
      data: seriesData.map((r) => (r.court === court ? r.Criminal : null)),
      type: 'column' as const,
      color: getCourtColor(court),
      court,
    },
    {
      name: `${getCourtShortLabel(court)} Civil`,
      data: seriesData.map((r) => (r.court === court ? r.Civil : null)),
      type: 'column' as const,
      color: getCourtColor(court),
      court,
    },
    {
      name: `${getCourtShortLabel(court)} Enforcement`,
      data: seriesData.map((r) => (r.court === court ? r.Enforcement : null)),
      type: 'column' as const,
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
    yAxis: { title: { text: 'Attendance rate (%)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: '%',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const parts = this.points?.map((p) => {
          const court = (p.series.options as { court?: string }).court ?? ''
          const type = p.series.name?.split(' ').pop() ?? ''
          return `<span style="color:${p.color}">●</span> ${court} – ${type}: ${p.y}%`
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
          <CardTitle>Attendance Rates (%)</CardTitle>
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
