import { memo } from 'react'
import { EnhancedBarChart } from './EnhancedBarChart'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
  hideHeader?: boolean
}

export const EnrolmentChart = memo(function EnrolmentChart({ data, selectedYears, getValue, hideHeader }: Props) {
  return (
    <EnhancedBarChart
      data={data}
      selectedYears={selectedYears}
      getValue={getValue}
      metric="Enrolment"
      title="Enrolment by Level and Year"
      description="Total student enrolment by education level (ECCE, Primary, Secondary). Secondary combines junior and senior secondary. Primary typically has the highest enrolment. ECCE captures pre-primary enrolment."
      levelOnYAxis
      hideHeader={hideHeader}
    />
  )
})
