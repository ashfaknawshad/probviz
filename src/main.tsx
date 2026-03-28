import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './pwa/registerSW'
import 'katex/dist/katex.min.css'
import './styles/tokens.css'
import './styles/app.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()
