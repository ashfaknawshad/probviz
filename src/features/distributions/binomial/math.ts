export type BinomialMode = 'eq' | 'lte' | 'gte' | 'lt' | 'gt'

export interface BinomialResult {
  probability: number
  formula: string
  explanation: string[]
  hint?: string
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

function binomialPmf(n: number, p: number, x: number): number {
  if (x < 0 || x > n) {
    return 0
  }

  if (p === 0) {
    return x === 0 ? 1 : 0
  }

  if (p === 1) {
    return x === n ? 1 : 0
  }

  return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x)
}

function binomialCdf(n: number, p: number, x: number): number {
  if (x < 0) {
    return 0
  }

  if (x >= n) {
    return 1
  }

  let sum = 0
  for (let k = 0; k <= x; k += 1) {
    sum += binomialPmf(n, p, k)
  }

  return Math.max(0, Math.min(1, sum))
}

export function calculateBinomialProbability(n: number, p: number, x: number, mode: BinomialMode): BinomialResult {
  const exact = binomialPmf(n, p, x)
  const lte = binomialCdf(n, p, x)
  const lt = binomialCdf(n, p, x - 1)

  if (mode === 'eq') {
    return {
      probability: exact,
      formula: 'P(X = x) = \\binom{n}{x} p^x (1-p)^{n-x}',
      explanation: [
        `P(X=${x}) = \\binom{${n}}{${x}}(${p})^{${x}}(1-${p})^{${n - x}} = ${exact.toFixed(6)}`,
      ],
    }
  }

  if (mode === 'lte') {
    return {
      probability: lte,
      formula: 'P(X \\le x) = \\sum_{k=0}^{x} \\binom{n}{k} p^k (1-p)^{n-k}',
      explanation: [`P(X \\le ${x}) = ${lte.toFixed(6)}`],
    }
  }

  if (mode === 'lt') {
    return {
      probability: lt,
      formula: 'P(X < x) = P(X \\le x-1)',
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
