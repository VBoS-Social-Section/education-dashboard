import { memo, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { NaCell } from '@/components/NaCell'
import { CourtColorLegend } from './CourtColorLegend'
import { getCourtColor, sortCourtsByOrder } from '@/lib/court-colors'
import type { StatRow } from '../types'

interface PendingRow {
  court: string
  year: string
  pending: number | null
  pdr: number | null
}

interface Props {
  getRowsByMetric: (metric: string) => (StatRow & { valueNum: number | null })[]
  selectedYears: number[]
}

const PendingCasesTableInner = function PendingCasesTable({ getRowsByMetric, selectedYears }: Props) {
  const pendingRows = getRowsByMetric('Pending')
  const pdrRows = getRowsByMetric('PDR')

  const tableData = useMemo(() => {
    const rows = pendingRows.map((r) => ({
      court: r.Court,
      year: r.Year,
      pending: r.valueNum,
      pdr: pdrRows.find((p) => p.Court === r.Court && p.Year === r.Year)?.valueNum ?? null,
    }))
    const courtOrder = sortCourtsByOrder([...new Set(rows.map((r) => r.court))])
    const byCourt = (a: string, b: string) => courtOrder.indexOf(a) - courtOrder.indexOf(b)
    return [...rows].sort((a, b) => byCourt(a.court, b.court) || Number(a.year) - Number(b.year))
  }, [pendingRows, pdrRows])

  const chartData = tableData.map((r) => ({ ...r, name: `${r.court} ${r.year}`, Pending: r.pending ?? 0 }))
  const courts = sortCourtsByOrder([...new Set(tableData.map((r) => r.court))])
  const series = courts.map((court) => ({
    name: court,
    type: 'column' as const,
    data: chartData.map((r) => (r.court === court ? (r.pending ?? 0) : null)),
    color: getCourtColor(court),
  }))

  const columns = useMemo<ColumnDef<PendingRow>[]>(
    () => [
      {
        accessorKey: 'court',
        header: 'Court',
        meta: { className: '' },
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
      { accessorKey: 'pending', header: 'Pending', meta: { className: 'text-right' }, cell: ({ getValue }) => <NaCell value={getValue() as number | null} /> },
      { accessorKey: 'pdr', header: 'PDR', meta: { className: 'text-right' }, cell: ({ getValue }) => <NaCell value={getValue() as number | null} /> },
    ],
    []
  )

  const options: Highcharts.Options = {
    chart: { type: 'column', height: 300 },
    xAxis: {
      categories: chartData.map((r) => r.name),
      labels: { rotation: -45, style: { fontSize: '10px' } },
      crosshair: true,
    },
    yAxis: { gridLineDashStyle: 'Dot' },
    plotOptions: { column: { borderWidth: 0 } },
    series,
    legend: { enabled: true },
    tooltip: { shared: false },
    credits: { enabled: false },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Pending Cases & PDR</CardTitle>
          <CourtColorLegend courts={courts} />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={tableData}
          columns={columns}
          pageSize={5}
          getRowId={(row) => `${row.court}-${row.year}`}
        />
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Pending Cases (bar chart)</p>
          <div className="h-[300px]">
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const PendingCasesTable = memo(PendingCasesTableInner)
