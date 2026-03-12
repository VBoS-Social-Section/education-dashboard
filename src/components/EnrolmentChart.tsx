import { memo } from 'react'
import { EnhancedBarChart } from './EnhancedBarChart'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const EnrolmentChart = memo(function EnrolmentChart({ data, selectedYears, getValue }: Props) {
  return (
    <EnhancedBarChart
      data={data}
      selectedYears={selectedYears}
      getValue={getValue}
      metric="Enrolment"
      title="Enrolment by Level and Year"
      description="Total student enrolment by education level (ECCE, Primary, Secondary, Senior Secondary). Primary typically has the highest enrolment, followed by Secondary. ECCE captures pre-primary enrolment."
    />
  )
})
