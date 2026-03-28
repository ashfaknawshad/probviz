import { useMemo } from 'react'
import type { BinomialMode } from '../distributions/binomial/math'

interface BinomialChartProps {
  n: number
  p: number
  xValue: number
  mode: BinomialMode
}

interface BinomialDatum {
  x: number
  probability: number
  highlighted: boolean
}

function logFactorial(value: number): number {
  if (value < 2) {
    return 0
  }

  let sum = 0
  for (let i = 2; i <= value; i += 1) {
    sum += Math.log(i)
  }

  return sum
}

function combination(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0
  }

  const effectiveK = Math.min(k, n - k)
  const logValue = logFactorial(n) - logFactorial(effectiveK) - logFactorial(n - effectiveK)
  return Math.exp(logValue)
}

function binomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) {
    return 0
  }

  if (p === 0) {
    return k === 0 ? 1 : 0
  }

  if (p === 1) {
    return k === n ? 1 : 0
  }

  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

function shouldHighlight(mode: BinomialMode, index: number, xValue: number): boolean {
  switch (mode) {
    case 'eq':
      return index === xValue
    case 'lte':
      return index <= xValue
    case 'lt':
      return index < xValue
    case 'gte':
      return index >= xValue
    case 'gt':
      return index > xValue
    default:
      return false
  }
}

export default function BinomialChart({ n, p, xValue, mode }: BinomialChartProps) {
  const data = useMemo<BinomialDatum[]>(() => {
    const mean = n * p
    const sd = Math.sqrt(Math.max(1e-12, n * p * (1 - p)))
    const minX = Math.max(0, Math.floor(mean - 4 * sd), xValue - 14)
    const maxX = Math.min(n, Math.ceil(mean + 4 * sd), xValue + 14)

    const start = Math.max(0, minX)
    const end = Math.max(start + 1, maxX)

    const points: BinomialDatum[] = []
    for (let x = start; x <= end; x += 1) {
      points.push({
        x,
        probability: binomialPmf(n, p, x),
        highlighted: shouldHighlight(mode, x, xValue),
      })
    }

    return points
  }, [mode, n, p, xValue])

  const svgWidth = 760
  const svgHeight = 280
  const margin = { top: 16, right: 14, bottom: 36, left: 52 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom
  const maxY = Math.max(0.001, ...data.map((d) => d.probability)) * 1.08
  const barWidth = Math.max(2, plotWidth / Math.max(1, data.length) - 2)

  return (
    <div className="chart-card" aria-label="Binomial distribution chart">
      <h3>Binomial Distribution</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="native-chart" role="img" aria-label="Binomial probability bars">
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = margin.top + (1 - tick) * plotHeight
          return (
            <g key={tick}>
              <line x1={margin.left} y1={y} x2={margin.left + plotWidth} y2={y} stroke="#4e6782" strokeDasharray="4 4" opacity="0.45" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#c4d7ea">
                {(maxY * tick).toFixed(2)}
              </text>
            </g>
          )
        })}

        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} stroke="#c4d7ea" strokeWidth="1.2" />
        <line
          x1={margin.left}
          y1={margin.top + plotHeight}
          x2={margin.left + plotWidth}
          y2={margin.top + plotHeight}
          stroke="#c4d7ea"
          strokeWidth="1.2"
        />

        {data.map((entry, index) => {
          const x = margin.left + (index * plotWidth) / Math.max(1, data.length)
          const barHeight = Math.max(1, (entry.probability / maxY) * plotHeight)
          const y = margin.top + plotHeight - barHeight
          return (
            <g key={entry.x}>
              <rect
                x={x + 1}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill={entry.highlighted ? '#24c1d8' : '#5f7f92'}
                opacity={entry.highlighted ? 0.98 : 0.86}
              >
                <title>{`x=${entry.x}, P=${entry.probability.toFixed(6)}`}</title>
              </rect>
              {index % Math.ceil(data.length / 8) === 0 ? (
                <text x={x + barWidth / 2} y={margin.top + plotHeight + 16} textAnchor="middle" fontSize="10" fill="#c4d7ea">
                  {entry.x}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
