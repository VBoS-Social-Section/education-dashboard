/** Education institution colors for consistent visualization */
export const INSTITUTION_COLORS: Record<string, string> = {
  ECCE: '#7c3aed',
  Primary: '#1e40af',
  Secondary: '#0f766e',
  'Senior Secondary': '#15803d',
  Total: '#64748b',
}

export const INSTITUTION_ORDER = ['ECCE', 'Primary', 'Secondary', 'Senior Secondary', 'Total'] as const

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
  return INSTITUTION_COLORS[inst] ?? '#64748b'
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
