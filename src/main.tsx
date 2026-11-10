import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bungee (SIL Open Font License), bundled with the app so the title never depends on a
// font service. Only the Latin subset.
import '@fontsource/bungee/latin-400.css'
import './styles/global.css'
import App from './App.tsx'

// StrictMode runs effects twice in dev to surface missing cleanup.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
