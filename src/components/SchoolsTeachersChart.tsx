import { memo } from 'react'
import { EnhancedBarChart } from './EnhancedBarChart'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
}

export const SchoolsTeachersChart = memo(function SchoolsTeachersChart({ data, selectedYears, getValue }: Props) {
  return (
    <EnhancedBarChart
      data={data}
      selectedYears={selectedYears}
      getValue={getValue}
      metric="Schools"
      title="Schools & Teachers by Level and Year"
      description="Number of schools and teachers across ECCE, Primary, and Secondary. Each level shows grouped bars. The student-teacher ratio can be inferred by comparing enrolment with teacher counts."
    />
  )
})
