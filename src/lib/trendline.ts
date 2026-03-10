/**
 * Linear regression trend line for time-series data.
 * Returns fitted values y = mx + b for each index.
 */
export function linearRegression(values: number[]): number[] {
  const n = values.length
  if (n < 2) return [...values]

  const indices = values.map((_, i) => i)
  const meanX = indices.reduce((a, b) => a + b, 0) / n
  const meanY = values.reduce((a, b) => a + b, 0) / n

  let ssX = 0
  let ssXY = 0
  for (let i = 0; i < n; i++) {
    const dx = indices[i] - meanX
    const dy = values[i] - meanY
    ssX += dx * dx
    ssXY += dx * dy
  }

  const m = ssX !== 0 ? ssXY / ssX : 0
  const b = meanY - m * meanX

  return indices.map((x) => Math.max(0, m * x + b))
}
