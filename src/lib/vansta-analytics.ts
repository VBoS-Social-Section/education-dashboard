import type { VanstaRow } from '@/types/vansta'

/** Grouped learning area: all numeracy tests → Numeracy; English vs French literacy separated */
export type SubjectStrand = 'Numeracy' | 'English literacy' | 'French literacy' | 'Other'

export type CohortYearLevel = 'Year 4' | 'Year 6' | 'Year 8' | 'Unknown'

/** Ordered worst → best for stacked charts and color ramps */
export const ACHIEVEMENT_BANDS = [
  'critically below minimum standard',
  'approaching minimum standard',
  'meeting minimum standard',
  'exceeding minimum standard',
] as const

const ACHIEVEMENT_SHORT: Record<string, string> = {
  'critically below minimum standard': 'Critically below',
  'approaching minimum standard': 'Approaching',
  'meeting minimum standard': 'Meeting',
  'exceeding minimum standard': 'Exceeding',
}

export function achievementShortLabel(full: string): string {
  return ACHIEVEMENT_SHORT[full.trim().toLowerCase()] ?? full
}

/** Classify row into Numeracy / English literacy / French literacy using DomainName (preferred) and VANSTATest */
export function inferSubjectStrand(r: VanstaRow): SubjectStrand {
  const d = (r.DomainName || '').trim()
  const t = (r.VANSTATest || '').trim()
  if (/numeracy/i.test(d) || /^Numeracy/i.test(t)) return 'Numeracy'
  if (/\(LF\d?\)/i.test(d) || /Overall Literacy \(LF/i.test(d)) return 'French literacy'
  if (/\(LA\d?\)/i.test(d) || /Overall literacy \(LA/i.test(d)) return 'English literacy'
  if (/Alphabétisation|Français/i.test(t)) return 'French literacy'
  if (/English Literacy/i.test(t)) return 'English literacy'
  if (/Numeracy/i.test(t)) return 'Numeracy'
  return 'Other'
}

/** Cohort year (4 / 6 / 8) from test title or domain code */
export function inferCohortYearLevel(r: VanstaRow): CohortYearLevel {
  const test = r.VANSTATest || ''
  if (/Year\s*4|Année\s*4/i.test(test)) return 'Year 4'
  if (/Year\s*6|Année\s*6/i.test(test)) return 'Year 6'
  if (/Year\s*8|Année\s*8/i.test(test)) return 'Year 8'
  const dm = (r.DomainName || '').match(/\((?:N|LA|LF)(\d)\)/i)
  if (dm?.[1] === '4') return 'Year 4'
  if (dm?.[1] === '6') return 'Year 6'
  if (dm?.[1] === '8') return 'Year 8'
  return 'Unknown'
}

export function normalizeAchievement(a: string | undefined): string {
  const s = (a || '').trim().toLowerCase()
  for (const band of ACHIEVEMENT_BANDS) {
    if (s === band) return band
  }
  return s || 'Unknown'
}

export function countByStrand(rows: VanstaRow[]): Record<SubjectStrand, number> {
  const out: Record<SubjectStrand, number> = {
    Numeracy: 0,
    'English literacy': 0,
    'French literacy': 0,
    Other: 0,
  }
  for (const r of rows) {
    out[inferSubjectStrand(r)] += 1
  }
  return out
}

export function countByYearLevel(rows: VanstaRow[]): Record<CohortYearLevel, number> {
  const out: Record<CohortYearLevel, number> = {
    'Year 4': 0,
    'Year 6': 0,
    'Year 8': 0,
    Unknown: 0,
  }
  for (const r of rows) {
    out[inferCohortYearLevel(r)] += 1
  }
  return out
}

/** For each strand, counts per achievement band (for 100% stacked columns) */
export function achievementByStrand(rows: VanstaRow[]): Map<SubjectStrand, Map<string, number>> {
  const strands: SubjectStrand[] = ['Numeracy', 'English literacy', 'French literacy']
  const result = new Map<SubjectStrand, Map<string, number>>()
  for (const s of strands) {
    result.set(s, new Map())
    for (const b of ACHIEVEMENT_BANDS) result.get(s)!.set(b, 0)
  }
  for (const r of rows) {
    const strand = inferSubjectStrand(r)
    if (strand === 'Other') continue
    const band = normalizeAchievement(r.Achievement)
    const m = result.get(strand)!
    if ((ACHIEVEMENT_BANDS as readonly string[]).includes(band)) {
      m.set(band, (m.get(band) ?? 0) + 1)
    }
  }
  return result
}

/** Top provinces with per-strand counts for grouped column chart */
export function provinceStrandCounts(
  rows: VanstaRow[],
  topN: number
): { provinces: string[]; numeracy: number[]; english: number[]; french: number[] } {
  const byProv = new Map<string, VanstaRow[]>()
  for (const r of rows) {
    const p = (r.Province || 'Unknown').trim() || 'Unknown'
    if (!byProv.has(p)) byProv.set(p, [])
    byProv.get(p)!.push(r)
  }
  const totals = [...byProv.entries()].map(([p, list]) => ({ p, n: list.length }))
  totals.sort((a, b) => b.n - a.n)
  const top = totals.slice(0, topN).map((x) => x.p)
  const numeracy: number[] = []
  const english: number[] = []
  const french: number[] = []
  for (const p of top) {
    const list = byProv.get(p) ?? []
    let n = 0,
      e = 0,
      f = 0
    for (const r of list) {
      const s = inferSubjectStrand(r)
      if (s === 'Numeracy') n++
      else if (s === 'English literacy') e++
      else if (s === 'French literacy') f++
    }
    numeracy.push(n)
    english.push(e)
    french.push(f)
  }
  return { provinces: top, numeracy, english, french }
}
