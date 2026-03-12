/** Vanuatu-inspired vibrant color palette with cultural relevance */
export const INSTITUTION_COLORS: Record<string, string> = {
  ECCE: '#FF6B35',      // Vibrant orange-red (inspired by Vanuatu red)
  Primary: '#0047AB',    // Deep blue (ocean/trust)
  Secondary: '#FFD700',  // Golden yellow (sunshine/prosperity)
  'Senior Secondary': '#228B22', // Rich green (growth/nature)
  Total: '#8B4513',      // Warm brown (earth/heritage)
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
