import { useMemo, useState } from 'react'
import { tPdf, type TTestMode } from '../hypothesis/math'

interface TTestChartProps {
  df: number
  alpha: number
  tStatistic: number
  mode: TTestMode
  criticalValues: number[]
  pValue: number
}

interface Point {
  x: number
  y: number
}

function createAreaPath(points: Point[], baselineY: number, xScale: (x: number) => number, yScale: (y: number) => number): string {
  if (points.length < 2) {
    return ''
  }

  const start = points[0]
  const end = points[points.length - 1]

  const curve = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(2)}`)
    .join(' ')

  return `${curve} L ${xScale(end.x).toFixed(2)} ${baselineY.toFixed(2)} L ${xScale(start.x).toFixed(2)} ${baselineY.toFixed(2)} Z`
}

function contiguousSegments(data: Point[], predicate: (point: Point) => boolean): Point[][] {
  const segments: Point[][] = []
  let current: Point[] = []

  data.forEach((point) => {
    if (predicate(point)) {
      current.push(point)
    } else if (current.length > 0) {
      segments.push(current)
      current = []
    }
  })

  if (current.length > 0) {
    segments.push(current)
  }

  return segments
}

export default function TTestChart({ df, alpha, tStatistic, mode, criticalValues, pValue }: TTestChartProps) {
  const [showPointBubble, setShowPointBubble] = useState(false)

  const svgWidth = 860
  const svgHeight = 320
  const margin = { top: 20, right: 18, bottom: 42, left: 56 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom

  const { points, xMin, xMax, yMax, rejectSegments, pValueSegments } = useMemo(() => {
    const bounds = [Math.abs(tStatistic) + 1.5, ...criticalValues.map((value) => Math.abs(value) + 1.2)]
    const maxAbs = Math.max(4.5, ...bounds)
    const xMin = -maxAbs
    const xMax = maxAbs
    const totalSamples = 400
    const step = (xMax - xMin) / totalSamples

    const points: Point[] = []
    for (let i = 0; i <= totalSamples; i += 1) {
      const x = xMin + i * step
      points.push({ x, y: tPdf(x, df) })
    }

    const yMax = Math.max(...points.map((point) => point.y)) * 1.08

    const rejectPredicate = (point: Point) => {
      if (mode === 'two-tailed') {
        const [left, right] = criticalValues
        return point.x <= left || point.x >= right
      }
      if (mode === 'left-tailed') {
        return point.x <= criticalValues[0]
      }
      return point.x >= criticalValues[0]
    }

    const pPredicate = (point: Point) => {
      if (mode === 'two-tailed') {
        const threshold = Math.abs(tStatistic)
        return point.x <= -threshold || point.x >= threshold
      }
      if (mode === 'left-tailed') {
        return point.x <= tStatistic
      }
      return point.x >= tStatistic
    }

    return {
      points,
      xMin,
      xMax,
      yMax,
      rejectSegments: contiguousSegments(points, rejectPredicate),
      pValueSegments: contiguousSegments(points, pPredicate),
    }
  }, [alpha, criticalValues, df, mode, tStatistic])

  const xScale = (value: number) => margin.left + ((value - xMin) / (xMax - xMin)) * plotWidth
  const yScale = (value: number) => margin.top + plotHeight - (value / yMax) * plotHeight

  const curvePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(2)}`)
    .join(' ')

  const baselineY = yScale(0)
  const tPointX = xScale(tStatistic)
  const tPointY = yScale(tPdf(tStatistic, df))
  const bubbleX = Math.max(140, Math.min(svgWidth - 140, tPointX))
  const bubbleY = Math.max(32, tPointY - 54)

  return (
    <div className="chart-card" aria-label="t distribution graph">
      <h3>Student&apos;s t Distribution</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="native-chart ttest-chart" role="img" aria-label="Hypothesis testing t distribution">
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = margin.top + (1 - tick) * plotHeight
          return (
            <g key={tick}>
              <line x1={margin.left} y1={y} x2={margin.left + plotWidth} y2={y} stroke="#4e6782" strokeDasharray="4 4" opacity="0.45" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#c4d7ea">
                {(yMax * tick).toFixed(3)}
              </text>
            </g>
          )
        })}

        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} stroke="#c4d7ea" strokeWidth="1.2" />
        <line x1={margin.left} y1={baselineY} x2={margin.left + plotWidth} y2={baselineY} stroke="#c4d7ea" strokeWidth="1.2" />

        <path d={createAreaPath(points, baselineY, xScale, yScale)} fill="rgba(156, 185, 209, 0.22)" />

        {rejectSegments.map((segment, index) => (
          <path key={`reject-${index}`} d={createAreaPath(segment, baselineY, xScale, yScale)} fill="rgba(226, 77, 95, 0.34)" />
        ))}

        {pValueSegments.map((segment, index) => (
          <path key={`p-${index}`} d={createAreaPath(segment, baselineY, xScale, yScale)} fill="rgba(79, 157, 255, 0.34)" />
        ))}

        <path d={curvePath} fill="none" stroke="#7fc0ff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

        {criticalValues.map((value, index) => (
          <g key={`critical-${index}`}>
            <line x1={xScale(value)} y1={baselineY} x2={xScale(value)} y2={yScale(tPdf(value, df))} stroke="#ff6c80" strokeWidth="2" />
            <text x={xScale(value)} y={baselineY + 16} textAnchor="middle" fontSize="10" fill="#ff9aaa">
              {value.toFixed(3)}
            </text>
          </g>
        ))}

        <g>
          <line x1={tPointX} y1={baselineY} x2={tPointX} y2={tPointY} stroke="#1d9bf0" strokeWidth="2.2" />
          <text x={tPointX} y={margin.top + 12} textAnchor="middle" fontSize="11" fill="#7dc7ff">
            t = {tStatistic.toFixed(3)}
          </text>

          <circle cx={tPointX} cy={tPointY} r="9" fill="rgba(29,155,240,0.2)" stroke="none" />
          <circle
            cx={tPointX}
            cy={tPointY}
            r="5"
            fill="#22a6ff"
            stroke="#e9f6ff"
            strokeWidth="1.4"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPointBubble((value) => !value)}
          >
            <title>Click to view t-statistic details</title>
          </circle>

          {showPointBubble ? (
            <g>
              <rect x={bubbleX - 120} y={bubbleY - 20} width="240" height="44" rx="8" fill="#10263f" stroke="#5ea8e0" />
              <text x={bubbleX} y={bubbleY - 3} textAnchor="middle" fontSize="11" fill="#d9eeff">
                {`t = ${tStatistic.toFixed(4)} | p = ${pValue.toFixed(6)}`}
              </text>
              <text x={bubbleX} y={bubbleY + 13} textAnchor="middle" fontSize="10" fill="#9fc8ea">
                Tap point again to hide
              </text>
            </g>
          ) : null}
        </g>

        <text x={margin.left + 4} y={margin.top + 14} fill="#c4d7ea" fontSize="11">α = {alpha.toFixed(4)}</text>
        <text x={margin.left + 4} y={margin.top + 30} fill="#c4d7ea" fontSize="11">p-value = {pValue.toFixed(6)}</text>
      </svg>
    </div>
  )
}
