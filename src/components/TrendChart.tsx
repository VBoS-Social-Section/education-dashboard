import { memo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sortInstitutionsByOrder, getInstitutionColor } from '@/lib/education-colors'
import type { StatRow } from '../types'

interface Props {
  data: StatRow[]
  selectedYears: number[]
  getValue: (court: string, metric: string, year?: number) => number | null
  metric: string
  title: string
  description: string
  showPercentages?: boolean
  /** When true, omit Card header (use when parent provides the title) */
  hideHeader?: boolean
}

export const TrendChart = memo(function TrendChart({ 
  data, 
  selectedYears, 
  getValue, 
  metric, 
  title, 
  description,
  showPercentages = false,
  hideHeader = false
}: Props) {
  const institutions = sortInstitutionsByOrder([
    ...new Set(data.filter((r) => r.Metric === metric).map((r) => r.Court)),
  ])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const series: Highcharts.SeriesLineOptions[] = institutions.map((inst) => ({
    name: inst,
    type: 'line',
    data: sortedYears.map((year) => getValue(inst, metric, year) ?? 0),
    color: getInstitutionColor(inst),
    marker: {
      enabled: true,
      radius: 4,
      symbol: 'circle'
    },
    lineWidth: 3
  }))

  const options: Highcharts.Options = {
    chart: { 
      type: 'line', 
      height: 400,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    xAxis: {
      categories: sortedYears.map(String),
      title: { 
        text: 'Year',
        style: { fontSize: '14px', fontWeight: '600' }
      },
      crosshair: true,
      gridLineDashStyle: 'Dash',
      gridLineWidth: 1
    },
    yAxis: { 
      title: { 
        text: showPercentages ? 'Percentage (%)' : 'Count',
        style: { fontSize: '14px', fontWeight: '600' }
      },
      gridLineDashStyle: 'Dash',
      labels: {
        formatter: showPercentages ? function() {
          return `${this.value}%`
        } : undefined
      }
    },
    plotOptions: { 
      line: {
        dataLabels: {
          enabled: sortedYears.length <= 3,
          formatter: function() {
            const value = this.y as number
            return showPercentages ? `${value}%` : value.toLocaleString()
          },
          style: {
            fontSize: '11px',
            fontWeight: '600'
          }
        }
      }
    },
    series,
    legend: { 
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        fontSize: '12px',
        fontWeight: '500'
      }
    },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      shadow: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      formatter: function (this: any) {
        const lines: string[] = []
        const year = this.x
        lines.push(`<b>Year: ${year}</b>`)
        
        this.points?.forEach((point: any) => {
          const value = point.y as number
          const formattedValue = showPercentages ? `${value}%` : value.toLocaleString()
          const change = getChangeText(point.series, sortedYears, metric, getValue)
          lines.push(`<span style="color:${point.color}">●</span> <b>${point.series.name}:</b> ${formattedValue} ${change}`)
        })
        
        return lines.join('<br/>')
      }
    },
    credits: { enabled: false },
  }

  // Calculate trend information
  const getChangeText = (series: any, years: number[], metric: string, getValue: Function) => {
    if (years.length < 2) return ''
    
    const firstYear = years[0]
    const lastYear = years[years.length - 1]
    const firstValue = getValue(series.name, metric, firstYear) ?? 0
    const lastValue = getValue(series.name, metric, lastYear) ?? 0
    
    if (firstValue === 0) return ''
    
    const change = ((lastValue - firstValue) / firstValue) * 100
    const arrow = change >= 0 ? '📈' : '📉'
    const changeText = Math.abs(change).toFixed(1)
    
    return `${arrow} ${change >= 0 ? '+' : ''}${changeText}% from ${firstYear}`
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      {!hideHeader && (
        <CardHeader>
          <CardTitle className="font-display text-lg">{title}</CardTitle>
          <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
            {description}
          </p>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? 'pt-6' : 'space-y-4'}>
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
      </CardContent>
    </Card>
  )
})
