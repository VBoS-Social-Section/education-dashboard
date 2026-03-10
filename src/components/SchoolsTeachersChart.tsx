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

export const SchoolsTeachersChart = memo(function SchoolsTeachersChart({ data, selectedYears, getValue }: Props) {
  const institutions = sortInstitutionsByOrder([
    ...new Set([
      ...data.filter((r) => r.Metric === 'Schools').map((r) => r.Court),
      ...data.filter((r) => r.Metric === 'Teachers').map((r) => r.Court),
    ]),
  ]).filter((i) => i !== 'Total')

  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const series: Highcharts.SeriesColumnOptions[] = [
    ...institutions.map((inst) => ({
      name: `${inst} Schools`,
      type: 'column' as const,
      data: sortedYears.map((year) => getValue(inst, 'Schools', year) ?? 0),
      color: getInstitutionColor(inst),
    })),
    ...institutions.map((inst) => ({
      name: `${inst} Teachers`,
      type: 'column' as const,
      data: sortedYears.map((year) => getValue(inst, 'Teachers', year) ?? 0),
      color: getInstitutionColor(inst),
    })),
  ]

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 400 },
    xAxis: {
      categories: sortedYears.map(String),
      title: { text: 'Year' },
      crosshair: true,
    },
    yAxis: { title: { text: 'Count' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, grouping: true } },
    series,
    legend: { enabled: true },
    tooltip: { shared: true },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schools & Teachers by Level and Year</CardTitle>
      </CardHeader>
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
      </CardContent>
    </Card>
  )
})
