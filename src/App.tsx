import { useEffect, useState } from 'react'
import BinomialPanel from './features/distributions/binomial/BinomialPanel'
import NormalPanel from './features/distributions/normal/NormalPanel'
import PoissonPanel from './features/distributions/poisson/PoissonPanel'
import type { DistributionDefinition, DistributionKind } from './features/distributions/types'

const DISTRIBUTIONS: DistributionDefinition[] = [
  { id: 'poisson', label: 'Poisson', summary: 'Discrete events in fixed intervals' },
  { id: 'binomial', label: 'Binomial', summary: 'Success counts across fixed independent trials' },
  { id: 'normal', label: 'Normal', summary: 'Continuous values with bell-curve model' },
]

type ThemeMode = 'system' | 'light' | 'dark'

export default function App() {
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionKind>('poisson')
  const [showSteps, setShowSteps] = useState(true)
  const [showFormula, setShowFormula] = useState(true)
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const root = document.documentElement
    if (themeMode === 'system') {
      root.removeAttribute('data-theme')
      return
    }

    root.setAttribute('data-theme', themeMode)
  }, [themeMode])

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Progressive Web App</p>
          <h1>ProbViz</h1>
          <p className="subhead">
            Solve Poisson, Binomial and Normal distribution probabilities in real time, with interactive visuals and full offline support.
          </p>
        </div>
        <div className="compact-controls" aria-label="Display options">
          <label className="compact-toggle">
            <input type="checkbox" checked={showSteps} onChange={(event) => setShowSteps(event.target.checked)} />
            Steps
          </label>
          <label className="compact-toggle">
            <input type="checkbox" checked={showFormula} onChange={(event) => setShowFormula(event.target.checked)} />
            Formula
          </label>
          <label className="theme-picker">
            Theme
            <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as ThemeMode)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>

      <main className="main-grid">
        <section className="card controls-card">
          <h2>Distribution Selection</h2>
          <div className="dist-grid" role="radiogroup" aria-label="Distribution selector">
            {DISTRIBUTIONS.map((distribution) => (
              <button
                key={distribution.id}
                type="button"
                className={distribution.id === selectedDistribution ? 'dist-option active' : 'dist-option'}
                onClick={() => setSelectedDistribution(distribution.id)}
                aria-pressed={distribution.id === selectedDistribution}
              >
                <span>{distribution.label}</span>
                <small>{distribution.summary}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="card module-card">
          {selectedDistribution === 'poisson' ? (
            <PoissonPanel showSteps={showSteps} showFormula={showFormula} />
          ) : selectedDistribution === 'binomial' ? (
            <BinomialPanel showSteps={showSteps} showFormula={showFormula} />
          ) : (
            <NormalPanel showSteps={showSteps} showFormula={showFormula} />
          )}
        </section>
      </main>

      <footer className="footer">Created by Ashfak Nawshad</footer>
    </div>
  )
}
