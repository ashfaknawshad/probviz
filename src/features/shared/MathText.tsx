import { BlockMath, InlineMath } from 'react-katex'

interface MathTextProps {
  latex: string
  block?: boolean
}

export default function MathText({ latex, block = false }: MathTextProps) {
  if (block) {
    return <BlockMath math={latex} errorColor="var(--error)" />
  }

  return <InlineMath math={latex} errorColor="var(--error)" />
}
