import { useEffect, useState } from 'react'
import { DEFAULT_THEME } from '../services/themeStore.js'

/**
 * Vista de Stage Display (modo presentador) — pantalla informativa para
 * músicos/predicadores que muestra: slide actual grande, próximo slide,
 * reloj y tiempo desde inicio del servicio.
 *
 * Se carga en una BrowserWindow distinta con ?mode=stage.
 * No es transparente ni capturable por OBS — es para el equipo de plataforma.
 */
export default function StageDisplay() {
  const [slide, setSlide] = useState(null)
  const [next, setNext]   = useState(null)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [now, setNow]     = useState(Date.now())
  const [start, setStart] = useState(null)

  useEffect(() => {
    document.title = 'EclesiaPresenter — Stage Display'
    const proj = window.electron?.projection
    if (!proj) return

    proj.state().then(state => {
      if (state?.slide) { setSlide(state.slide); setStart(s => s || Date.now()) }
      if (state?.theme) setTheme(prev => ({ ...prev, ...state.theme }))
    }).catch(() => {})

    const offSlide = proj.onSlide((s) => {
      setSlide(s); setStart(prev => prev || Date.now())
    })
    const offTheme = proj.onTheme((t) => setTheme(prev => ({ ...prev, ...t })))

    return () => { offSlide?.(); offTheme?.() }
  }, [])

  // Reloj
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = start ? Math.floor((now - start) / 1000) : 0
  const eh = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const em = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const es = String(elapsed % 60).padStart(2, '0')

  const clockNow = new Date(now)
  const hh = String(clockNow.getHours()).padStart(2, '0')
  const mm = String(clockNow.getMinutes()).padStart(2, '0')
  const ss = String(clockNow.getSeconds()).padStart(2, '0')

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a0d',
      color: '#f4e6d7',
      fontFamily: '"Geist", system-ui, sans-serif',
      display: 'grid',
      gridTemplateRows: '70px 1fr',
      userSelect: 'none', overflow: 'hidden',
    }}>

      {/* Header con reloj + tiempo */}
      <header style={{
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(232,181,145,0.2)',
        background: 'linear-gradient(180deg, #1a1410 0%, #14100d 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 600, color: '#db9f75' }}>
            EclesiaPresenter
          </span>
          <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.18em', color: '#8a7866', textTransform: 'uppercase' }}>
            Stage Display
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Stat label="Tiempo de servicio" value={`${eh}:${em}:${es}`} accent />
          <Stat label="Hora" value={`${hh}:${mm}:${ss}`} />
        </div>
      </header>

      {/* Body: slide actual + próximo */}
      <main style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, padding: 24, minHeight: 0 }}>

        {/* Slide actual */}
        <section style={{
          background: 'linear-gradient(135deg, #0a1620 0%, #1e3a5f 60%, #0a1620 100%)',
          borderRadius: 16,
          border: '2px solid rgba(255, 61, 61, 0.4)',
          boxShadow: '0 0 0 1px rgba(255, 61, 61, 0.2), 0 0 60px rgba(255, 61, 61, 0.15)',
          padding: 48,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <span style={{
            position: 'absolute', top: 16, left: 16,
            fontFamily: '"Geist Mono", monospace', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', color: '#ff5252', textTransform: 'uppercase',
            background: 'rgba(255, 61, 61, 0.15)',
            padding: '4px 10px', borderRadius: 4,
            border: '1px solid rgba(255, 61, 61, 0.5)',
          }}>● ON AIR · EN VIVO</span>

          {slide ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(36px, 5vw, 72px)',
                lineHeight: 1.25, margin: 0, color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                whiteSpace: 'pre-line',
              }}>{slide.text || '—'}</p>
              {slide.reference && (
                <p style={{
                  marginTop: 24, fontFamily: '"Geist Mono", monospace',
                  fontSize: 18, color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>{slide.reference}</p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <p style={{ fontSize: 24, margin: 0 }}>Sin slide activo</p>
              <p style={{ fontSize: 13, marginTop: 8, fontFamily: '"Geist Mono", monospace', letterSpacing: '0.1em' }}>
                Selecciona contenido en el panel de control
              </p>
            </div>
          )}
        </section>

        {/* Sidebar: info adicional */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <InfoCard label="Tipo de slide" value={slide?.type || '—'} />
          <InfoCard label="Tema activo" value={theme.bgType + (theme.bgType === 'gradient' ? ' azul' : '')} />
          <InfoCard label="Próximo" value="—" muted hint="Espacio reservado para futuras notas/preview" />

          {/* Notas del predicador (placeholder para futuro) */}
          <section style={{
            flex: 1, minHeight: 0,
            border: '1px dashed rgba(232,181,145,0.2)',
            borderRadius: 12,
            padding: 20,
            display: 'grid', placeItems: 'center', textAlign: 'center',
          }}>
            <div>
              <p style={{
                fontFamily: '"Geist Mono", monospace', fontSize: 10,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#8a7866', margin: 0,
              }}>Notas del predicador</p>
              <p style={{ fontSize: 13, color: '#574a3f', margin: '8px 0 0' }}>
                Disponible próximamente
              </p>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{
        fontFamily: '"Geist Mono", monospace', fontSize: 9,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7866',
      }}>{label}</span>
      <span style={{
        fontFamily: '"Geist Mono", monospace', fontSize: 24,
        fontVariantNumeric: 'tabular-nums',
        color: accent ? '#db9f75' : '#f4e6d7',
        letterSpacing: '0.05em', fontWeight: 600,
      }}>{value}</span>
    </div>
  )
}

function InfoCard({ label, value, muted, hint }) {
  return (
    <div style={{
      background: 'rgba(34, 26, 20, 0.6)',
      border: '1px solid rgba(232, 181, 145, 0.1)',
      borderRadius: 8, padding: '14px 16px',
    }}>
      <div style={{
        fontFamily: '"Geist Mono", monospace', fontSize: 9,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7866',
        marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 16, fontWeight: 500,
        color: muted ? '#574a3f' : '#f4e6d7',
      }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 11, color: '#574a3f', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  )
}
