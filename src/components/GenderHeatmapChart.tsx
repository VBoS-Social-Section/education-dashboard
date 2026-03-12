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
  hideHeader?: boolean
}

export const GenderHeatmapChart = memo(function GenderHeatmapChart({ 
  data, 
  selectedYears, 
  getValue,
  hideHeader = false
}: Props) {
  const institutions = sortInstitutionsByOrder([
    ...new Set(data.filter((r) => r.Metric === 'Enrolment_Male').map((r) => r.Court)),
  ])
  const sortedYears = [...selectedYears].sort((a, b) => a - b)

  // Calculate gender percentages for heatmap
  const heatmapData: number[][] = []
  institutions.forEach((inst, i) => {
    sortedYears.forEach((year, j) => {
      const male = getValue(inst, 'Enrolment_Male', year) ?? 0
      const female = getValue(inst, 'Enrolment_Female', year) ?? 0
      const total = male + female
      
      if (total > 0) {
        const femalePercentage = (female / total) * 100
        heatmapData.push([j, i, femalePercentage])
      }
    })
  })

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
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
      }
    },
    yAxis: {
      categories: institutions,
      title: {
        text: 'Education Level',
        style: { fontSize: '14px', fontWeight: '600' }
      },
      opposite: true
    },
    colorAxis: {
      min: 0,
      max: 100,
      minColor: '#9CA5B7', // lavender for low female enrollment
      maxColor: '#4B6DEB', // vibrant blue for high female enrollment
      stops: [
        [0, '#9CA5B7'],
        [0.3, '#6DEBB9'], // mint
        [0.6, '#3D6D70'], // teal
        [1, '#4B6DEB']   // vibrant blue
      ],
      labels: {
        formatter: function() {
          return `${this.value}%`
        }
      }
    },
    series: [{
      type: 'heatmap',
      name: 'Female Enrollment %',
      data: heatmapData,
      borderWidth: 1,
      borderColor: '#ffffff',
      dataLabels: {
        enabled: true,
        formatter: function(this: any) {
          const value = this.point.value as number
          return value > 0 ? `${value.toFixed(0)}%` : ''
        },
        style: {
          fontSize: '10px',
          fontWeight: '600',
          textOutline: '1px contrast'
        }
      }
    }],
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      shadow: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      formatter: function(this: any) {
        const point = this.point
        const year = sortedYears[point.x]
        const institution = institutions[point.y]
        const femalePercentage = point.value as number
        
        const male = getValue(institution, 'Enrolment_Male', year) ?? 0
        const female = getValue(institution, 'Enrolment_Female', year) ?? 0
        const total = male + female
        
        let contextInfo = ''
        if (femalePercentage < 45) {
          contextInfo = '<br/><small style="color: #dc2626;">⚠️ Low female participation</small>'
        } else if (femalePercentage > 55) {
          contextInfo = '<br/><small style="color: #6DEBB9;">✅ Good gender balance</small>'
        }
        
        return `
          <b>${institution} - ${year}</b><br/>
          Female: ${female.toLocaleString()} (${femalePercentage.toFixed(1)}%)<br/>
          Male: ${male.toLocaleString()} (${(100 - femalePercentage).toFixed(1)}%)<br/>
          Total: ${total.toLocaleString()} students
          ${contextInfo}
        `
      }
    },
    credits: { enabled: false },
    legend: {
      align: 'right',
      layout: 'vertical',
      margin: 0,
      verticalAlign: 'middle',
      y: 25,
      symbolHeight: 280
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      {!hideHeader && (
        <CardHeader>
          <CardTitle className="font-display text-lg">Gender Distribution Heatmap</CardTitle>
          <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
            Heatmap showing female enrollment percentage by education level and year. 
            Warmer colors (blue) indicate higher female enrollment, while cooler colors (orange) indicate lower female participation.
          </p>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? 'pt-6' : 'space-y-4'}>
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9CA5B7' }}></div>
            <span>Low Female %</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFD700' }}></div>
            <span>Balanced</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4B6DEB' }}></div>
            <span>High Female %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
