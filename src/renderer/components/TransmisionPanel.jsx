import { useEffect, useState } from 'react'
import {
  IconBroadcast, IconExternal, IconMonitor, IconLayers, IconClock, IconRefresh,
  IconKey, IconX,
} from './Icons.jsx'
import { useSlideStore } from '../services/slideStore.js'
import { useTheme } from '../services/themeStore.js'
import { useLicense } from '../services/licenseStore.js'

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
  const [upgradeModal, setUpgradeModal] = useState(null) // 'overlay' | 'stage' | null
  const { live }  = useSlideStore()
  const theme     = useTheme()
  const license   = useLicense()
  const isProUser = !!license?.licensed &&
                    ['pro_monthly', 'pro_yearly', 'lifetime'].includes(license?.plan)

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

  const open = async (mode) => {
    // Feature gate: overlay + stage requieren Pro
    if (!isProUser && (mode === 'overlay' || mode === 'stage')) {
      setUpgradeModal(mode)
      return
    }
    await window.electron?.projection.open({ mode })
    refresh()
  }
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <OutputCard
                title="Pantalla completa"
                subtitle="Proyector físico · 1920×1080"
                Icon={IconMonitor} accent="copper"
                isOpen={isOpen('background')}
                onOpen={() => open('background')}
                onClose={() => close('background')} />
              <OutputCard
                title="Overlay (Lower-Third)"
                subtitle="Banda transparente para OBS"
                Icon={IconLayers} accent="bible"
                isOpen={isOpen('overlay')}
                onOpen={() => open('overlay')}
                onClose={() => close('overlay')} />
              <OutputCard
                title="Stage Display"
                subtitle="Pantalla del músico/predicador"
                Icon={IconBroadcast} accent="copper"
                isOpen={isOpen('stage')}
                onOpen={() => open('stage')}
                onClose={() => close('stage')} />
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

          {/* Control remoto móvil */}
          <RemoteSection />

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

      {upgradeModal && (
        <UpgradeModal mode={upgradeModal} onClose={() => setUpgradeModal(null)} />
      )}
    </div>
  )
}

// ============================================================
// RemoteSection — URL para conectar el teléfono al PC como mando
// ============================================================
function RemoteSection() {
  const [info, setInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!window.electron?.server) return
    window.electron.server.info().then(setInfo).catch(() => {})
  }, [])

  if (!info) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.remoteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  // QR generado via API pública (offline fallback: solo URL en texto)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&color=f4e6d7&bgcolor=14100d&data=${encodeURIComponent(info.remoteUrl)}`

  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="section-h" style={{ marginBottom: 14 }}>
        <h3>Control remoto desde el móvil</h3>
        <span className="sub">beta · vía WiFi local</span>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{
          width: 180, height: 180, flexShrink: 0,
          background: 'var(--bg-2)', borderRadius: 12,
          border: '1px solid var(--line-1)', padding: 8,
          display: 'grid', placeItems: 'center',
        }}>
          <img
            src={qrUrl}
            width="160" height="160"
            alt="QR code para control remoto"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 12px', lineHeight: 1.55 }}>
            Escanea el código QR con tu teléfono (o introduce la URL en el navegador móvil)
            para usar tu móvil como mando: ←/→, blanco, negro, limpiar slide.
            <br />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
              El móvil debe estar conectado al mismo WiFi que este PC.
            </span>
          </p>

          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 10,
            border: '1px solid var(--line-1)', marginBottom: 8,
          }}>
            <code style={{
              flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--copper-100)', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {info.remoteUrl}
            </code>
            <button className="btn btn-ghost" onClick={copy} style={{ height: 28, fontSize: 11 }}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            Puerto: {info.port} · IP local: {info.ip}
          </p>
        </div>
      </div>
    </div>
  )
}

// Modal "Función Pro" — aparece cuando un usuario Free intenta abrir overlay o stage.
function UpgradeModal({ mode, onClose }) {
  const features = {
    overlay: {
      title: 'Lower-Third para OBS',
      desc: 'Banda transparente capturable por OBS Studio para tu transmisión en vivo. Versículos y letras de canciones con tu marca.',
    },
    stage: {
      title: 'Stage Display',
      desc: 'Pantalla dedicada para el músico o predicador con el slide actual, el reloj y notas. Va en un monitor secundario distinto al del proyector.',
    },
  }
  const f = features[mode] || features.overlay

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ width: 'min(540px, 95vw)', padding: 32, textAlign: 'center' }}>
        <button onClick={onClose} className="btn btn-ghost"
          style={{ position: 'absolute', top: 12, right: 12, padding: 6 }}>
          <IconX size={16} />
        </button>

        <div style={{
          width: 64, height: 64, margin: '0 auto 16px',
          borderRadius: 16, display: 'grid', placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(232,181,145,0.25), rgba(168,95,51,0.15))',
          border: '1px solid rgba(232,181,145,0.30)',
        }}>
          <IconKey size={28} style={{ color: 'var(--copper-200)' }} />
        </div>

        <div style={{
          display: 'inline-block', padding: '4px 10px', borderRadius: 999,
          background: 'linear-gradient(180deg, rgba(232,181,145,0.30), rgba(168,95,51,0.15))',
          color: 'var(--copper-100)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: 12, border: '1px solid rgba(232,181,145,0.25)',
        }}>
          Función Pro
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26,
          color: 'var(--text-1)', margin: '0 0 10px', lineHeight: 1.2 }}>
          {f.title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
          maxWidth: 420, margin: '0 auto 24px' }}>
          {f.desc}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a href="https://eclesia-presenter.vercel.app/pricing" target="_blank" rel="noreferrer"
            className="btn btn-primary" style={{ padding: '10px 22px' }}>
            Ver planes Pro
          </a>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 22px' }}>
            Más tarde
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 18 }}>
          Si ya tienes Pro, activa tu clave en{' '}
          <span style={{ color: 'var(--copper-200)' }}>Ajustes → Licencia</span>.
        </p>
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
  // El overlay solo se identifica por "Lower-Third" en el subtitle.
  const isOverlay = (title || '').includes('Lower-Third') || (title || '').includes('Overlay')
  const [overlayVisible, setOverlayVisible] = useState(false)

  const toggleOverlayView = async () => {
    const next = !overlayVisible
    setOverlayVisible(next)
    try { await window.electron?.projection?.toggleOverlayVisible(next) }
    catch (e) { console.warn('toggleOverlayVisible failed:', e) }
  }

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
        <div style={{ display: 'flex', gap: 8 }}>
          {isOverlay && (
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={toggleOverlayView}
              title={overlayVisible ? 'Volver a minimizar (no estorbar)' : 'Mostrar para verificar lo que captura OBS'}>
              {overlayVisible ? 'Ocultar' : 'Ver overlay'}
            </button>
          )}
          <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cerrar
          </button>
        </div>
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
