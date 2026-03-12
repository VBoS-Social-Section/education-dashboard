/** Chart palette from design reference: vibrant blue, mint, teal, lavender */
export const INSTITUTION_COLORS: Record<string, string> = {
  ECCE: '#4B6DEB',       // vibrant blue
  Primary: '#6DEBB9',    // mint green
  Secondary: '#3D6D70',  // dark teal
  'Junior Secondary': '#3D6D70',
  'Senior Secondary': '#9CA5B7', // muted lavender
  Total: '#262E3B',      // darkest blue
}

export const INSTITUTION_ORDER = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary', 'Total'] as const

export const MENU_LEVELS = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary'] as const

const INSTITUTION_SHORT: Record<string, string> = {
  ECCE: 'ECCE',
  Primary: 'Primary',
  Secondary: 'Sec',
  'Senior Secondary': 'Snr Sec',
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
