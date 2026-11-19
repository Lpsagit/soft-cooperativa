import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CooperativaUserApp } from './CooperativaUserApp'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CooperativaUserApp/>
  </StrictMode>,
)
