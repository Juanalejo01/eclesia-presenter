import { useEffect, useState } from 'react'
import MediaPicker from './MediaPicker.jsx'
import SlideRenderer from './SlideRenderer.jsx'
import { useTheme, setTheme as setStoredTheme } from '../services/themeStore.js'
import {
  IconExternal, IconMonitor, IconLayers, IconRefresh, IconChevDown,
} from './Icons.jsx'

const TRANSITION_TYPES = [
  { value: 'none', label: 'Ninguna' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide ◀' },
  { value: 'slide-right', label: 'Slide ▶' },
  { value: 'slide-up', label: 'Slide ▲' },
  { value: 'slide-down', label: 'Slide ▼' },
  { value: 'zoom-in', label: 'Zoom in' },
  { value: 'zoom-out', label: 'Zoom out' },
]

const DEMO_SLIDES = [
  { text: 'EN el principio crió Dios los cielos y la tierra.', reference: 'Génesis 1:1', type: 'bible' },
  { text: 'Jehová es mi pastor; nada me faltará.', reference: 'Salmos 23:1', type: 'bible' },
  { text: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13', type: 'bible' },
]

const BG_TYPES = [
  { value: 'solid', label: 'Sólido' },
  { value: 'gradient', label: 'Gradiente' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'transparent', label: 'Transparente' },
]
const ALIGN = [
  { value: 'top', label: 'Arriba' },
  { value: 'center', label: 'Centro' },
  { value: 'bottom', label: 'Abajo' },
]

const PRESETS = [
  { id: 'azul',      label: 'Clásico azul', bg: 'linear-gradient(135deg, #0a1620 0%, #1e3a5f 60%, #0a1620 100%)',
    theme: { bgType: 'gradient', bgGradient: ['#0a1620', '#1e3a5f'], fontColor: '#ffffff', fontSize: 64, textAlign: 'center' } },
  { id: 'atardecer', label: 'Atardecer', bg: 'linear-gradient(135deg, #3e2411 0%, #804012 50%, #1a0e08 100%)',
    theme: { bgType: 'gradient', bgGradient: ['#3e2411', '#804012'], fontColor: '#f4e6d7', fontSize: 64, textAlign: 'center' } },
  { id: 'bosque',    label: 'Bosque', bg: 'linear-gradient(135deg, #0a1a12 0%, #1c4029 60%, #0a1a12 100%)',
    theme: { bgType: 'gradient', bgGradient: ['#0a1a12', '#1c4029'], fontColor: '#ecfdf5', fontSize: 64, textAlign: 'center' } },
  { id: 'negro',     label: 'Negro puro', bg: '#000000',
    theme: { bgType: 'solid', bgColor: '#000000', fontColor: '#ffffff', fontSize: 72, textAlign: 'center' } },
  { id: 'marmol',    label: 'Mármol cobre', bg: 'radial-gradient(ellipse at 30% 20%, #db9f75 0%, #804012 40%, #1a0e08 100%)',
    theme: { bgType: 'gradient', bgGradient: ['#db9f75', '#1a0e08'], fontColor: '#ffffff', fontSize: 64, textAlign: 'center' } },
  { id: 'vitral',    label: 'Vitral', bg: 'conic-gradient(from 200deg at 50% 50%, #122324, #804012, #db9f75, #2f3a32, #122324)',
    theme: { bgType: 'gradient', bgGradient: ['#122324', '#804012'], fontColor: '#ffffff', fontSize: 64, textAlign: 'center' } },
  { id: 'overlay',   label: 'Overlay OBS', bg: 'repeating-conic-gradient(#1a1410 0 25%, #2a1f17 0 50%) 50% / 14px 14px',
    theme: { bgType: 'transparent', fontColor: '#ffffff', fontSize: 56, textAlign: 'bottom', textShadow: true } },
]

export default function ProjectionPanel({ slide }) {
  const [hasElectron] = useState(() => !!window.electron?.projection)
  const [openModes, setOpenModes] = useState([])
  const [displays, setDisplays]   = useState([])
  const theme   = useTheme()
  const [preview, setPreview] = useState(slide || DEMO_SLIDES[0])
  const [activePreset, setActivePreset] = useState(null)

  useEffect(() => { if (slide) setPreview(slide) }, [slide])

  useEffect(() => {
    if (!hasElectron) return
    window.electron.projection.state().then(s => {
      setOpenModes(s.open); setDisplays(s.displays)
    })
  }, [hasElectron])

  const refreshState = async () => {
    if (!hasElectron) return
    const s = await window.electron.projection.state()
    setOpenModes(s.open); setDisplays(s.displays)
  }

  const updateTheme = (patch) => setStoredTheme(patch)

  const open = async (mode, displayId) => {
    if (!hasElectron) {
      alert('Las ventanas de proyección requieren Electron real (npm run dev). En navegador solo puedes previsualizar.')
      return
    }
    await window.electron.projection.open({ mode, displayId })
    refreshState()
  }
  const close = async (mode) => {
    if (!hasElectron) return
    await window.electron.projection.close(mode)
    refreshState()
  }

  if (!theme) return null

  const isOpen = (mode) => openModes.includes(mode)
  const cyclePreview = () => {
    const idx = DEMO_SLIDES.findIndex(s => s.text === preview?.text)
    setPreview(DEMO_SLIDES[(idx + 1) % DEMO_SLIDES.length])
  }
  const openAll = async () => {
    if (!isOpen('background')) await open('background')
    if (!isOpen('overlay')) await open('overlay')
  }

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Proyección</h1>
          <span className="ws-sub">
            Ventanas nativas · capturables por OBS
            {!hasElectron && <span style={{ color: 'var(--preview)', marginLeft: 8 }}>· Solo preview en navegador</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={cyclePreview}><IconRefresh size={14} /> Probar transición</button>
          <button className="btn btn-primary" onClick={openAll}>
            <IconExternal size={14} /> Abrir todas
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Output cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <OutputCard
              title="Pantalla completa"
              subtitle="Proyector físico · fondo del tema"
              Icon={IconMonitor} accent="copper"
              isOpen={isOpen('background')}
              displays={displays}
              onOpen={(displayId) => open('background', displayId)}
              onClose={() => close('background')}
            />
            <OutputCard
              title="Overlay (Lower-Third)"
              subtitle="Banda inferior transparente para OBS"
              Icon={IconLayers} accent="bible"
              isOpen={isOpen('overlay')}
              displays={displays}
              onOpen={(displayId) => open('overlay', displayId)}
              onClose={() => close('overlay')}
            />
          </div>

          {/* Big preview */}
          <div>
            <div className="section-h">
              <h3>Vista previa del estilo</h3>
              <span className="sub">{activePreset || theme.bgType}</span>
            </div>
            <div className="projection-preview" style={{ background: 'transparent', padding: 0 }}>
              <SlideRenderer slide={preview} theme={theme} />
            </div>
          </div>

          {/* Style presets */}
          <div>
            <div className="section-h">
              <h3>Estilos predefinidos</h3>
              <span className="sub">{PRESETS.length} plantillas · personalizables</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PRESETS.length}, 1fr)`, gap: 10 }}>
              {PRESETS.map(p => (
                <div key={p.id}
                  className={'style-card' + (activePreset === p.id ? ' active' : '')}
                  onClick={() => { updateTheme(p.theme); setActivePreset(p.id) }}
                  style={{ background: p.bg }}>
                  <span className="label-aa">Aa</span>
                  <span className="label-name">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customization */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-h" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 16 }}>Personalización avanzada</h3>
              <span className="sub">en tiempo real</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div className="field">
                <span className="label">Fondo</span>
                <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
                  {BG_TYPES.map(b => (
                    <button key={b.value}
                      className={'modal-tab ' + (theme.bgType === b.value ? 'active' : '')}
                      style={{ flex: 1 }}
                      onClick={() => updateTheme({ bgType: b.value })}>{b.label}</button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="label">Tamaño · {theme.fontSize}px</span>
                <input type="range" min="32" max="120" value={theme.fontSize}
                  onChange={e => updateTheme({ fontSize: +e.target.value })}
                  className="slider"
                  style={{ '--val': ((theme.fontSize - 32) / 88 * 100) + '%' }} />
              </div>

              {theme.bgType === 'solid' && (
                <ColorRow label="Color del fondo" value={theme.bgColor} onChange={v => updateTheme({ bgColor: v })} />
              )}

              {theme.bgType === 'gradient' && (
                <>
                  <ColorRow label="Gradiente · desde" value={theme.bgGradient[0]}
                    onChange={v => updateTheme({ bgGradient: [v, theme.bgGradient[1]] })} />
                  <ColorRow label="Gradiente · hasta" value={theme.bgGradient[1]}
                    onChange={v => updateTheme({ bgGradient: [theme.bgGradient[0], v] })} />
                </>
              )}

              {theme.bgType === 'image' && (
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <span className="label">Imagen de fondo</span>
                  <MediaPicker kind="image" label="Biblioteca de imágenes"
                    value={theme.bgImage} onChange={(url) => updateTheme({ bgImage: url })} />
                </div>
              )}

              {theme.bgType === 'video' && (
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <span className="label">Video de fondo</span>
                  <MediaPicker kind="video" label="Biblioteca de videos"
                    value={theme.bgVideo} onChange={(url) => updateTheme({ bgVideo: url })} />
                </div>
              )}

              <ColorRow label="Color del texto" value={theme.fontColor}
                onChange={v => updateTheme({ fontColor: v })} />

              <div className="field">
                <span className="label">Posición vertical</span>
                <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
                  {ALIGN.map(a => (
                    <button key={a.value}
                      className={'modal-tab ' + (theme.textAlign === a.value ? 'active' : '')}
                      style={{ flex: 1 }}
                      onClick={() => updateTheme({ textAlign: a.value })}>{a.label}</button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ gridColumn: 'span 2' }}>
                <span className="label">Transición · {theme.transitionDuration ?? 500}ms</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)', marginBottom: 8 }}>
                  {TRANSITION_TYPES.map(t => (
                    <button key={t.value}
                      className={'modal-tab ' + (theme.transitionType === t.value ? 'active' : '')}
                      onClick={() => updateTheme({ transitionType: t.value })}
                      style={{ fontSize: 11, padding: '4px 6px' }}>{t.label}</button>
                  ))}
                </div>
                <input type="range" min="0" max="2000" step="50"
                  value={theme.transitionDuration ?? 500}
                  onChange={e => updateTheme({ transitionDuration: +e.target.value })}
                  className="slider"
                  style={{ '--val': ((theme.transitionDuration ?? 500) / 2000 * 100) + '%' }} />
              </div>

              <div className="field" style={{ gridColumn: 'span 2', flexDirection: 'row', gap: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!theme.textShadow}
                    onChange={e => updateTheme({ textShadow: e.target.checked })} />
                  Sombra de texto
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!theme.referenceVisible}
                    onChange={e => updateTheme({ referenceVisible: e.target.checked })} />
                  Mostrar referencia bíblica
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OutputCard({ title, subtitle, Icon, accent, isOpen, displays, onOpen, onClose }) {
  const [displayId, setDisplayId] = useState('')
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span className={'song-icon ' + (accent === 'bible' ? 'bible' : '')}>
          <Icon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subtitle}</div>
        </div>
        {isOpen
          ? <span className="tally live"><span className="led" /> Abierta</span>
          : <span className="tally off">Cerrada</span>}
      </div>

      {displays.length > 1 && !isOpen && (
        <select value={displayId} onChange={e => setDisplayId(e.target.value)}
          className="select" style={{ width: '100%', marginBottom: 8, height: 32 }}>
          <option value="">Pantalla automática</option>
          {displays.map(d => (
            <option key={d.id} value={d.id}>
              {d.label} {d.primary ? '(principal)' : ''} · {d.bounds.width}×{d.bounds.height}
            </option>
          ))}
        </select>
      )}

      {isOpen ? (
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Cerrar ventana
        </button>
      ) : (
        <button className={isOpen ? 'btn' : 'btn btn-primary'}
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onOpen(displayId ? +displayId : undefined)}>
          <IconExternal size={14} /> {isOpen ? 'Reabrir' : 'Abrir'}
        </button>
      )}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="input-wrap" style={{ height: 40 }}>
        <span style={{ width: 22, height: 22, borderRadius: 4, background: value, border: '1px solid var(--line-2)', flexShrink: 0 }} />
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} />
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: 32, height: 24, border: 0, background: 'transparent', cursor: 'pointer' }} />
      </div>
    </div>
  )
}

function getBgStyle(theme) {
  if (theme.bgType === 'gradient') return `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`
  if (theme.bgType === 'transparent') return 'repeating-conic-gradient(#1a1410 0 25%, #2a1f17 0 50%) 50% / 14px 14px'
  if (theme.bgType === 'image' && theme.bgImage) return `url("${theme.bgImage}") center/cover`
  if (theme.bgType === 'video') return '#000'
  return theme.bgColor
}

function ThemePreviewInner({ slide, theme }) {
  const showVideo = theme.bgType === 'video' && theme.bgVideo
  const align = theme.textAlign === 'top' ? 'flex-start'
              : theme.textAlign === 'bottom' ? 'flex-end' : 'center'

  const renderSlideContent = (s) => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: align, justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '100%' }}>
        <p style={{
          color: theme.fontColor,
          fontSize: `${theme.fontSize / 1.3}px`,
          fontFamily: theme.fontFamily || 'var(--font-display)',
          fontWeight: theme.fontWeight ?? 500,
          textShadow: theme.textShadow ? '0 4px 20px rgba(0,0,0,0.6)' : 'none',
          lineHeight: 1.25, margin: 0,
        }}>{s.text}</p>
        {s.reference && theme.referenceVisible && (
          <p style={{
            marginTop: 16, fontFamily: 'var(--font-mono)',
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>{s.reference}</p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {showVideo && (
        <video src={theme.bgVideo} autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0 }}>
        <SlideTransition slide={slide} theme={theme} render={renderSlideContent} />
      </div>
    </>
  )
}
