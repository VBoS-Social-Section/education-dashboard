import Highcharts from 'highcharts'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'

// Disable accessibility module warning in development
Highcharts.setOptions({
  accessibility: { enabled: false },
  title: { text: null },
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
