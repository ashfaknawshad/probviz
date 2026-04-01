export type TTestMode = 'two-tailed' | 'left-tailed' | 'right-tailed'

export interface TTestInput {
  alpha: number
  df: number
  tStatistic: number
  mode: TTestMode
}

export interface TTestResult {
  criticalValues: number[]
  pValue: number
  rejectNull: boolean
  decisionLatex: string
  summaryLatex: string[]
}

const LANCZOS = [
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
]

function logGamma(z: number): number {
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
  }

  let x = 0.99999999999980993
  const adjusted = z - 1

  for (let i = 0; i < LANCZOS.length; i += 1) {
    x += LANCZOS[i] / (adjusted + i + 1)
  }

  const t = adjusted + LANCZOS.length - 0.5
  return 0.5 * Math.log(2 * Math.PI) + (adjusted + 0.5) * Math.log(t) - t + Math.log(x)
}

function betacf(a: number, b: number, x: number): number {
  const maxIterations = 200
  const epsilon = 3e-7
  const fpMin = 1e-30

  let qab = a + b
  let qap = a + 1
  let qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap

  if (Math.abs(d) < fpMin) {
    d = fpMin
  }
  d = 1 / d
  let h = d

  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < fpMin) {
      d = fpMin
    }
    c = 1 + aa / c
    if (Math.abs(c) < fpMin) {
      c = fpMin
    }
    d = 1 / d
    h *= d * c

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < fpMin) {
      d = fpMin
    }
    c = 1 + aa / c
    if (Math.abs(c) < fpMin) {
      c = fpMin
    }
    d = 1 / d
    const del = d * c
    h *= del

    if (Math.abs(del - 1) < epsilon) {
      break
    }
  }

  return h
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) {
    return 0
  }

  if (x >= 1) {
    return 1
  }

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x))

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a
  }

  return 1 - (bt * betacf(b, a, 1 - x)) / b
}

export function tPdf(x: number, df: number): number {
  const numerator = Math.exp(logGamma((df + 1) / 2))
  const denominator = Math.sqrt(df * Math.PI) * Math.exp(logGamma(df / 2))
  const base = 1 + (x * x) / df
  return (numerator / denominator) * Math.pow(base, -(df + 1) / 2)
}

export function tCdf(x: number, df: number): number {
  if (x === 0) {
    return 0.5
  }

  const ib = regularizedIncompleteBeta(df / (df + x * x), df / 2, 0.5)
  return x > 0 ? 1 - 0.5 * ib : 0.5 * ib
}

export function tQuantile(probability: number, df: number): number {
  if (probability <= 0) {
    return Number.NEGATIVE_INFINITY
  }

  if (probability >= 1) {
    return Number.POSITIVE_INFINITY
  }

  if (probability === 0.5) {
    return 0
  }

  if (probability < 0.5) {
    return -tQuantile(1 - probability, df)
  }

  let low = 0
  let high = 1

  while (tCdf(high, df) < probability && high < 1e6) {
    high *= 2
  }

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2
    const value = tCdf(mid, df)
    if (value < probability) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}

export function runTTest(input: TTestInput): TTestResult {
  const { alpha, df, tStatistic, mode } = input

  const cdfAtT = tCdf(tStatistic, df)
  const absT = Math.abs(tStatistic)
  const upperTailAbs = 1 - tCdf(absT, df)

  if (mode === 'two-tailed') {
    const critical = tQuantile(1 - alpha / 2, df)
    const pValue = Math.max(0, Math.min(1, 2 * upperTailAbs))
    const reject = absT > critical || pValue < alpha

    return {
      criticalValues: [-critical, critical],
      pValue,
      rejectNull: reject,
      decisionLatex: reject ? '\\text{Reject Null Hypothesis}' : '\\text{Fail to Reject Null Hypothesis}',
      summaryLatex: [
        `t_{crit}=\\pm ${critical.toFixed(4)}`,
        `|t|=${absT.toFixed(4)},\ p=${pValue.toFixed(6)},\ \\alpha=${alpha.toFixed(4)}`,
      ],
    }
  }

  if (mode === 'left-tailed') {
    const critical = tQuantile(alpha, df)
    const pValue = Math.max(0, Math.min(1, cdfAtT))
    const reject = tStatistic < critical || pValue < alpha

    return {
      criticalValues: [critical],
      pValue,
      rejectNull: reject,
      decisionLatex: reject ? '\\text{Reject Null Hypothesis}' : '\\text{Fail to Reject Null Hypothesis}',
      summaryLatex: [
        `t_{crit}=${critical.toFixed(4)}`,
        `t=${tStatistic.toFixed(4)},\ p=${pValue.toFixed(6)},\ \\alpha=${alpha.toFixed(4)}`,
      ],
    }
  }

  const critical = tQuantile(1 - alpha, df)
  const pValue = Math.max(0, Math.min(1, 1 - cdfAtT))
  const reject = tStatistic > critical || pValue < alpha

  return {
    criticalValues: [critical],
    pValue,
    rejectNull: reject,
    decisionLatex: reject ? '\\text{Reject Null Hypothesis}' : '\\text{Fail to Reject Null Hypothesis}',
    summaryLatex: [
      `t_{crit}=${critical.toFixed(4)}`,
      `t=${tStatistic.toFixed(4)},\ p=${pValue.toFixed(6)},\ \\alpha=${alpha.toFixed(4)}`,
    ],
  }
}
