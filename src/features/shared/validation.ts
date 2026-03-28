export function parseFiniteNumber(label: string, rawValue: string): { value?: number; error?: string } {
  const trimmed = rawValue.trim()
  if (!trimmed) {
    return { error: `${label} is required.` }
  }

  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return { error: `${label} must be a finite number.` }
  }

  return { value }
}

export function parseInteger(label: string, rawValue: string): { value?: number; error?: string } {
  const base = parseFiniteNumber(label, rawValue)
  if (base.error !== undefined) {
    return base
  }

  const value = base.value as number
  if (!Number.isInteger(value)) {
    return { error: `${label} must be an integer.` }
  }

  return { value }
}
