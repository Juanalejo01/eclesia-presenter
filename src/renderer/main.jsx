import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './Router.jsx'
import './styles/index.css'
import './styles/eclesia-design.css'

// CRÍTICO para la captura OBS del overlay:
// Detectamos modo overlay ANTES de renderizar React y forzamos clase en <html>.
// El CSS aplica `background: transparent !important` a html/body/#root cuando
// la clase está presente, ANTES del primer paint. Sin esto el body se pinta
// con var(--bg-0) opaco y OBS lo captura como fondo negro detrás del lower-third.
const hash = window.location.hash || ''
const isOverlayMode = /#\/projection.*[?&]mode=overlay/.test(hash)
if (isOverlayMode) {
  document.documentElement.classList.add('eclesia-overlay-mode')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
