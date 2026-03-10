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

export const FilingsDisposalsChart = memo(function FilingsDisposalsChart({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'Filings').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const byCourtYear = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const filings = getValue(court, 'Filings', year)
      const disposals = getValue(court, 'Disposals', year)
      if (filings == null && disposals == null) return []
      return [{ court, year, name: `${court} ${year}`, Filings: filings ?? 0, Disposals: disposals ?? 0 }]
    })
  )
  const categories = byCourtYear.map((r) => r.name)

  const series: Highcharts.SeriesColumnOptions[] = courts.flatMap((court) => [
    {
      name: `${getCourtShortLabel(court)} Filings`,
      type: 'column',
      data: byCourtYear.map((r) => (r.court === court ? r.Filings : null)),
      color: getCourtColor(court),
      court,
    },
    {
      name: `${getCourtShortLabel(court)} Disposals`,
      type: 'column',
      data: byCourtYear.map((r) => (r.court === court ? r.Disposals : null)),
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
    yAxis: { title: { text: 'Cases' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: ' cases',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const parts = this.points?.map((p) => {
          const court = (p.series.options as { court?: string }).court ?? ''
          const type = p.series.name?.split(' ').pop() ?? ''
          return `<span style="color:${p.color}">●</span> ${court} – ${type}: ${p.y?.toLocaleString() ?? 0} cases`
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
          <CardTitle>Filings & Disposals by Court and Year</CardTitle>
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
