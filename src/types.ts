/**
 * Unified row format for yearly CSV files.
 * Each row: Court, Year, Metric, Value, Unit
 */
export interface StatRow {
  Court: string
  Year: string
  Metric: string
  Value: string
  Unit: string
}

/** Parsed/typed row with numeric value where applicable */
export interface ParsedStatRow extends StatRow {
  valueNum: number | null
}

/** Court metrics keys (from court_metrics.csv) */
export const COURT_METRICS = [
  'Filings',
  'Disposals',
  'ClearanceRate',
  'Pending',
  'PDR',
  'PendingAge',
  'TimelinessCriminal',
  'TimelinessCivil',
  'AttendanceCriminal',
  'AttendanceCivil',
  'AttendanceEnforcement',
  'Productivity',
  'ReservedJudgments',
] as const

/** Case outcome metric prefixes */
export const OUTCOME_PREFIXES = ['Criminal_', 'Civil_', 'PI_'] as const

/** SDG 4 seed data from MoET/VEMIS (2022–2024) */
export interface Sdg4Seed {
  provinces: string[]
  authorities: string[]
  locations: string[]
  enrolmentByProvince2024?: Record<string, Record<string, number>>
  enrolmentByAuthority2024?: Record<string, Record<string, number>>
  enrolmentByLocation2024?: Record<string, Record<string, number>>
  enrolmentBySex?: Record<string, Record<string, { Male: number; Female: number }>>
  strByLevel?: Record<string, Record<string, number>>
  gerByProvince2024?: Record<string, Record<string, number>>
  nerByProvince2024?: Record<string, Record<string, number>>
}

/** 2020 Census, MICS 2023 & LFS 2024 seed data — household survey/census sources shown alongside MoET admin data for comparison */
export interface CensusMicsSeed {
  census2020: {
    sourceLabel: string
    surveyDate: string
    attendanceBySexProvince: Record<string, { Total: number; Male: number; Female: number }>
    attendanceByLevel: Record<string, Record<string, number>>
    attendanceByLevelNote?: string
    attainment15Plus: Record<string, Record<string, number>>
    languageOfInstruction: Record<string, { MaleEnglish: number; FemaleEnglish: number; MaleFrench: number; FemaleFrench: number; MaleBoth: number; FemaleBoth: number }>
  }
  mics2023: {
    sourceLabel: string
    surveyDate: string
    netAttendanceRateAdjusted: Record<string, number>
    eceAttendanceRate3to4: Record<string, number>
    participationRatePrePrimary: Record<string, number>
    completionRate: Record<string, number>
    genderParityIndex: Record<string, number>
    wealthParityIndex: Record<string, number>
    areaParityIndex: Record<string, number>
    /** UNICEF "Out-of-School Children" framework, dimensions 1-5 (not a literal dropout rate — MICS is cross-sectional) */
    outOfSchoolDimensions: Record<string, { Total: number; Male: number; Female: number }>
    outOfSchoolSourceTables?: string
    notesUrl?: string
    indicatorRefs?: string
  }
  lfs2024: {
    sourceLabel: string
    surveyDate: string
    attainmentVsParticipationRatePercent: Record<string, { Male: number; Female: number; Urban: number; Rural: number; Total: number }>
    metricNote?: string
  }
  schoolAgePopulationProjection: {
    sourceLabel: string
    years: number[]
    bands: Record<string, number[]>
  }
  /** Single year-of-age population projection (Census-derived), by sex. ages[i] pairs with male[i]/female[i], each an 11-value series aligned to years. */
  singleAgePopulationProjection: {
    sourceLabel: string
    years: number[]
    ages: string[]
    male: number[][]
    female: number[][]
  }
}
