interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  className?: string
}

/** Minimal sparkline - SVG polyline for tiny trend charts */
export function Sparkline({ data, width = 64, height = 24, color = '#7551ff', strokeWidth = 1.5, className }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2
  const w = width - padding * 2
  const h = height - padding * 2
  const step = w / (data.length - 1)
  const points = data
    .map((v, i) => {
      const x = padding + i * step
      const y = padding + h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
