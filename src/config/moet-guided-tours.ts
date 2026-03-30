import type { TourStep } from '@/components/GuidedSpotlightTour'
import { MOET_SIDEBAR_TOUR_STEPS } from './moet-sidebar-tour-steps'
import { VANSTA_TOUR_STEPS } from './vansta-tour-steps'

/** Route tabs: 0–4 = MoET pages, 5 = VANSTA, 6 = Methodology */
export const VANSTA_TAB_INDEX = 5
export const METHODOLOGY_TAB_INDEX = 6

const OVERVIEW_PAGE: TourStep[] = [
  {
    targetId: 'overview-intro',
    title: 'Overview introduction',
    description:
      'This box summarises what the Overview covers: key national figures from ministry reports, aligned with SDG 4, across early childhood through secondary and tertiary where data exists.',
  },
  {
    targetId: 'overview-kpis',
    title: 'Headline totals',
    description:
      'Three quick figures for the latest selected year: total enrolment nationwide, total schools, and total teachers. They respect your sidebar filters (levels, province, etc.). Use “See Methodology” for data notes.',
  },
]

const ENROLMENT_PAGE: TourStep[] = [
  {
    targetId: 'enrolment-breakdowns-2024',
    title: '2024 enrolment breakdowns',
    description:
      'Charts here use supplementary 2024 breakdowns (by province, authority, rural/urban) when available. Stacked bars show ECCE, Primary, and Secondary—Secondary combines junior and senior secondary. Sidebar filters narrow province, authority, or location.',
  },
  {
    targetId: 'enrolment-by-level-year',
    title: 'Enrolment by level and year',
    description:
      'Horizontal bars compare student counts by education level across the years you selected. It is the main view of enrolment totals from the annual report data.',
  },
  {
    targetId: 'enrolment-trends',
    title: 'Enrolment over time',
    description:
      'When more than one year is selected, this line chart shows how enrolment at each level changes across years—useful for spotting growth or decline.',
  },
  {
    targetId: 'enrolment-by-sex',
    title: 'Enrolment by sex',
    description:
      'Heatmap-style view of female share of enrolment by level and year, when the data includes male and female counts.',
  },
  {
    targetId: 'enrolment-pie-share',
    title: 'Share by level (latest year)',
    description:
      'Pie chart of how total enrolment splits across ECCE, Primary, Secondary (and Tertiary if included) for the latest selected year—good for seeing the shape of the system.',
  },
]

const SCHOOLS_TEACHERS_PAGE: TourStep[] = [
  {
    targetId: 'schools-teachers-main',
    title: 'Schools and teachers by level',
    description:
      'Grouped columns show the number of schools and teachers for each education level and selected year. Compare capacity (teachers) against institutions (schools) side by side.',
  },
  {
    targetId: 'schools-teachers-trends',
    title: 'Trends over time',
    description:
      'With multiple years selected, these line charts show how school counts and teacher counts change by level—helpful for workforce and infrastructure planning views.',
  },
]

const PERFORMANCE_PAGE: TourStep[] = [
  {
    targetId: 'performance-intro',
    title: 'Performance indicators',
    description:
      'Short definitions: GER (gross enrolment rate), NER (net enrolment rate), GPI (gender parity), and STR (student–teacher ratio). Each measures a different aspect of access, equity, or staffing.',
  },
  {
    targetId: 'performance-sdg4-provinces',
    title: 'GER and NER by province (2024)',
    description:
      'When available, stacked columns show GER or NER by province and level for 2024. If you pick one province in the sidebar, you may see that province only. Helps compare regions.',
  },
  {
    targetId: 'performance-metrics-grid',
    title: 'GER, NER, GPI, and STR charts',
    description:
      'Bar charts summarise each indicator by level and year in your selection. GER and NER are percentages; GPI is a ratio (1 = parity); STR is students per teacher.',
  },
  {
    targetId: 'performance-trends',
    title: 'Performance trends',
    description:
      'With several years selected, line charts show GER and NER trends over time by level so you can track direction of change.',
  },
]

const TEACHERS_SEX_PAGE: TourStep[] = [
  {
    targetId: 'teachers-sex-intro',
    title: 'Teachers by sex',
    description:
      'Introduces workforce counts by male and female teachers at ECCE, Primary, and Secondary. Patterns often show more women in early years and primary.',
  },
  {
    targetId: 'teachers-sex-bars-male',
    title: 'Male teachers by level',
    description:
      'Column chart of male teacher counts by level and year—shows where male staff are concentrated over time.',
  },
  {
    targetId: 'teachers-sex-bars-female',
    title: 'Female teachers by level',
    description:
      'Same view for female teachers—compare with the male chart to see balance by level.',
  },
  {
    targetId: 'teachers-sex-trends',
    title: 'Male and female trends',
    description:
      'Line charts track male and female teacher numbers over multiple years when enough years are selected.',
  },
  {
    targetId: 'teachers-sex-summary',
    title: 'Level summary cards',
    description:
      'Cards summarise male, female, and total teachers per level across your selected years, with a simple majority indicator.',
  },
]

const METHODOLOGY_PAGE: TourStep[] = [
  {
    targetId: 'methodology-intro',
    title: 'Methodology overview',
    description:
      'Explains where national education statistics come from (MoET annual reports), how levels are defined, and how the dashboard combines some categories for display.',
  },
  {
    targetId: 'methodology-whats-new',
    title: 'What’s new',
    description:
      'Release notes or highlights about recent dashboard or data updates.',
  },
  {
    targetId: 'methodology-reports',
    title: 'Reports used',
    description:
      'Lists statistical reports that feed the dashboard, by year when available.',
  },
  {
    targetId: 'methodology-extraction',
    title: 'Extraction and limitations',
    description:
      'Notes on how figures are obtained from reports, assumptions, and limitations—useful for interpreting charts elsewhere in the app.',
  },
]

const PAGE_STEPS: TourStep[][] = [
  OVERVIEW_PAGE,
  ENROLMENT_PAGE,
  SCHOOLS_TEACHERS_PAGE,
  PERFORMANCE_PAGE,
  TEACHERS_SEX_PAGE,
]

/** Full guided steps: sidebar + page content; VANSTA uses its own page-only steps. */
export function getMoetTourSteps(activeTab: number): TourStep[] {
  if (activeTab === VANSTA_TAB_INDEX) return VANSTA_TOUR_STEPS
  if (activeTab >= 0 && activeTab < PAGE_STEPS.length) {
    return [...MOET_SIDEBAR_TOUR_STEPS, ...PAGE_STEPS[activeTab]]
  }
  if (activeTab === METHODOLOGY_TAB_INDEX) {
    return [...MOET_SIDEBAR_TOUR_STEPS, ...METHODOLOGY_PAGE]
  }
  return []
}
