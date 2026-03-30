import type { TourStep } from '@/components/GuidedSpotlightTour'

/** Spotlight tour for the VANSTA tab: target ids match `[data-tour="..."]` on the page */
export const VANSTA_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'vansta-intro',
    title: 'Welcome to VANSTA',
    description:
      'This page shows national assessment (VANSTA) results from student-level test records. Each record is one test attempt—not one student—so the same learner can appear many times if they sit several papers. The text here explains school, test type, and domain, and how numeracy and literacy strands are grouped.',
  },
  {
    targetId: 'vansta-understanding',
    title: 'Understanding the dataset',
    description:
      'This box explains how to read the data: what one record means, how all numeracy papers are joined together and English vs French literacy split, what the achievement bands mean, and why the “at or above minimum” figure counts test attempts (not unique students).',
  },
  {
    targetId: 'vansta-kpis',
    title: 'Summary numbers',
    description:
      'These cards summarise your current filter: how many test records, how many different students and schools appear in that slice, which years are included, and what share of results are “meeting” or “exceeding” the minimum standard. Use them as a quick check before reading the charts.',
  },
  {
    targetId: 'vansta-filter-year',
    title: 'Year filter',
    description:
      'Choose a single calendar year to focus on it, or leave “All years” to include every year available in the dataset. All charts and KPIs below use only the results that match your filters.',
  },
  {
    targetId: 'vansta-filter-province',
    title: 'Province filter',
    description:
      'Restrict results to one province (Torba, Sanma, Shefa, etc.) or keep “All provinces” to see the whole country in the filtered year(s).',
  },
  {
    targetId: 'vansta-filter-domain',
    title: 'Domain (DomainName) filter',
    description:
      'Each domain is a specific overall skill label in the data, for example “Overall numeracy (N4)”. Pick one domain to study that outcome, or use “All domains” to keep every domain in the current year and province.',
  },
  {
    targetId: 'vansta-filter-test',
    title: 'VANSTA test filter',
    description:
      'This is the exact test paper name (e.g. “Numeracy - Year 4”, “English Literacy - Year 4”). Use it when you want a single paper. It is more detailed than the joined “learning area” filter below.',
  },
  {
    targetId: 'vansta-filter-strand',
    title: 'Learning area (joined) filter',
    description:
      'This groups all numeracy papers into “Numeracy” and separates English vs French literacy using the same rules as the charts. Use it to compare broad strands without picking each test paper separately.',
  },
  {
    targetId: 'vansta-filter-cohort',
    title: 'Cohort (year level) filter',
    description:
      'Keeps only tests for Year 4, 6, or 8 cohorts (based on the test name and domain codes). Useful to compare primary vs lower secondary patterns in the filtered data.',
  },
  {
    targetId: 'vansta-filter-reset',
    title: 'Reset filters',
    description:
      'Clears every filter back to “all” so you can start over quickly. Your filters and this guided tour are independent.',
  },
  {
    targetId: 'vansta-chart-learning-area',
    title: 'Records by learning area (joined)',
    description:
      'This bar chart shows how many test records fall into each joined strand: all numeracy together, English literacy, and French literacy. It answers “how much testing volume sits in each broad subject area” for your current filters.',
  },
  {
    targetId: 'vansta-chart-cohort',
    title: 'Records by cohort (year level)',
    description:
      'Shows how many records are in Year 4, Year 6, and Year 8 cohorts. It is a simple volume view of who is represented in the filtered data by grade band.',
  },
  {
    targetId: 'vansta-chart-achievement-mix',
    title: 'Achievement mix by learning area',
    description:
      'This 100% stacked chart shows, within each learning area, what share of rows fall in each achievement band (from critically below through to exceeding). It helps compare quality patterns between numeracy and literacy strands on the same scale.',
  },
  {
    targetId: 'vansta-chart-province-strand',
    title: 'Province × learning area',
    description:
      'Grouped columns compare numeracy, English literacy, and French literacy side by side for the provinces with the most records in your filter. Useful for spotting where one strand dominates in a region.',
  },
  {
    targetId: 'vansta-chart-vansta-test',
    title: 'Records by VANSTA test',
    description:
      'Shows volume for each individual test paper name (as listed on the assessment). Use it when you need to see numeracy vs literacy papers separately, not merged into the three joined strands.',
  },
  {
    targetId: 'vansta-chart-domain',
    title: 'Records by domain',
    description:
      'Shows volume for each DomainName label (e.g. each N4, LA4, LF4 outcome). It is similar to the domain filter but displays all domains at once for the filtered subset.',
  },
  {
    targetId: 'vansta-chart-schools',
    title: 'Top schools by record count',
    description:
      'Lists schools with the most test rows in the current filter. High counts can mean many students or many tests per student. It highlights where the largest volume of assessment activity sits.',
  },
  {
    targetId: 'vansta-chart-achievement-dist',
    title: 'Achievement distribution',
    description:
      'A bar chart of how many rows sit in each achievement band (critically below, approaching, meeting, exceeding). It is the raw count view of the same achievement field used in the stacked chart.',
  },
  {
    targetId: 'vansta-chart-achievement-pie',
    title: 'Share of records by achievement',
    description:
      'The pie chart shows the same achievement breakdown as proportions, so you can see the share at a glance. Use it together with the bar chart to compare counts and percentages.',
  },
  {
    targetId: 'vansta-chart-province-records',
    title: 'Records by province (total)',
    description:
      'This column chart ranks provinces by total number of test records in the filter. It is a simple volume map, not split by numeracy or literacy—that split is in the “Province × learning area” chart.',
  },
  {
    targetId: 'vansta-chart-year-trend',
    title: 'Records over time',
    description:
      'A line chart of total test records per calendar year in the filtered subset. It helps you see whether recorded test volume rises or falls over time for the selection you are viewing.',
  },
]
