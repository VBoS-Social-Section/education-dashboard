import { FileText, TrendingUp, Clock, Scale, FileQuestion } from 'lucide-react'
import type { StatRow } from '../types'

interface StatCardsProps {
  data: StatRow[]
}

function parseVal(v: string): number {
  if (!v || String(v).toLowerCase() === 'na') return 0
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

export function StatCards({ data }: StatCardsProps) {
  const filings = data
    .filter((r) => r.Metric === 'Filings')
    .reduce((sum, r) => sum + parseVal(r.Value), 0)
  const disposals = data
    .filter((r) => r.Metric === 'Disposals')
    .reduce((sum, r) => sum + parseVal(r.Value), 0)
  const clearanceRows = data.filter((r) => r.Metric === 'ClearanceRate')
  const avgClearance =
    clearanceRows.length > 0
      ? clearanceRows.reduce((sum, r) => sum + parseVal(r.Value), 0) / clearanceRows.length
      : 0
  const pending = data
    .filter((r) => r.Metric === 'Pending')
    .reduce((sum, r) => sum + parseVal(r.Value), 0)
  const reserved = data
    .filter((r) => r.Metric === 'ReservedJudgments')
    .reduce((sum, r) => sum + parseVal(r.Value), 0)

  const cards = [
    { label: 'Total Filings', value: filings.toLocaleString(), icon: FileText, color: '#422AFB' },
    { label: 'Total Disposals', value: disposals.toLocaleString(), icon: TrendingUp, color: '#7551ff' },
    { label: 'Avg Clearance Rate', value: `${avgClearance.toFixed(1)}%`, icon: Scale, color: '#4318FF' },
    { label: 'Pending Cases', value: pending.toLocaleString(), icon: Clock, color: '#6B7FFF' },
    { label: 'Reserved Judgments', value: reserved.toLocaleString(), icon: FileQuestion, color: '#a78bfa' },
  ]

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${card.color}15` }}
          >
            <card.icon className="size-6" style={{ color: card.color }} strokeWidth={1.5} />
          </div>
          <div className="ml-4 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="truncate text-xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
