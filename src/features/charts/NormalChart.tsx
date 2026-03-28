import { useMemo } from 'react'
import { normalPdf, type NormalMode } from '../distributions/normal/math'

interface NormalChartProps {
  mean: number
  stdDev: number
  mode: NormalMode
  xValue: number
  intervalStart?: number
  intervalEnd?: number
}

interface NormalDatum {
  x: number
  y: number
  shaded: number
}

function shouldShade(mode: NormalMode, x: number, xValue: number, intervalStart?: number, intervalEnd?: number): boolean {
  switch (mode) {
    case 'lte':
    case 'lt':
      return x <= xValue
    case 'gte':
    case 'gt':
      return x >= xValue
    case 'between':
      return intervalStart !== undefined && intervalEnd !== undefined && x >= intervalStart && x <= intervalEnd
    default:
      return false
  }
}

export default function NormalChart({
  mean,
  stdDev,
  mode,
  xValue,
  intervalStart,
  intervalEnd,
}: NormalChartProps) {
  const data = useMemo<NormalDatum[]>(() => {
    const minInput = Math.min(xValue, intervalStart ?? xValue)
    const maxInput = Math.max(xValue, intervalEnd ?? xValue)
    const start = Math.min(mean - 4 * stdDev, minInput - 2 * stdDev)
    const end = Math.max(mean + 4 * stdDev, maxInput + 2 * stdDev)
    const points: NormalDatum[] = []

    const sampleCount = 240
    const step = (end - start) / sampleCount

    for (let i = 0; i <= sampleCount; i += 1) {
      const x = start + i * step
      const y = normalPdf(x, mean, stdDev)
      points.push({
        x,
        y,
        shaded: shouldShade(mode, x, xValue, intervalStart, intervalEnd) ? y : 0,
      })
    }

    return points
  }, [mean, stdDev, mode, xValue, intervalStart, intervalEnd])

  const svgWidth = 760
  const svgHeight = 280
  const margin = { top: 16, right: 14, bottom: 34, left: 54 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom
  const maxY = Math.max(0.001, ...data.map((d) => d.y)) * 1.08

  const xMin = data[0]?.x ?? -5
  const xMax = data[data.length - 1]?.x ?? 5
  const xScale = (value: number) => margin.left + ((value - xMin) / (xMax - xMin || 1)) * plotWidth
  const yScale = (value: number) => margin.top + plotHeight - (value / maxY) * plotHeight

  const curvePath = data
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(2)}`)
    .join(' ')

  const shadedPoints = data.filter((point) => point.shaded > 0)
  const shadedPath =
    shadedPoints.length > 1
      ? `M ${xScale(shadedPoints[0].x).toFixed(2)} ${yScale(0).toFixed(2)} ` +
        shadedPoints
          .map((point) => `L ${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(2)}`)
          .join(' ') +
        ` L ${xScale(shadedPoints[shadedPoints.length - 1].x).toFixed(2)} ${yScale(0).toFixed(2)} Z`
      : ''

  return (
    <div className="chart-card" aria-label="Normal distribution chart">
      <h3>Normal Distribution</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="native-chart" role="img" aria-label="Normal probability curve">
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = margin.top + (1 - tick) * plotHeight
          return (
            <g key={tick}>
              <line x1={margin.left} y1={y} x2={margin.left + plotWidth} y2={y} stroke="#4e6782" strokeDasharray="4 4" opacity="0.45" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#c4d7ea">
                {(maxY * tick).toFixed(3)}
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

        {shadedPath ? <path d={shadedPath} fill="rgba(36, 193, 216, 0.28)" /> : null}
        <path d={curvePath} fill="none" stroke="#62b9ff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const value = xMin + tick * (xMax - xMin)
          const x = xScale(value)
          return (
            <text key={tick} x={x} y={margin.top + plotHeight + 16} textAnchor="middle" fontSize="10" fill="#c4d7ea">
              {value.toFixed(1)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
