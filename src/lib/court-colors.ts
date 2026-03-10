/**
 * Court-specific colors for consistent visualization across the dashboard.
 * WCAG AA compliant (4.5:1+ on white). Supreme = dark blue, Magistrates = teal, Island = green, Court of Appeal = purple.
 */
export const COURT_COLORS: Record<string, string> = {
  'Court of Appeal': '#7c3aed',   // purple
  'Supreme Court': '#1e40af',     // dark blue
  'Magistrates Court': '#0f766e',  // teal-700 (WCAG)
  'Island Court': '#15803d',      // green-700 (WCAG)
}

/** Canonical court order for consistent legend/series ordering */
export const COURT_ORDER = [
  'Court of Appeal',
  'Supreme Court',
  'Magistrates Court',
  'Island Court',
] as const

/** Short labels for legends to avoid clutter. Full names in tooltips. */
const COURT_SHORT: Record<string, string> = {
  'Court of Appeal': 'CoA',
  'Supreme Court': 'SC',
  'Magistrates Court': 'MC',
  'Island Court': 'IC',
}

export function getCourtShortLabel(court: string): string {
  return COURT_SHORT[court] ?? (court.replace(/\s+Court$/, '').slice(0, 2).toUpperCase() || court.slice(0, 3))
}

/** Get color for a court, fallback for unknown courts */
export function getCourtColor(court: string): string {
  return COURT_COLORS[court] ?? '#64748b'
}

/** Lighter variant for stacked/secondary segments (e.g. Female in Male/Female breakdown) */
export function getCourtColorLight(court: string): string {
  const hex = getCourtColor(court)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.55)`
}

/** Sort courts in canonical order, with data-only courts appended */
export function sortCourtsByOrder(courts: string[]): string[] {
  const ordered: string[] = []
  for (const c of COURT_ORDER) {
    if (courts.includes(c)) ordered.push(c)
  }
  for (const c of courts) {
    if (!ordered.includes(c)) ordered.push(c)
  }
  return ordered
}
