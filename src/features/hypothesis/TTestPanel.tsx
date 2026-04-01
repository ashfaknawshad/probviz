import { useMemo, useState } from 'react'
import TTestChart from '../charts/TTestChart'
import MathText from '../shared/MathText'
import { parseFiniteNumber, parseInteger } from '../shared/validation'
import { runTTest, type TTestMode } from './math'

interface TTestPanelProps {
  showSteps: boolean
  showFormula: boolean
}

const MODE_OPTIONS: Array<{ value: TTestMode; label: string }> = [
  { value: 'two-tailed', label: 'Two-tailed' },
  { value: 'left-tailed', label: 'Left-tailed' },
  { value: 'right-tailed', label: 'Right-tailed' },
]

export default function TTestPanel({ showSteps, showFormula }: TTestPanelProps) {
  const [alphaInput, setAlphaInput] = useState('0.05')
  const [dfInput, setDfInput] = useState('10')
  const [tInput, setTInput] = useState('2.1')
  const [mode, setMode] = useState<TTestMode>('two-tailed')

  const computed = useMemo(() => {
    const alphaParsed = parseFiniteNumber('alpha', alphaInput)
    if (alphaParsed.error) {
      return { error: alphaParsed.error }
    }

    const dfParsed = parseInteger('df', dfInput)
    if (dfParsed.error) {
      return { error: dfParsed.error }
    }

    const tParsed = parseFiniteNumber('t-statistic', tInput)
    if (tParsed.error) {
      return { error: tParsed.error }
    }

    const alpha = alphaParsed.value as number
    const df = dfParsed.value as number
    const tStatistic = tParsed.value as number

    if (alpha <= 0 || alpha >= 1) {
      return { error: 'alpha must be between 0 and 1 (exclusive).' }
    }

    if (df <= 0) {
      return { error: 'df must be an integer greater than 0.' }
    }

    const result = runTTest({ alpha, df, tStatistic, mode })
    return { result, alpha, df, tStatistic }
  }, [alphaInput, dfInput, tInput, mode])

  return (
    <section className="panel" aria-label="Hypothesis testing module">
      <div className="panel-head">
        <h2>Hypothesis Testing (T-Test Visualizer)</h2>
        <p>Compare observed t-statistic against critical regions and visualize p-value areas.</p>
      </div>

      <div className="option-grid ttest-mode-grid" role="radiogroup" aria-label="T-test mode selector">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === mode ? 'option active' : 'option'}
            onClick={() => setMode(option.value)}
            aria-pressed={option.value === mode}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="field-grid ttest-input-grid">
        <label className="field">
          <span>
            alpha
            <span className="info-dot" title="Significance level threshold (Type I error rate).">?</span>
          </span>
          <input type="number" inputMode="decimal" step="any" value={alphaInput} onChange={(event) => setAlphaInput(event.target.value)} />
        </label>

        <label className="field">
          <span>
            df
            <span className="info-dot" title="Degrees of freedom for the Student's t-distribution.">?</span>
          </span>
          <input type="number" inputMode="numeric" step={1} value={dfInput} onChange={(event) => setDfInput(event.target.value)} />
        </label>

        <label className="field">
          <span>
            t-statistic
            <span className="info-dot" title="Observed t value from your sample/test statistic.">?</span>
          </span>
          <input type="number" inputMode="decimal" step="any" value={tInput} onChange={(event) => setTInput(event.target.value)} />
        </label>
      </div>

      {'error' in computed ? (
        <p className="error">{computed.error}</p>
      ) : (
        <>
          <TTestChart
            df={computed.df}
            alpha={computed.alpha}
            tStatistic={computed.tStatistic}
            mode={mode}
            criticalValues={computed.result.criticalValues}
            pValue={computed.result.pValue}
          />

          <div className="result-card" aria-live="polite">
            <h3>Decision</h3>
            <p className={computed.result.rejectNull ? 'decision reject' : 'decision fail'}>
              {computed.result.rejectNull ? 'Reject Null Hypothesis' : 'Fail to Reject Null Hypothesis'}
            </p>

            {showFormula ? (
              <div className="formula math-block">
                {mode === 'two-tailed' ? (
                  <MathText latex="t_{crit}=\\pm t_{\\alpha/2,df}" block />
                ) : mode === 'left-tailed' ? (
                  <MathText latex="t_{crit}=t_{\\alpha,df}\\ (\\text{left tail})" block />
                ) : (
                  <MathText latex="t_{crit}=t_{1-\\alpha,df}\\ (\\text{right tail})" block />
                )}
              </div>
            ) : null}

            {showSteps ? (
              <div className="steps">
                <h4>Step-by-step</h4>
                {computed.result.summaryLatex.map((line) => (
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
