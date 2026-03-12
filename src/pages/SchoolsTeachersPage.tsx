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
        title="Schools & Teachers by Level and Year"
        description="Number of schools and teachers across ECCE, Primary, and Secondary. Each level shows grouped bars."
        icon={<School className="size-5 text-[#4B6DEB]" />}
      >
        <LazyChart enabled={lazy}>
          <SchoolsTeachersChart data={data} selectedYears={selectedYears} getValue={getValue} hideHeader />
        </LazyChart>
      </CollapsibleChart>
      
      {selectedYears.length > 1 && (
        <div className="space-y-6">
          <CollapsibleChart
            title="Schools Trends Over Time"
            description="Line chart showing the number of schools by education level across multiple years."
            icon={<TrendingUp className="size-5 text-[#4B6DEB]" />}
          >
            <LazyChart enabled={lazy}>
              <TrendChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="Schools"
                title="Schools Trends Over Time"
                description="Line chart showing the number of schools by education level across multiple years."
                hideHeader
              />
            </LazyChart>
          </CollapsibleChart>
          
          <CollapsibleChart
            title="Teachers Trends Over Time"
            description="Line chart showing teacher workforce trends by education level."
            icon={<Users className="size-5 text-[#4B6DEB]" />}
          >
            <LazyChart enabled={lazy}>
              <TrendChart
                data={data}
                selectedYears={selectedYears}
                getValue={getValue}
                metric="Teachers"
                title="Teachers Trends Over Time"
                description="Line chart showing teacher workforce trends by education level."
                hideHeader
              />
            </LazyChart>
          </CollapsibleChart>
        </div>
      )}
    </div>
  )
}
