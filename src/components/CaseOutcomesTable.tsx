import { memo, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { NaCell } from '@/components/NaCell'
import type { StatRow } from '../types'

interface OutcomeRow {
  court: string
  year: string
  metric: string
  value: string | number
}

interface Props {
  getRowsByMetric: (metric: string) => (StatRow & { valueNum: number | null })[]
  selectedYears: number[]
}

const OUTCOME_METRICS = [
  'Criminal_Guilty', 'Criminal_NotGuilty', 'Criminal_Withdrawn', 'Criminal_Dismissed',
  'Civil_Guilty', 'Civil_NotGuilty', 'Civil_Withdrawn', 'Civil_Committed', 'Civil_Dismissed',
  'PI_Guilty', 'PI_NotGuilty', 'PI_Withdrawn', 'PI_Committed', 'PI_Dismissed',
] as const

const BAR_COLORS: Record<string, string> = {
  Criminal_Guilty: '#422AFB', Criminal_NotGuilty: '#7551ff', Criminal_Withdrawn: '#6B7FFF', Criminal_Dismissed: '#4318FF',
  Civil_Guilty: '#7c3aed', Civil_NotGuilty: '#6366f1', Civil_Withdrawn: '#4f46e5', Civil_Committed: '#2563eb', Civil_Dismissed: '#4338ca',
  PI_Guilty: '#6366f1', PI_NotGuilty: '#2563eb', PI_Withdrawn: '#0284c7', PI_Committed: '#0891b2', PI_Dismissed: '#0e7490',
}

const CaseOutcomesTableInner = function CaseOutcomesTable({ getRowsByMetric, selectedYears }: Props) {
  const outcomeRows = OUTCOME_METRICS.flatMap((m) => getRowsByMetric(m))
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const byCourtYearMetric = outcomeRows.reduce(
    (acc, row) => {
      acc[`${row.Court}|${row.Year}|${row.Metric}`] = row
      return acc
    },
    {} as Record<string, (StatRow & { valueNum: number | null })>
  )

  const courts = [...new Set(outcomeRows.map((r) => r.Court))]
  const chartData = courts.flatMap((court) =>
    sortedYears.flatMap((year) => {
      const metrics = OUTCOME_METRICS.filter((m) => {
        const r = byCourtYearMetric[`${court}|${year}|${m}`]
        return r?.valueNum != null
      })
      if (metrics.length === 0) return []
      const point: Record<string, string | number> = { court, year, name: `${court} ${year}` }
      metrics.forEach((m) => { point[m] = byCourtYearMetric[`${court}|${year}|${m}`]?.valueNum ?? 0 })
      return [point]
    })
  )

  const barKeys = [...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => !['court', 'year', 'name'].includes(k))))]

  const tableRows = useMemo(
    () =>
      outcomeRows.map((r) => ({
        court: r.Court,
        year: r.Year,
        metric: r.Metric,
        value: r.valueNum ?? 'N/A',
      })),
    [outcomeRows]
  )

  const columns = useMemo<ColumnDef<OutcomeRow>[]>(
    () => [
      { accessorKey: 'court', header: 'Court' },
      { accessorKey: 'year', header: 'Year', meta: { className: 'text-right' }, cell: ({ getValue }) => <span className="block text-right">{getValue()}</span> },
      { accessorKey: 'metric', header: 'Metric' },
      { accessorKey: 'value', header: 'Value (%)', meta: { className: 'text-right' }, cell: ({ getValue }) => <NaCell value={getValue() as string | number | null} suffix="%" /> },
    ],
    []
  )

  const series = barKeys.map((k) => ({
    name: k.replace('_', ' '),
    data: chartData.map((r) => (r[k] as number) ?? 0),
    type: 'column' as const,
    color: BAR_COLORS[k] ?? '#78909c',
    stack: 'outcomes',
  }))

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 350 },
    xAxis: {
      categories: chartData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { title: { text: '%' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0, stacking: 'normal' } },
    series,
    legend: { enabled: true },
    tooltip: { shared: true, valueSuffix: '%' },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Outcomes (Guilty, NotGuilty, Withdrawn, Committed, Dismissed)</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={tableRows}
          columns={columns}
          pageSize={5}
          getRowId={(row) => `${row.court}-${row.year}-${row.metric}`}
        />
        {chartData.length > 0 && barKeys.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Case Outcomes by Court and Year (%)</p>
            <div className="h-[350px]">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const CaseOutcomesTable = memo(CaseOutcomesTableInner)
