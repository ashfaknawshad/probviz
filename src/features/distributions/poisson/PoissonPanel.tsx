import { useMemo, useState } from 'react'
import PoissonChart from '../../charts/PoissonChart'
import { formatProbability } from '../../shared/format'
import MathText from '../../shared/MathText'
import { parseFiniteNumber, parseInteger } from '../../shared/validation'
import { calculatePoissonProbability, type PoissonMode } from './math'

interface PoissonPanelProps {
  showSteps: boolean
  showFormula: boolean
}

const MODE_OPTIONS: Array<{ value: PoissonMode; latex: string }> = [
  { value: 'eq', latex: 'P(X = x)' },
  { value: 'lte', latex: 'P(X \\le x)' },
  { value: 'gte', latex: 'P(X \\ge x)' },
  { value: 'lt', latex: 'P(X < x)' },
  { value: 'gt', latex: 'P(X > x)' },
]

const LAMBDA_LATEX = String.raw`\lambda`

export default function PoissonPanel({ showSteps, showFormula }: PoissonPanelProps) {
  const [lambdaInput, setLambdaInput] = useState('3')
  const [xInput, setXInput] = useState('2')
  const [mode, setMode] = useState<PoissonMode>('eq')

  const computed = useMemo(() => {
    const lambdaParsed = parseFiniteNumber('Lambda', lambdaInput)
    if (lambdaParsed.error) {
      return { error: lambdaParsed.error }
    }

    const xParsed = parseInteger('x', xInput)
    if (xParsed.error) {
      return { error: xParsed.error }
    }

    const lambda = lambdaParsed.value as number
    const x = xParsed.value as number

    if (lambda < 0) {
      return { error: 'Lambda must be greater than or equal to 0.' }
    }

    if (x < 0) {
      return { error: 'x must be greater than or equal to 0.' }
    }

    const result = calculatePoissonProbability(lambda, x, mode)
    return { result, lambda, x }
  }, [lambdaInput, xInput, mode])

  return (
    <section className="panel" aria-label="Poisson module">
      <div className="panel-head">
        <h2>Poisson</h2>
        <p>Discrete event counts over fixed intervals.</p>
      </div>

      <div className="field-grid">
        <label className="field">
          <span><MathText latex={LAMBDA_LATEX} /></span>
          <input type="number" inputMode="decimal" value={lambdaInput} onChange={(event) => setLambdaInput(event.target.value)} />
        </label>

        <label className="field">
          <span><MathText latex="x" /></span>
          <input type="number" inputMode="numeric" step={1} value={xInput} onChange={(event) => setXInput(event.target.value)} />
        </label>
      </div>

      <div className="option-grid" role="radiogroup" aria-label="Poisson probability mode">
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
          <PoissonChart lambda={computed.lambda} xValue={computed.x} mode={mode} />
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
