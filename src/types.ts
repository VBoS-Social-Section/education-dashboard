/**
 * Unified row format for yearly CSV files.
 * Each row: Court, Year, Metric, Value, Unit
 */
export interface StatRow {
  Court: string
  Year: string
  Metric: string
  Value: string
  Unit: string
}

/** Parsed/typed row with numeric value where applicable */
export interface ParsedStatRow extends StatRow {
  valueNum: number | null
}

/** Court metrics keys (from court_metrics.csv) */
export const COURT_METRICS = [
  'Filings',
  'Disposals',
  'ClearanceRate',
  'Pending',
  'PDR',
  'PendingAge',
  'TimelinessCriminal',
  'TimelinessCivil',
  'AttendanceCriminal',
  'AttendanceCivil',
  'AttendanceEnforcement',
  'Productivity',
  'ReservedJudgments',
] as const

/** Case outcome metric prefixes */
export const OUTCOME_PREFIXES = ['Criminal_', 'Civil_', 'PI_'] as const
