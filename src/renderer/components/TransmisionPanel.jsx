import { useEffect, useState } from 'react'
import {
  IconBroadcast, IconExternal, IconMonitor, IconLayers, IconClock, IconRefresh,
} from './Icons.jsx'
import { useSlideStore } from '../services/slideStore.js'
import { useTheme } from '../services/themeStore.js'

/**
 * Panel "Transmisión" — estado de las salidas de proyección/streaming.
 * Muestra qué ventanas están abiertas, en qué pantalla, y guías para integrar
 * el overlay transparente con OBS Studio.
 */
export default function TransmisionPanel() {
  const [hasElectron] = useState(() => !!window.electron?.projection)
  const [openModes, setOpenModes] = useState([])
  const [displays, setDisplays]   = useState([])
  const [uptime, setUptime]       = useState(Date.now())
  const [now, setNow]             = useState(Date.now())
  const [uptimeStarted, setUptimeStarted] = useState(false)
  const { live }  = useSlideStore()
  const theme     = useTheme()

  const refresh = async () => {
    if (!hasElectron) return
    const s = await window.electron.projection.state()
    setOpenModes(s.open)
    setDisplays(s.displays)
  }

  useEffect(() => {
    refresh()
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [hasElectron])

  const isOpen = (mode) => openModes.includes(mode)

  // Marca el inicio de transmisión cuando se abre la primera ventana
  useEffect(() => {
    if (openModes.length > 0 && !uptimeStarted) {
      setUptime(Date.now()); setUptimeStarted(true)
    }
    if (openModes.length === 0) setUptimeStarted(false)
  }, [openModes.length, uptimeStarted])

  const elapsed = uptimeStarted ? Math.floor((now - uptime) / 1000) : 0
  const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  const open  = async (mode) => { await window.electron?.projection.open({ mode }); refresh() }
  const close = async (mode) => { await window.electron?.projection.close(mode); refresh() }

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Transmisión</h1>
          <span className="ws-sub">Estado de salidas y guía de captura para OBS</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={refresh}><IconRefresh size={14} /> Refrescar</button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <StatCard label="Estado"
              value={openModes.length > 0 ? 'AL AIRE' : 'INACTIVO'}
              accent={openModes.length > 0 ? 'live' : 'off'}
              Icon={IconBroadcast} />
            <StatCard label="Salidas activas"
              value={`${openModes.length} / 2`}
              sub={openModes.join(' + ') || 'ninguna'} />
            <StatCard label="Tiempo en aire"
              value={`${hh}:${mm}:${ss}`}
              sub="desde primera ventana"
              Icon={IconClock} mono />
            <StatCard label="Pantallas detectadas"
              value={displays.length || 1}
              sub={displays.find(d => d.primary)?.label || 'principal'} />
          </div>

          {/* Ventanas de salida */}
          <div>
            <div className="section-h">
              <h3>Ventanas de proyección</h3>
              <span className="sub">control directo</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <OutputCard
                title="Pantalla completa"
                subtitle="Proyector físico · 1920×1080 con fondo del tema"
                Icon={IconMonitor} accent="copper"
                isOpen={isOpen('background')}
                onOpen={() => open('background')}
                onClose={() => close('background')} />
              <OutputCard
                title="Overlay (Lower-Third)"
                subtitle="Banda inferior transparente · capturable por OBS"
                Icon={IconLayers} accent="bible"
                isOpen={isOpen('overlay')}
                onOpen={() => open('overlay')}
                onClose={() => close('overlay')} />
            </div>
          </div>

          {/* Estado del slide actual */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-h" style={{ marginBottom: 14 }}>
              <h3>Slide en aire</h3>
              <span className="sub">{live ? live.type : 'sin slide activo'}</span>
            </div>
            {!live && (
              <p className="empty-text" style={{ textAlign: 'center', padding: 32 }}>
                No hay nada proyectándose ahora mismo.
              </p>
            )}
            {live && (
              <div style={{
                padding: 18, borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, #0a1620, #14100d)',
                border: '1px solid var(--line-1)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 22,
                  color: theme.fontColor || '#f4e6d7', margin: 0, lineHeight: 1.3,
                }}>{live.text || <em style={{ color: 'var(--text-3)' }}>(sin texto)</em>}</p>
                {live.reference && (
                  <p style={{
                    marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11,
                    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--copper-200)',
                  }}>{live.reference}</p>
                )}
              </div>
            )}
          </div>

          {/* Guía OBS */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-h" style={{ marginBottom: 14 }}>
              <h3>Capturar en OBS Studio</h3>
              <span className="sub">overlay transparente</span>
            </div>
            <ObsGuide />
          </div>

          {/* Diagnóstico técnico */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-h" style={{ marginBottom: 14 }}>
              <h3>Diagnóstico</h3>
              <span className="sub">técnico</span>
            </div>
            <DiagRow label="Modo Electron"
              value={hasElectron ? 'Activo (acceso a ventanas nativas)' : 'No disponible (modo navegador, solo preview)'}
              ok={hasElectron} />
            <DiagRow label="Cantidad de pantallas" value={`${displays.length} detectada(s)`} ok={displays.length > 0} />
            <DiagRow label="Salidas abiertas"
              value={openModes.length > 0 ? openModes.join(', ') : 'ninguna'}
              ok={openModes.length > 0} />
            <DiagRow label="Tema activo"
              value={`${theme.bgType}${theme.bgType === 'gradient' ? ` (${theme.bgGradient[0]} → ${theme.bgGradient[1]})` : ''}`}
              ok />
            <DiagRow label="Tipografía" value={theme.fontFamily || 'Cormorant Garamond (default)'} ok />
            <DiagRow label="Transición" value={`${theme.transitionType || 'fade'} · ${theme.transitionDuration ?? 500}ms`} ok />
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, Icon, mono, accent }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="label" style={{ margin: 0 }}>{label}</span>
        {Icon && <Icon size={14} style={{ color: 'var(--text-3)' }} />}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 600,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        color: accent === 'live' ? 'var(--live)' : accent === 'off' ? 'var(--text-3)' : 'var(--text-1)',
        letterSpacing: mono ? '0.04em' : '-0.01em',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  )
}

function OutputCard({ title, subtitle, Icon, accent, isOpen, onOpen, onClose }) {
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
      {isOpen ? (
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Cerrar ventana
        </button>
      ) : (
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpen}>
          <IconExternal size={14} /> Abrir
        </button>
      )}
    </div>
  )
}

function DiagRow({ label, value, ok }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--line-1)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: ok ? 'var(--ready)' : 'var(--text-4)',
          boxShadow: ok ? '0 0 8px var(--ready)' : 'none',
        }} />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{value}</span>
      </span>
    </div>
  )
}

function ObsGuide() {
  return (
    <ol style={{
      margin: 0, paddingLeft: 22, color: 'var(--text-2)', fontSize: 13, lineHeight: 1.7,
    }}>
      <li>
        Abre la ventana <b>Overlay (Lower-Third)</b> con el botón de arriba.
        Vive en una posición fuera de pantalla — no estorba a tu vista normal.
      </li>
      <li>
        En OBS Studio: <b>Sources</b> → <b>+ Add</b> → <b>Window Capture</b>.
      </li>
      <li>
        Selecciona la ventana <code style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 11 }}>EclesiaPresenter — Overlay (OBS)</code>.
      </li>
      <li>
        Capture Method: <b>Windows 10 (1903 and up)</b>. Marca <b>Allow Transparency</b>.
      </li>
      <li>
        El resultado será una banda inferior con el texto del slide, sobre fondo transparente.
        Posicionala en tu escena principal sobre la cámara o el contenido.
      </li>
      <li>
        El resto de la ventana (1920×1080) es transparente, así que <b>solo se verá la banda inferior</b>.
        Si tu escena es 1080p, encajará exacto sin ajustes.
      </li>
      <li>
        Para usar el proyector físico de la iglesia abre la ventana <b>Pantalla completa</b> en cambio.
        Esa muestra el fondo del tema (gradientes, imagen, vídeo) y el slide centrado.
      </li>
    </ol>
  )
}
