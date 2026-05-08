import { useEffect, useState } from 'react'
import SlideRenderer from '../components/SlideRenderer.jsx'

const DEFAULT_THEME = {
  bgType: 'solid',
  bgColor: '#000000',
  bgGradient: ['#1e3a5f', '#0f172a'],
  bgImage: null,
  bgVideo: null,
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 64,
  fontColor: '#ffffff',
  fontWeight: 500,
  textShadow: true,
  textAlign: 'center',
  referenceVisible: true,
  transitionType: 'fade',
  transitionDuration: 500,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

/**
 * Vista renderizada en la ventana de proyección (BrowserWindow nativa).
 * Recibe el slide y el theme via IPC desde el main process. Delega a
 * SlideRenderer para garantizar que el output coincide con la vista previa
 * del panel y el monitor PGM/PVW.
 */
export default function ProjectionView() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const mode = params.get('mode') || 'background'

  const [slide, setSlide] = useState(window.__demoSlide || null)
  const [theme, setTheme] = useState(window.__demoTheme || DEFAULT_THEME)

  useEffect(() => {
    const proj = window.electron?.projection
    if (!proj) return
    proj.onInit(({ slide, theme }) => {
      if (slide) setSlide(slide)
      if (theme) setTheme(theme)
    })
    proj.onSlide(setSlide)
    proj.onTheme(setTheme)
  }, [])

  // En modo overlay la ventana es transparente: forzamos bgType=transparent
  // para que el SlideRenderer no pinte un fondo opaco encima.
  const effectiveTheme = mode === 'overlay'
    ? { ...theme, bgType: 'transparent' }
    : theme

  return (
    <div className="fixed inset-0 select-none" style={{ background: 'transparent' }}>
      <SlideRenderer slide={slide} theme={effectiveTheme} />
    </div>
  )
}
