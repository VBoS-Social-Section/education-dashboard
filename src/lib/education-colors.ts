/** Chart palette from design reference: vibrant blue, mint, teal, lavender */
export const INSTITUTION_COLORS: Record<string, string> = {
  ECCE: '#4B6DEB',       // vibrant blue
  Primary: '#6DEBB9',    // mint green
  Secondary: '#3D6D70',  // dark teal
  'Junior Secondary': '#3D6D70',
  'Senior Secondary': '#9CA5B7', // muted lavender (raw CSV keys only)
  Tertiary: '#7C3AED',
  Total: '#262E3B',      // darkest blue
}

/** Display order for charts (Secondary aggregates Junior + Senior Secondary from source data) */
export const INSTITUTION_ORDER = ['ECCE', 'Primary', 'Secondary', 'Tertiary', 'Total'] as const

/** Sidebar / filter levels — no separate Senior Secondary */
export const MENU_LEVELS = ['ECCE', 'Primary', 'Secondary', 'Tertiary'] as const

/** Raw CSV courts that roll up into the displayed "Secondary" level */
export const RAW_SECONDARY_COURTS = ['Secondary', 'Senior Secondary', 'Junior Secondary'] as const

const INSTITUTION_SHORT: Record<string, string> = {
  ECCE: 'ECCE',
  Primary: 'Primary',
  Secondary: 'Sec',
  Total: 'Total',
}

export function getInstitutionShortLabel(inst: string): string {
  return INSTITUTION_SHORT[inst] ?? inst
}

export function getInstitutionColor(inst: string): string {
  return INSTITUTION_COLORS[inst] ?? '#9CA5B7'
}

export function sortInstitutionsByOrder(insts: string[]): string[] {
  const ordered: string[] = []
  for (const c of INSTITUTION_ORDER) {
    if (insts.includes(c)) ordered.push(c)
  }
  for (const c of insts) {
    if (!ordered.includes(c)) ordered.push(c)
  }
  return ordered
}

/** Map raw Court values from CSV to chart series labels (one Secondary bar/line) */
export function chartInstitutionsFromRawCourts(rawCourts: string[]): string[] {
  const merged = new Set<string>()
  for (const c of rawCourts) {
    if ((RAW_SECONDARY_COURTS as readonly string[]).includes(c)) merged.add('Secondary')
    else merged.add(c)
  }
  return sortInstitutionsByOrder([...merged])
}

/** Sum Junior + Senior + Secondary enrolment keys from SDG seed rows */
export function secondaryEnrolmentFromSeedRow(row: Record<string, number>): number {
  return (row.Secondary ?? 0) + (row['Junior Secondary'] ?? 0) + (row['Senior Secondary'] ?? 0)
}
