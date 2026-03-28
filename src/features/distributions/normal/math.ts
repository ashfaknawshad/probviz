export type NormalMode = 'lte' | 'gte' | 'lt' | 'gt' | 'between'

export interface NormalRequest {
  mean: number
  stdDev: number
  mode: NormalMode
  x: number
  a?: number
  b?: number
}

export interface NormalResult {
  probability: number
  explanation: string[]
  formula: string
}

function erf(value: number): number {
  const sign = value < 0 ? -1 : 1
  const x = Math.abs(value)

  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x))

  return sign * y
}

export function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

export function normalCdf(x: number, mean: number, stdDev: number): number {
  return standardNormalCdf((x - mean) / stdDev)
}

export function normalPdf(x: number, mean: number, stdDev: number): number {
  const variance = stdDev * stdDev
  const exponent = -Math.pow(x - mean, 2) / (2 * variance)
  return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance)
}

function clamp(probability: number): number {
  if (!Number.isFinite(probability)) {
    return 0
  }
  return Math.max(0, Math.min(1, probability))
}

export function calculateNormalProbability(request: NormalRequest): NormalResult {
  const z = (request.x - request.mean) / request.stdDev
  const cumulative = clamp(standardNormalCdf(z))

  if (request.mode === 'lte' || request.mode === 'lt') {
    return {
      probability: cumulative,
      formula: 'P(X \\le x) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)',
      explanation: [
        `Z = \\frac{x-\\mu}{\\sigma} = \\frac{${request.x}-${request.mean}}{${request.stdDev}} = ${z.toFixed(6)}`,
        `P(X \\le x) = \\Phi(${z.toFixed(6)}) = ${cumulative.toFixed(6)}`,
      ],
    }
  }

  if (request.mode === 'gte' || request.mode === 'gt') {
    const rightTail = clamp(1 - cumulative)
    return {
      probability: rightTail,
      formula: 'P(X \\ge x) = 1 - \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)',
      explanation: [
        `Z = \\frac{x-\\mu}{\\sigma} = \\frac{${request.x}-${request.mean}}{${request.stdDev}} = ${z.toFixed(6)}`,
        `P(X \\ge x) = 1 - \\Phi(${z.toFixed(6)}) = ${rightTail.toFixed(6)}`,
      ],
    }
  }

  const a = request.a as number
  const b = request.b as number
  const lowerZ = (a - request.mean) / request.stdDev
  const upperZ = (b - request.mean) / request.stdDev
  const interval = clamp(standardNormalCdf(upperZ) - standardNormalCdf(lowerZ))

  return {
    probability: interval,
    formula: 'P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
    explanation: [
      `Z_a = \\frac{a-\\mu}{\\sigma} = \\frac{${a}-${request.mean}}{${request.stdDev}} = ${lowerZ.toFixed(6)}`,
      `Z_b = \\frac{b-\\mu}{\\sigma} = \\frac{${b}-${request.mean}}{${request.stdDev}} = ${upperZ.toFixed(6)}`,
      `P(a \\le X \\le b) = \\Phi(${upperZ.toFixed(6)}) - \\Phi(${lowerZ.toFixed(6)}) = ${interval.toFixed(6)}`,
    ],
  }
}
