import { memo, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { NaCell } from '@/components/NaCell'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, getCourtShortLabel, sortCourtsByOrder } from '@/lib/court-colors'
import type { StatRow } from '../types'

interface ReservedRow {
  court: string
  year: number
  name: string
  ReservedJudgments: number | null
}

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const ReservedJudgmentsChart = memo(function ReservedJudgmentsChart({ data, selectedYears, getValue }: Props) {
  const courts = sortCourtsByOrder([...new Set(data.filter((r) => r.Metric === 'ReservedJudgments').map((r) => r.Court))])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const tableData = useMemo(
    () =>
      courts.flatMap((court) =>
        sortedYears.map((year) => {
          const v = getValue(court, 'ReservedJudgments', year)
          return { court, year, name: `${court} ${year}`, ReservedJudgments: v }
        })
      ),
    [courts, sortedYears, getValue]
  )

  const columns = useMemo<ColumnDef<ReservedRow>[]>(
    () => [
      {
        accessorKey: 'court',
        header: 'Court',
        cell: ({ getValue }) => {
          const court = getValue() as string
          return (
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getCourtColor(court) }}
                aria-hidden
              />
              {court}
            </span>
          )
        },
      },
      { accessorKey: 'year', header: 'Year', meta: { className: 'text-right' }, cell: ({ getValue }) => <span className="block text-right">{getValue()}</span> },
      { accessorKey: 'ReservedJudgments', header: 'Reserved', meta: { className: 'text-right' }, cell: ({ getValue }) => <NaCell value={getValue() as number | null} /> },
    ],
    []
  )

  if (tableData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reserved Judgments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No reserved judgments data for selected years.</p>
        </CardContent>
      </Card>
    )
  }

  const series = courts.map((court) => ({
    name: getCourtShortLabel(court),
    type: 'column' as const,
    data: tableData.map((r) => (r.court === court ? (r.ReservedJudgments ?? null) : null)),
    color: getCourtColor(court),
    court,
  }))
  const options: Highcharts.Options = {
    chart: { type: 'column', height: 300 },
    xAxis: {
      categories: tableData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { title: { text: 'Reserved judgments (cases)' }, gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: {
      shared: false,
      valueSuffix: ' cases',
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const court = (this.series.options as { court?: string }).court ?? this.series.name
        const val = this.y != null ? `${this.y} cases` : '—'
        return `<span style="color:${this.color}">●</span> ${court}: ${val}`
      },
    },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Reserved Judgments by Court</CardTitle>
          <CourtColorLegend courts={courts} />
          <p className="text-sm text-muted-foreground">Cases awaiting judgment. Lower is better.</p>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={tableData}
          columns={columns}
          pageSize={5}
          getRowId={(row) => `${row.court}-${row.year}`}
        />
        <div className="mt-4 h-[300px]">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})
