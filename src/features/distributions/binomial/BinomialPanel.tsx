import { useMemo, useState } from 'react'
import BinomialChart from '../../charts/BinomialChart'
import { formatProbability } from '../../shared/format'
import MathText from '../../shared/MathText'
import { parseFiniteNumber, parseInteger } from '../../shared/validation'
import { calculateBinomialProbability, type BinomialMode } from './math'

interface BinomialPanelProps {
  showSteps: boolean
  showFormula: boolean
}

const MODE_OPTIONS: Array<{ value: BinomialMode; latex: string }> = [
  { value: 'eq', latex: 'P(X = x)' },
  { value: 'lte', latex: 'P(X \\le x)' },
  { value: 'gte', latex: 'P(X \\ge x)' },
  { value: 'lt', latex: 'P(X < x)' },
  { value: 'gt', latex: 'P(X > x)' },
]

const N_LATEX = String.raw`n`
const P_LATEX = String.raw`p`

export default function BinomialPanel({ showSteps, showFormula }: BinomialPanelProps) {
  const [nInput, setNInput] = useState('10')
  const [pInput, setPInput] = useState('0.5')
  const [xInput, setXInput] = useState('4')
  const [mode, setMode] = useState<BinomialMode>('eq')

  const computed = useMemo(() => {
    const nParsed = parseInteger('n', nInput)
    if (nParsed.error) {
      return { error: nParsed.error }
    }

    const pParsed = parseFiniteNumber('p', pInput)
    if (pParsed.error) {
      return { error: pParsed.error }
    }

    const xParsed = parseInteger('x', xInput)
    if (xParsed.error) {
      return { error: xParsed.error }
    }

    const n = nParsed.value as number
    const p = pParsed.value as number
    const x = xParsed.value as number

    if (n < 0) {
      return { error: 'n must be greater than or equal to 0.' }
    }

    if (p < 0 || p > 1) {
      return { error: 'p must be between 0 and 1.' }
    }

    if (x < 0) {
      return { error: 'x must be greater than or equal to 0.' }
    }

    const result = calculateBinomialProbability(n, p, x, mode)
    return { result, n, p, x }
  }, [mode, nInput, pInput, xInput])

  return (
    <section className="panel" aria-label="Binomial module">
      <div className="panel-head">
        <h2>Binomial</h2>
        <p>Discrete success counts in n independent Bernoulli trials.</p>
      </div>

      <div className="field-grid">
        <label className="field">
          <span><MathText latex={N_LATEX} /></span>
          <input type="number" inputMode="numeric" step={1} value={nInput} onChange={(event) => setNInput(event.target.value)} />
        </label>

        <label className="field">
          <span><MathText latex={P_LATEX} /></span>
          <input type="number" inputMode="decimal" step="any" value={pInput} onChange={(event) => setPInput(event.target.value)} />
        </label>

        <label className="field">
          <span><MathText latex="x" /></span>
          <input type="number" inputMode="numeric" step={1} value={xInput} onChange={(event) => setXInput(event.target.value)} />
        </label>
      </div>

      <div className="option-grid" role="radiogroup" aria-label="Binomial probability mode">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === mode ? 'option active' : 'option'}
            onClick={() => setMode(option.value)}
            aria-pressed={option.value === mode}
          >
            <MathText latex={option.latex} />
          </button>
        ))}
      </div>

      {'error' in computed ? (
        <p className="error">{computed.error}</p>
      ) : (
        <>
          <BinomialChart n={computed.n} p={computed.p} xValue={computed.x} mode={mode} />
          <div className="result-card" aria-live="polite">
            <h3>Result</h3>
            <div className="result-value math-block">
              <MathText latex={`P = ${formatProbability(computed.result.probability)}`} block />
            </div>
            {computed.result.hint ? (
              <p className="hint math-inline">
                <MathText latex={computed.result.hint} />
              </p>
            ) : null}
            {showFormula ? (
              <div className="formula math-block">
                <MathText latex={computed.result.formula} block />
              </div>
            ) : null}
            {showSteps ? (
              <div className="steps">
                <h4>Step-by-step</h4>
                {computed.result.explanation.map((line) => (
                  <div className="math-block" key={line}>
                    <MathText latex={line} block />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
