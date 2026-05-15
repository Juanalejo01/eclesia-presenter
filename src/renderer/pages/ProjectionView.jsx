import { useEffect, useState } from 'react'
import SlideRenderer from '../components/SlideRenderer.jsx'
import LowerThirdRenderer from '../components/LowerThirdRenderer.jsx'
import { DEFAULT_THEME } from '../services/themeStore.js'

/**
 * Vista renderizada en la ventana de proyección (BrowserWindow nativa).
 *
 * Dos modos según `?mode=` en el hash:
 *   - background → pantalla completa con fondo del tema (proyector físico)
 *   - overlay    → lower-third estilo broadcast (banda inferior, capturable por OBS)
 */
export default function ProjectionView() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const mode = params.get('mode') || 'background'
  const isOverlay = mode === 'overlay'

  const [slide, setSlide] = useState(window.__demoSlide || null)
  const [theme, setTheme] = useState(window.__demoTheme || DEFAULT_THEME)

  // Setea el título de la ventana para que OBS pueda distinguirlas en su lista
  // de Window Capture. Por defecto Vite/React usa el <title> del index.html
  // (mismo para ambas ventanas), por eso hay que forzarlo aquí.
  useEffect(() => {
    document.title = isOverlay
      ? 'EclesiaPresenter — Lower-Third (OBS)'
      : 'EclesiaPresenter — Pantalla completa'
  }, [isOverlay])

  // La transparencia del overlay ya se aplica vía clase CSS desde main.jsx
  // (eclesia-overlay-mode) ANTES del primer paint. Aquí solo nos aseguramos
  // de que la clase esté en su sitio por si llegamos por hot-reload.
  useEffect(() => {
    if (isOverlay) document.documentElement.classList.add('eclesia-overlay-mode')
    return () => {
      if (isOverlay) document.documentElement.classList.remove('eclesia-overlay-mode')
    }
  }, [isOverlay])

  useEffect(() => {
    const proj = window.electron?.projection
    if (!proj) return

    proj.state().then(state => {
      if (state?.slide) setSlide(state.slide)
      if (state?.theme) setTheme(prev => ({ ...prev, ...state.theme }))
    }).catch(() => {})

    const offInit = proj.onInit(({ slide, theme }) => {
      if (slide) setSlide(slide)
      if (theme) setTheme(prev => ({ ...prev, ...theme }))
    })
    const offSlide = proj.onSlide((s) => setSlide(s))
    const offTheme = proj.onTheme((t) => setTheme(prev => ({ ...prev, ...t })))

    return () => { offInit?.(); offSlide?.(); offTheme?.() }
  }, [])

  if (isOverlay) {
    // Wrapper fixed que cubre la ventana completa. LowerThirdRenderer es
    // ahora `position: absolute` con `containerType: size` para que sus cqw
    // escalen correctamente tanto aquí (1920x1080) como en el preview del editor.
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'transparent', overflow: 'hidden', userSelect: 'none' }}>
        <LowerThirdRenderer slide={slide} theme={theme} />
      </div>
    )
  }

  // El placeholder solo aparece cuando NO hay slide en absoluto (slide === null).
  // Estados distintos:
  //   slide === null         → "Esperando contenido" (el operador no ha empezado)
  //   slide.type === 'blank' → pantalla con fondo del tema, SIN texto (B en presenters)
  //   slide.type === 'blackout' → negro absoluto, sin fondo (cuando se quiere apagar)
  //   slide normal           → renderiza el contenido
  const showWaitingPlaceholder = !slide

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', userSelect: 'none' }}>
      <SlideRenderer slide={slide} theme={theme} />
      {showWaitingPlaceholder && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          pointerEvents: 'none', zIndex: 5,
        }}>
          <div style={{ textAlign: 'center', opacity: 0.35 }}>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(48px, 6vw, 96px)',
              color: '#f4e6d7',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}>EclesiaPresenter</p>
            <p style={{
              marginTop: 16,
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(11px, 1vw, 14px)',
              color: '#c9b29c',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}>Esperando contenido…</p>
          </div>
        </div>
      )}
    </div>
  )
}
