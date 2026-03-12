import { LazyChart } from '../components/LazyChart'
import { SchoolsTeachersChart } from '../components/SchoolsTeachersChart'
import { TrendChart } from '../components/TrendChart'
import { CollapsibleChart, MasonryGrid } from '../components/CollapsibleChart'
import { School, Users, TrendingUp } from 'lucide-react'
import { MANY_YEARS_THRESHOLD } from '@/lib/constants'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  compareMode?: boolean
  getValue: (court: string, metric: string, year?: number) => number | null
}

export function SchoolsTeachersPage({ data, selectedYears, compareMode = false, getValue }: Props) {
  const lazy = selectedYears.length >= MANY_YEARS_THRESHOLD

  return (
    <div className="space-y-6">
      <CollapsibleChart
        title="Schools & Teachers Overview"
        description="Educational institutions and teaching workforce by education level"
        icon={<School className="size-5 text-teal-600" />}
        defaultOpen={true}
      >
        <LazyChart enabled={lazy}>
          <SchoolsTeachersChart data={data} selectedYears={selectedYears} getValue={getValue} />
        </LazyChart>
      </CollapsibleChart>
      
      {/* Trend analysis for multi-year data */}
      {selectedYears.length > 1 && (
        <div className="space-y-6">
          <CollapsibleChart
            title="Infrastructure Trends"
            description="Track school infrastructure development over time"
            icon={<TrendingUp className="size-5 text-teal-600" />}
          >
            <LazyChart enabled={lazy}>
              <TrendChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="Schools"
                title="Schools Trends Over Time"
                description="Line chart showing the number of schools by education level across multiple years. Track infrastructure development and expansion patterns."
              />
            </LazyChart>
          </CollapsibleChart>
          
          <CollapsibleChart
            title="Workforce Trends"
            description="Monitor teaching workforce growth and changes"
            icon={<Users className="size-5 text-teal-600" />}
          >
            <LazyChart enabled={lazy}>
              <TrendChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="Teachers"
                title="Teachers Trends Over Time"
                description="Line chart showing teacher workforce trends by education level. Monitor staffing growth and identify potential capacity gaps."
              />
            </LazyChart>
          </CollapsibleChart>
        </div>
      )}
    </div>
  )
}
