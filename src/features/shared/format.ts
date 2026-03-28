export function formatProbability(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return 'Invalid result'
  }

  if (value === 0) {
    return '0.000000'
  }

  if (value > 0 && value < 0.000001) {
    return value.toExponential(6)
  }

  if (value > 1) {
    return '1.000000'
  }

  return value.toFixed(6)
}

export function formatValue(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) {
    return 'NaN'
  }
  return value.toFixed(decimals)
}
