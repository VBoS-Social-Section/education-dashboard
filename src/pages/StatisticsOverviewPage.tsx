import { useMemo } from 'react'
import { CollapsibleChart } from '@/components/CollapsibleChart'
import { MasonryGrid } from '@/components/CollapsibleChart'
import { EnhancedBarChart } from '@/components/EnhancedBarChart'
import { GenderHeatmapChart } from '@/components/GenderHeatmapChart'

// Helper function to parse numeric values
const parseVal = (val: string): number => {
  const parsed = parseFloat(val.replace(/,/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

interface StatisticsOverviewProps {
  data: Array<{
    Court: string
    Year: string
    Metric: string
    Value: string
    Unit: string
  }>
  selectedYear: number
  selectedLevels: string[]
}

// All statistics indicators extracted from education reports
const STATISTICS_INDICATORS = [
  {
    category: 'Enrollment Statistics',
    metrics: ['Enrolment', 'GER', 'NER'],
    description: 'Student enrollment and participation rates'
  },
  {
    category: 'Gender Parity Indicators', 
    metrics: ['GPI', 'NER_GPI'],
    description: 'Gender parity indices across education levels'
  },
  {
    category: 'Infrastructure Statistics',
    metrics: ['Schools'],
    description: 'Educational institutions and facilities'
  },
  {
    category: 'Workforce Statistics',
    metrics: ['Teachers', 'Teachers_Male', 'Teachers_Female'],
    description: 'Teaching staff composition and distribution'
  }
] as const

export function StatisticsOverview({ data, selectedYear, selectedLevels }: StatisticsOverviewProps) {
  const yearData = useMemo(() => {
    return data.filter(row => 
      row.Year === String(selectedYear) && 
      (selectedLevels.includes(row.Court) || row.Court === 'Total')
    )
  }, [data, selectedYear, selectedLevels])

  const getValue = (court: string, metric: string): number | null => {
    const row = yearData.find(r => r.Court === court && r.Metric === metric)
    return row ? parseVal(row.Value) : null
  }

  const getMetricData = (metric: string) => {
    return yearData
      .filter(row => row.Metric === metric)
      .filter(row => selectedLevels.includes(row.Court) || row.Court === 'Total')
      .map(row => ({
        court: row.Court,
        value: parseVal(row.Value),
        unit: row.Unit
      }))
      .filter(item => item.value > 0)
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Education Statistics Overview - {selectedYear}
        </h2>
        <p className="text-muted-foreground">
          Complete statistical indicators for {selectedYear} from Vanuatu education reports
        </p>
      </div>

      {STATISTICS_INDICATORS.map((category, categoryIndex) => (
        <CollapsibleChart
          key={categoryIndex}
          title={category.category}
          description={category.description}
        >
          <div className="space-y-6">
            {category.metrics.map((metric, metricIndex) => {
              const metricData = getMetricData(metric)
              
              if (metricData.length === 0) return null

              return (
                <div key={metricIndex} className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    {metric.replace(/_/g, ' ')}
                  </h4>
                  
                  <MasonryGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
                    {metricData.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="rounded-lg border border-border/60 bg-card p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="text-center">
                          <h5 className="font-medium text-foreground mb-2">
                            {item.court}
                          </h5>
                          <div className="text-2xl font-bold text-primary mb-1">
                            {item.value.toLocaleString()}
                          </div>
                          {item.unit && (
                            <div className="text-sm text-muted-foreground">
                              {item.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </MasonryGrid>

                  {/* Show chart for metrics with multiple education levels */}
                  {metricData.length > 2 && (
                    <div className="mt-6">
                      <EnhancedBarChart
                        data={data}
                        selectedYears={[selectedYear]}
                        getValue={(court, metric, year) => {
                          const row = data.find(r => 
                            r.Court === court && 
                            r.Metric === metric && 
                            r.Year === String(year)
                          )
                          return row ? parseVal(row.Value) : null
                        }}
                        metric={metric}
                        title={`${metric.replace(/_/g, ' ')} by Education Level`}
                        description={`${metric.replace(/_/g, ' ')} breakdown across education levels for ${selectedYear}`}
                      />
                    </div>
                  )}

                  {/* Special visualization for gender-related metrics */}
                  {(metric.includes('GPI') || metric.includes('Gender')) && metricData.length > 1 && (
                    <div className="mt-6">
                      <GenderHeatmapChart
                        data={data}
                        selectedYears={[selectedYear]}
                        getValue={(court, metric, year) => {
                          const row = data.find(r => 
                            r.Court === court && 
                            r.Metric === metric && 
                            r.Year === String(year)
                          )
                          return row ? parseVal(row.Value) : null
                        }}
                        metric={metric}
                        title={`${metric.replace(/_/g, ' ')} Analysis`}
                        description={`Gender parity analysis for ${selectedYear}`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CollapsibleChart>
      ))}
    </div>
  )
}
