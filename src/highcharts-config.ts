import Highcharts from 'highcharts'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/heatmap'
import 'highcharts/modules/variwide'

// Disable accessibility module warning in development
Highcharts.setOptions({
  accessibility: { enabled: false },
  title: { text: undefined },
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  },
  colors: [
    '#FF6B35', // Vanuatu red-orange
    '#0047AB', // Deep blue
    '#FFD700', // Golden yellow
    '#228B22', // Rich green
    '#2C3E50', // Deep charcoal
    '#8B4513', // Warm brown
  ],
  xAxis: {
    gridLineDashStyle: 'Dash',
    gridLineWidth: 1,
    gridLineColor: '#e2e8f0',
    lineColor: '#94a3b8',
    tickColor: '#94a3b8',
    labels: {
      style: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#475569'
      }
    },
    title: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155'
      }
    }
  },
  yAxis: {
    gridLineDashStyle: 'Dash',
    gridLineWidth: 1,
    gridLineColor: '#e2e8f0',
    lineColor: '#94a3b8',
    tickColor: '#94a3b8',
    labels: {
      style: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#475569'
      }
    },
    title: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155'
      }
    }
  },
  legend: {
    itemStyle: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#475569'
    },
    itemHoverStyle: {
      color: '#1e293b'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    shadow: true,
    style: {
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1e293b'
    }
  },
  plotOptions: {
    column: {
      borderRadius: 4,
      borderWidth: 0,
      groupPadding: 0.2,
      pointPadding: 0.1
    },
    line: {
      lineWidth: 3,
      marker: {
        enabled: true,
        radius: 4,
        symbol: 'circle',
        lineWidth: 2
      }
    }
  },
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: [
          'viewFullscreen',
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
        ],
      },
    },
  },
})
