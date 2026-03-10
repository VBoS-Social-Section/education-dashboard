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

  const totalSchoolsByYear = sortedYears.map((y) =>
    institutions.reduce((sum, inst) => sum + (getValue(inst, 'Schools', y) ?? 0), 0)
  )
  const totalTeachersByYear = sortedYears.map((y) =>
    institutions.reduce((sum, inst) => sum + (getValue(inst, 'Teachers', y) ?? 0), 0)
  )
  const latestYear = sortedYears[sortedYears.length - 1]
  const latestSchools = totalSchoolsByYear[totalSchoolsByYear.length - 1] ?? 0
  const latestTeachers = totalTeachersByYear[totalTeachersByYear.length - 1] ?? 0

  const dataDescription =
    sortedYears.length > 0
      ? `Data for ${sortedYears.length === 1 ? `year ${sortedYears[0]}` : `years ${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`}. ` +
        (totalSchoolsByYear.length > 1
          ? `Schools range from ${Math.min(...totalSchoolsByYear).toLocaleString()} to ${Math.max(...totalSchoolsByYear).toLocaleString()}; teachers from ${Math.min(...totalTeachersByYear).toLocaleString()} to ${Math.max(...totalTeachersByYear).toLocaleString()}. `
          : '') +
        (latestYear ? `In ${latestYear}, there are ${latestSchools.toLocaleString()} schools and ${latestTeachers.toLocaleString()} teachers across the levels shown.` : '')
      : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schools & Teachers by Level and Year</CardTitle>
        <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
          Number of schools and teachers across ECCE, Primary, and Secondary. Each level shows grouped bars. The student-teacher ratio can be inferred by comparing enrolment with teacher counts.
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
