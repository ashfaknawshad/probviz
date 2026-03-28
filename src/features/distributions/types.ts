export type DistributionKind = 'poisson' | 'normal' | 'binomial'

export interface DistributionDefinition {
  id: DistributionKind
  label: string
  summary: string
}
