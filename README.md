# Vanuatu Education Dashboard

A static, client-side React dashboard for Vanuatu Ministry of Education and Training (MoET) annual report statistics. Built with **Shadcn UI**, **Tailwind CSS**, and **Highcharts**. No backend, server, or database.

## Features

- **Education level filter** – Multi-select (ECCE, Primary, Secondary, Senior Secondary, Total)
- **Year filter** – Slider to select year range (2019–2024)
- **Page-specific KPI indicators** – Four cards per data page
- **Charts** – Enrolment by level, Schools & Teachers by level
- **Methodology** – Data sources and extraction notes
- **Responsive layout** – Grid adapts to screen size
- **Mobile filter FAB** – Floating action button for filters on phones/tablets
- **PWA** – Installable on mobile and desktop; offline caching

## Dashboard Sections

| Page | Contents |
|------|----------|
| **Overview** | KPI cards (Total Enrolment, Schools, Teachers, Enrolment by Level) |
| **Enrolment** | Enrolment chart by level and year |
| **Schools & Teachers** | Schools and teachers by level and year |
| **Performance** | Student-teacher ratio and related metrics |
| **Trends** | Year-over-year trends |
| **Other Metrics** | Additional metrics |
| **Methodology** | Data sources and limitations |

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

The build process:
1. Runs `scripts/extract_education_stats.py` to extract data from MoET PDFs in `./annual report` or `./annual_reports`
2. Outputs to `public/data/*.csv` and `public/data/years.json`
3. Bundles the app with Vite

## Data Sources

Place MoET Annual Statistical Report PDFs in `./annual report` or `./annual_reports`, organized by year:

```
annual_reports/
  2019/2019 MoET Education Statistics Report_2019.pdf
  2020/2020 MoET Education Statistics Report_2020.pdf
  2021/2021 MoET STATISTICAL REPORT_2021.pdf
  2022/MoET Statistical Report_2022.pdf
  2024/MoET STATISTICAL REPORT - 2024.pdf
```

The extraction script parses Tables 1 (Enrolment), 3 (Schools), and 4 (Teachers) from each PDF. Requires `pdftotext` (poppler-utils).

## Data Format

Yearly CSVs use:

```
Court,Year,Metric,Value,Unit
ECCE,2024,Enrolment,15768,
Primary,2024,Enrolment,56104,
...
```

## Adding a New Year

1. Add the MoET PDF to `annual_reports/{year}/`
2. Run `python3 scripts/extract_education_stats.py` to regenerate CSVs
3. Build with `npm run build`
