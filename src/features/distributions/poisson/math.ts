import { standardNormalCdf } from '../normal/math'

export type PoissonMode = 'eq' | 'lte' | 'gte' | 'lt' | 'gt'

export interface PoissonResult {
  probability: number
  formula: string
  explanation: string[]
  hint?: string
}

function logFactorial(value: number): number {
  if (value < 2) {
    return 0
  }

  let result = 0
  for (let i = 2; i <= value; i += 1) {
    result += Math.log(i)
  }
  return result
}

function poissonPmf(lambda: number, x: number): number {
  if (x < 0) {
    return 0
  }

  if (lambda === 0) {
    return x === 0 ? 1 : 0
  }

  const logProbability = -lambda + x * Math.log(lambda) - logFactorial(x)
  return Math.exp(logProbability)
}

function poissonCdf(lambda: number, x: number): number {
  if (x < 0) {
    return 0
  }

  if (lambda === 0) {
    return 1
  }

  if (lambda > 700 || x > 2000) {
    const z = (x + 0.5 - lambda) / Math.sqrt(lambda)
    return Math.max(0, Math.min(1, standardNormalCdf(z)))
  }

  let term = Math.exp(-lambda)
  let sum = term

  for (let k = 1; k <= x; k += 1) {
    term *= lambda / k
    sum += term
  }

  return Math.max(0, Math.min(1, sum))
}

export function calculatePoissonProbability(lambda: number, x: number, mode: PoissonMode): PoissonResult {
  const exact = poissonPmf(lambda, x)
  const lte = poissonCdf(lambda, x)
  const lt = poissonCdf(lambda, x - 1)

  if (mode === 'eq') {
    return {
      probability: exact,
      formula: 'P(X = x) = e^{-\\lambda} \\cdot \\frac{\\lambda^x}{x!}',
      explanation: [`P(X=${x}) = e^{-${lambda}} \\cdot \\frac{${lambda}^{${x}}}{${x}!} = ${exact.toFixed(6)}`],
    }
  }

  if (mode === 'lte') {
    return {
      probability: lte,
      formula: 'P(X \\le x) = \\sum_{k=0}^{x} e^{-\\lambda} \\cdot \\frac{\\lambda^k}{k!}',
      explanation: [`P(X \\le ${x}) = ${lte.toFixed(6)}`],
    }
  }

  if (mode === 'lt') {
    return {
      probability: lt,
      formula: 'P(X < x) = P(X \\le x - 1)',
      explanation: [`P(X < ${x}) = P(X \\le ${x - 1}) = ${lt.toFixed(6)}`],
    }
  }

  if (mode === 'gt') {
    const probability = Math.max(0, Math.min(1, 1 - lte))
    return {
      probability,
      formula: 'P(X > x) = 1 - P(X \\le x)',
      hint: 'P(X > x) = 1 - P(X \\le x)',
      explanation: [`P(X > ${x}) = 1 - P(X \\le ${x}) = 1 - ${lte.toFixed(6)} = ${probability.toFixed(6)}`],
    }
  }

  const probability = Math.max(0, Math.min(1, 1 - lt))
  return {
    probability,
    formula: 'P(X \\ge x) = 1 - P(X < x)',
    hint: 'P(X \\ge x) = 1 - P(X < x)',
    explanation: [`P(X \\ge ${x}) = 1 - P(X < ${x}) = 1 - ${lt.toFixed(6)} = ${probability.toFixed(6)}`],
  }
}
