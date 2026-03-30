import type { TourStep } from '@/components/GuidedSpotlightTour'

/** Shown at the start of every MoET / Methodology guided tour */
export const MOET_SIDEBAR_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'moet-sidebar-pages',
    title: 'Sidebar: pages',
    description:
      'Use this list to switch between Overview, Enrolment, Schools & Teachers, Performance, Teachers by Sex, and VANSTA. The Methodology link opens data sources and notes. The current page is highlighted.',
  },
  {
    targetId: 'moet-sidebar-filters',
    title: 'Sidebar: filters (MoET pages)',
    description:
      'On MoET report pages, choose education levels (ECCE, Primary, Secondary, Tertiary), province, school authority, and rural or urban location. Use the Years section to pick a range or turn on Compare years for two specific years. These choices apply to charts on the main area—not to the VANSTA tab, which has its own filters.',
  },
]
