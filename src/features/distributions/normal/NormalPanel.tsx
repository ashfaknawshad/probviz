import { useMemo, useState } from 'react'
import NormalChart from '../../charts/NormalChart'
import { formatProbability } from '../../shared/format'
import MathText from '../../shared/MathText'
import { parseFiniteNumber } from '../../shared/validation'
import { calculateNormalProbability, type NormalMode } from './math'

interface NormalPanelProps {
  showSteps: boolean
  showFormula: boolean
}

const MODE_OPTIONS: Array<{ value: NormalMode; latex: string }> = [
  { value: 'lte', latex: 'P(X \\le x)' },
  { value: 'gte', latex: 'P(X \\ge x)' },
  { value: 'lt', latex: 'P(X < x)' },
  { value: 'gt', latex: 'P(X > x)' },
  { value: 'between', latex: 'P(a \\le X \\le b)' },
]

const MU_LATEX = String.raw`\mu`
const SIGMA_LATEX = String.raw`\sigma`

export default function NormalPanel({ showSteps, showFormula }: NormalPanelProps) {
  const [meanInput, setMeanInput] = useState('0')
  const [stdDevInput, setStdDevInput] = useState('1')
  const [xInput, setXInput] = useState('1.5')
  const [mode, setMode] = useState<NormalMode>('lte')
  const [aInput, setAInput] = useState('-1')
  const [bInput, setBInput] = useState('1')

  const computed = useMemo(() => {
    const meanParsed = parseFiniteNumber('Mean', meanInput)
    if (meanParsed.error) {
      return { error: meanParsed.error }
    }

    const stdDevParsed = parseFiniteNumber('Standard deviation', stdDevInput)
    if (stdDevParsed.error) {
      return { error: stdDevParsed.error }
    }

    const mean = meanParsed.value as number
    const stdDev = stdDevParsed.value as number

    if (stdDev <= 0) {
      return { error: 'Standard deviation must be greater than 0.' }
    }

    if (mode === 'between') {
      const aParsed = parseFiniteNumber('a', aInput)
      if (aParsed.error) {
        return { error: aParsed.error }
      }

      const bParsed = parseFiniteNumber('b', bInput)
      if (bParsed.error) {
        return { error: bParsed.error }
      }

      const a = aParsed.value as number
      const b = bParsed.value as number

      if (a > b) {
        return { error: 'a must be less than or equal to b.' }
      }

      const xMid = (a + b) / 2
      const result = calculateNormalProbability({ mean, stdDev, mode, x: xMid, a, b })
      return { result, mean, stdDev, x: xMid, a, b }
    }

    const xParsed = parseFiniteNumber('x', xInput)
    if (xParsed.error) {
      return { error: xParsed.error }
    }

    const x = xParsed.value as number

    const result = calculateNormalProbability({ mean, stdDev, mode, x })
    return { result, mean, stdDev, x }
  }, [meanInput, stdDevInput, xInput, mode, aInput, bInput])

  return (
    <section className="panel" aria-label="Normal module">
      <div className="panel-head">
        <h2>Normal</h2>
        <p>Continuous probabilities with automatic Z-score steps.</p>
      </div>

      <div className="field-grid">
        <label className="field">
          <span><MathText latex={MU_LATEX} /></span>
          <input type="number" inputMode="decimal" value={meanInput} onChange={(event) => setMeanInput(event.target.value)} />
        </label>

        <label className="field">
          <span><MathText latex={SIGMA_LATEX} /></span>
          <input type="number" inputMode="decimal" value={stdDevInput} onChange={(event) => setStdDevInput(event.target.value)} />
        </label>

        {mode !== 'between' ? (
          <label className="field">
            <span>x value</span>
            <input type="number" inputMode="decimal" value={xInput} onChange={(event) => setXInput(event.target.value)} />
          </label>
        ) : null}
      </div>

      <div className="option-grid" role="radiogroup" aria-label="Normal probability mode">
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

      {mode === 'between' ? (
        <div className="field-grid">
          <label className="field">
            <span>Lower bound (a)</span>
            <input type="number" inputMode="decimal" value={aInput} onChange={(event) => setAInput(event.target.value)} />
          </label>

          <label className="field">
            <span>Upper bound (b)</span>
            <input type="number" inputMode="decimal" value={bInput} onChange={(event) => setBInput(event.target.value)} />
          </label>
        </div>
      ) : null}

      {'error' in computed ? (
        <p className="error">{computed.error}</p>
      ) : (
        <>
          <NormalChart
            mean={computed.mean}
            stdDev={computed.stdDev}
            mode={mode}
            xValue={computed.x}
            intervalStart={'a' in computed ? computed.a : undefined}
            intervalEnd={'b' in computed ? computed.b : undefined}
          />
          <div className="result-card" aria-live="polite">
            <h3>Result</h3>
            <div className="result-value math-block">
              <MathText latex={`P = ${formatProbability(computed.result.probability)}`} block />
            </div>
            <p className="z-score math-inline">
              <MathText latex="Z = \\frac{x-\\mu}{\\sigma}" />
            </p>
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
