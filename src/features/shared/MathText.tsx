import katex from 'katex'

interface MathTextProps {
  latex: string
  block?: boolean
}

function normalizeLatex(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\\\s+/g, '\\')
    .replace(/−/g, '-')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/Φ/g, '\\Phi ')
    .replace(/λ/g, '\\lambda ')
    .replace(/μ/g, '\\mu ')
    .replace(/σ/g, '\\sigma ')
}

export default function MathText({ latex, block = false }: MathTextProps) {
  const normalized = normalizeLatex(latex)

  const html = katex.renderToString(normalized, {
    displayMode: block,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
    errorColor: 'var(--error)',
  })

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
