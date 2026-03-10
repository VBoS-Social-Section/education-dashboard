/**
 * Vanuatu population estimates for rate-per-100k calculations.
 * 2020: VBOS National Population and Housing Census (~300,000).
 * Other years: interpolated from census. Source: VBOS.
 */
export const VANUATU_POPULATION: Record<number, number> = {
  2017: 282_000,
  2018: 288_000,
  2019: 294_000,
  2020: 300_000, // Census year (VBOS)
  2021: 306_000,
  2022: 312_000,
  2023: 318_000,
  2024: 324_000,
  2025: 330_000,
}

export function getPopulation(year: number): number | null {
  return VANUATU_POPULATION[year] ?? null
}

export function getRatePer100k(count: number, year: number): number | null {
  const pop = getPopulation(year)
  if (pop == null || pop <= 0) return null
  return Math.round((count / pop) * 100_000)
}
