import type { TourStep } from '@/components/GuidedSpotlightTour'

/** Spotlight tour for the Census & MICS tab: target ids match `[data-tour="..."]` on the page */
export const CENSUS_MICS_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'censusmics-intro',
    title: 'Two different ways of counting',
    description:
      'MoET data comes from what schools report. Census and MICS come from what households report door-to-door — including children no school ever registered. The two will disagree; that gap is the point of this page, not an error to reconcile.',
  },
  {
    targetId: 'censusmics-kpis',
    title: 'Headline equity numbers',
    description:
      'Four figures from the 2023 MICS survey that MoET admin data cannot produce on its own: junior secondary attendance, the senior secondary gender gap, how completion falls off after primary, and how much wealth affects primary attendance.',
  },
  {
    targetId: 'censusmics-attendance',
    title: 'Attendance, three ways',
    description:
      'Same age groups, three sources. MoET publishes one combined Secondary figure; Census and MICS split Junior and Senior Secondary, which is where most of the gap opens up.',
  },
  {
    targetId: 'censusmics-equity',
    title: 'Gender parity & completion',
    description:
      'Gender Parity Index compares MoET and MICS side by side. Completion rate — the share of children who finish each level — has no MoET equivalent; it only comes from a household survey that can follow children who left school.',
  },
  {
    targetId: 'censusmics-ece',
    title: 'Early childhood participation',
    description:
      'MICS breaks down early childhood attendance and pre-primary participation by sex, urban/rural, and household wealth quintile — a level of equity detail MoET reports do not include.',
  },
  {
    targetId: 'censusmics-attainment',
    title: 'What adults completed',
    description:
      'Census tells you the stock of adult qualifications by province; the Labour Force Survey links education level to labour market participation. Both describe the working-age population, not current students.',
  },
  {
    targetId: 'censusmics-population',
    title: 'School-age population, 2020–2030',
    description:
      'A Census-based population projection by education band. Useful as an independent denominator if you want to sanity-check NER/GER against a population estimate that is not tied to MoET\'s own figures.',
  },
  {
    targetId: 'censusmics-single-age',
    title: 'Single year of age, not just bands',
    description:
      'The chart above groups ages into education bands. Here you can pick one exact age and see its own trend by sex, or scan the heatmap below to see every age at once — useful for spotting which single cohort is driving a change in a band.',
  },
]
