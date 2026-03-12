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
  showStacked?: boolean
  showPercentages?: boolean
  /** When true, omit Card header (use when parent provides the title) */
  hideHeader?: boolean
}

export const EnhancedBarChart = memo(function EnhancedBarChart({ 
  data, 
  selectedYears, 
  getValue, 
  metric, 
  title, 
  description,
  showStacked = false,
  showPercentages = false,
  hideHeader = false
}: Props) {
  const institutions = sortInstitutionsByOrder([
    ...new Set(data.filter((r) => r.Metric === metric).map((r) => r.Court)),
  ])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  const getYAxisTitle = (metric: string, showPercentages: boolean) => {
    if (showPercentages) return 'Percentage (%)'
    
    switch (metric) {
      case 'Enrolment': return 'Number of Students'
      case 'Schools': return 'Number of Schools'
      case 'Teachers': return 'Number of Teachers'
      case 'GER': return 'Gross Enrolment Rate (%)'
      case 'NER': return 'Net Enrolment Rate (%)'
      case 'GPI': return 'Gender Parity Index'
      case 'StudentTeacherRatio': return 'Student-Teacher Ratio'
      default: return 'Count'
    }
  }

  const getContextualInfo = (metric: string, institution: string, value: number) => {
    switch (metric) {
      case 'GER':
        if (value > 100) return 'GER >100% includes repeaters and over-age students'
        if (value < 80) return 'Below universal access target'
        return 'Within acceptable range'
      
      case 'NER':
        if (value < 70) return 'Below age-appropriate enrollment target'
        if (value > 95) return 'Excellent age-appropriate participation'
        return 'Good coverage'
      
      case 'GPI':
        if (value < 0.9) return 'Gender disparity favoring males'
        if (value > 1.1) return 'Gender disparity favoring females'
        return 'Gender parity achieved'
      
      case 'StudentTeacherRatio':
        if (value > 40) return 'High ratio - may impact quality'
        if (value < 20) return 'Low ratio - good for learning'
        return 'Within recommended range'
      
      case 'Enrolment':
        if (institution === 'Primary' && value > 50000) return 'Largest education level'
        if (institution === 'ECCE' && value < 20000) return 'Growing early childhood sector'
        return ''
      
      default:
        return ''
    }
  }

  const series: Highcharts.SeriesColumnOptions[] = institutions.map((inst) => ({
    name: inst,
    type: 'column',
    data: sortedYears.map((year) => getValue(inst, metric, year) ?? 0),
    color: getInstitutionColor(inst),
    stacking: showStacked ? 'normal' : undefined,
    borderWidth: 0,
    borderRadius: 4
  }))

  const options: Highcharts.Options = {
    chart: { 
      type: 'column', 
      height: 450,
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
        text: getYAxisTitle(metric, showPercentages),
        style: { fontSize: '14px', fontWeight: '600' }
      },
      gridLineDashStyle: 'Dash',
      labels: {
        formatter: showPercentages ? function() {
          return `${this.value}%`
        } : function() {
          return this.value.toLocaleString()
        }
      },
      min: 0
    },
    plotOptions: { 
      column: { 
        borderWidth: 0,
        borderRadius: 4,
        dataLabels: {
          enabled: sortedYears.length <= 2 || institutions.length <= 2,
          formatter: function(this: any) {
            const value = this.y as number
            if (showPercentages) {
              return `${value}%`
            }
            return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString()
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      shadow: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      shared: true,
      formatter: function(this: any) {
        const lines: string[] = []
        const year = this.x
        lines.push(`<b>Year: ${sortedYears[year]}</b>`)
        
        this.points?.forEach((point: any) => {
          const value = point.y as number
          const formattedValue = showPercentages ? `${value}%` : value.toLocaleString()
          const contextInfo = getContextualInfo(metric, point.series.name, value)
          
          lines.push(`<span style="color:${point.color}">●</span> <b>${point.series.name}:</b> ${formattedValue}`)
          if (contextInfo) {
            lines.push(`<small style="color: #6b7280;">${contextInfo}</small>`)
          }
        })
        
        // Add total if not stacked
        if (!showStacked && this.points && this.points.length > 1) {
          const total = this.points.reduce((sum: number, point: any) => sum + (point.y as number), 0)
          lines.push(`<hr style="margin: 4px 0; border: none; border-top: 1px solid #e5e7eb;">`)
          lines.push(`<b>Total: ${total.toLocaleString()}</b>`)
        }
        
        return lines.join('<br/>')
      }
    },
    credits: { enabled: false },
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
