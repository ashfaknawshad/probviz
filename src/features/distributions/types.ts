export type DistributionKind = 'poisson' | 'normal'

export interface DistributionDefinition {
  id: DistributionKind
  label: string
  summary: string
}
