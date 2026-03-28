import { useMemo } from 'react'
import type { PoissonMode } from '../distributions/poisson/math'

interface PoissonChartProps {
  lambda: number
  xValue: number
  mode: PoissonMode
}

interface PoissonDatum {
  x: number
  probability: number
  highlighted: boolean
}

function shouldHighlight(mode: PoissonMode, index: number, xValue: number): boolean {
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

function poissonPmf(lambda: number, k: number): number {
  if (k < 0) {
    return 0
  }

  if (lambda === 0) {
    return k === 0 ? 1 : 0
  }

  let logFactorial = 0
  for (let value = 2; value <= k; value += 1) {
    logFactorial += Math.log(value)
  }

  return Math.exp(-lambda + k * Math.log(lambda) - logFactorial)
}

export default function PoissonChart({ lambda, xValue, mode }: PoissonChartProps) {
  const data = useMemo<PoissonDatum[]>(() => {
    const spread = Math.max(8, Math.ceil(4 * Math.sqrt(Math.max(1, lambda))))
    const start = Math.max(0, Math.floor(lambda - spread))
    const end = Math.max(xValue + 2, Math.ceil(lambda + spread))

    const points: PoissonDatum[] = []
    for (let x = start; x <= end; x += 1) {
      points.push({
        x,
        probability: poissonPmf(lambda, x),
        highlighted: shouldHighlight(mode, x, xValue),
      })
    }
    return points
  }, [lambda, mode, xValue])

  const svgWidth = 760
  const svgHeight = 280
  const margin = { top: 16, right: 14, bottom: 36, left: 52 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom
  const maxY = Math.max(0.001, ...data.map((d) => d.probability)) * 1.08
  const barWidth = Math.max(2, plotWidth / Math.max(1, data.length) - 2)

  return (
    <div className="chart-card" aria-label="Poisson distribution chart">
      <h3>Poisson Distribution</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="native-chart" role="img" aria-label="Poisson probability bars">
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
