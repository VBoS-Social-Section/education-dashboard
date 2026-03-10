import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sortInstitutionsByOrder, getInstitutionColor } from '@/lib/education-colors'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const EnrolmentChart = memo(function EnrolmentChart({ data, selectedYears, getValue }: Props) {
  const institutions = sortInstitutionsByOrder([
    ...new Set(data.filter((r) => r.Metric === 'Enrolment').map((r) => r.Court)),
  ])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const series: Highcharts.SeriesColumnOptions[] = institutions.map((inst) => ({
    name: inst,
    type: 'column',
    data: sortedYears.map((year) => getValue(inst, 'Enrolment', year) ?? 0),
    color: getInstitutionColor(inst),
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories: sortedYears.map(String),
      title: { text: 'Year' },
      crosshair: true,
    },
    yAxis: { title: { text: 'Enrolment' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: true,
      valueSuffix: ' students',
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolment by Level and Year</CardTitle>
      </CardHeader>
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
      </CardContent>
    </Card>
  )
})
