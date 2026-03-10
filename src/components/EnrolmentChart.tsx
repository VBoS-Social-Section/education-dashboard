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

  const totalByYear = sortedYears.map((y) =>
    institutions.reduce((sum, inst) => sum + (getValue(inst, 'Enrolment', y) ?? 0), 0)
  )
  const latestTotal = totalByYear[totalByYear.length - 1] ?? 0
  const latestYear = sortedYears[sortedYears.length - 1]
  const topLevel = institutions.reduce<{ inst: string; val: number } | null>((best, inst) => {
    const v = getValue(inst, 'Enrolment', latestYear) ?? 0
    return !best || v > best.val ? { inst, val: v } : best
  }, null)

  const dataDescription =
    sortedYears.length > 0
      ? `Showing enrolment for ${sortedYears.length === 1 ? sortedYears[0] : `${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`}. ` +
        `Total enrolment ${totalByYear.length > 1 ? `ranges from ${Math.min(...totalByYear).toLocaleString()} to ${Math.max(...totalByYear).toLocaleString()}` : `is ${latestTotal.toLocaleString()}`} across the selected year${sortedYears.length > 1 ? 's' : ''}. ` +
        (topLevel && topLevel.val > 0 ? `${topLevel.inst} has the highest enrolment with ${topLevel.val.toLocaleString()} students${latestYear ? ` in ${latestYear}` : ''}.` : '')
      : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolment by Level and Year</CardTitle>
        <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
          Total student enrolment by education level (ECCE, Primary, Secondary, Senior Secondary). Primary typically has the highest enrolment, followed by Secondary. ECCE captures pre-primary enrolment.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
        {dataDescription && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {dataDescription}
          </p>
        )}
      </CardContent>
    </Card>
  )
})
