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

  useEffect(() => {
    const proj = window.electron?.projection
    if (!proj) return

    // PULL: pide el estado actual al montar (más confiable que esperar projection:init)
    proj.state().then(state => {
      if (state?.slide) setSlide(state.slide)
      if (state?.theme) setTheme(prev => ({ ...prev, ...state.theme }))
    }).catch(() => {})

    // PUSH: y suscríbete a updates futuros
    const offInit = proj.onInit(({ slide, theme }) => {
      if (slide) setSlide(slide)
      if (theme) setTheme(prev => ({ ...prev, ...theme }))
    })
    const offSlide = proj.onSlide((s) => setSlide(s))
    const offTheme = proj.onTheme((t) => setTheme(prev => ({ ...prev, ...t })))

    return () => { offInit?.(); offSlide?.(); offTheme?.() }
  }, [])

  if (isOverlay) {
    // Lower-third broadcast: fondo TRANSPARENTE + texto solo en la banda inferior
    return <LowerThirdRenderer slide={slide} theme={theme} />
  }

  // Pantalla completa: fondo del tema + texto centrado (proyector físico)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', userSelect: 'none' }}>
      <SlideRenderer slide={slide} theme={theme} />
    </div>
  )
}
