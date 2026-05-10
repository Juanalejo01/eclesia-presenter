import { useEffect, useState } from 'react'
import {
  getKey, setKey, testKey,
  listAvailableBibles, getEnabledBibles, setEnabledBibles,
} from '../services/apiBible.js'
import { useAppSettings, setSettings, pickDirectory } from '../services/appSettingsService.js'
import { refreshImportedVersions } from '../services/bibleService.js'
import { AVAILABLE_LOCALES } from '../services/i18n.js'
import {
  IconX, IconImage, IconVideo, IconMonitor, IconBible, IconMusic,
  IconBroadcast, IconSettings, IconUpload, IconTrash, IconCheck,
} from './Icons.jsx'

const SECTIONS = [
  { id: 'aspecto',      label: 'Aspecto',           Icon: IconSettings },
  { id: 'monitores',    label: 'Monitores',         Icon: IconMonitor },
  { id: 'almacenamiento', label: 'Almacenamiento',  Icon: IconUpload },
  { id: 'audio',        label: 'Audio',             Icon: IconBroadcast },
  { id: 'video',        label: 'Video',             Icon: IconVideo },
  { id: 'biblias',      label: 'Biblias',           Icon: IconBible },
  { id: 'canciones',    label: 'Canciones',         Icon: IconMusic },
  { id: 'apibible',     label: 'API Bible',         Icon: IconBible },
  { id: 'acerca',       label: 'Acerca de',         Icon: IconSettings },
]

export default function Settings({ onClose, onUpdate }) {
  const [section, setSection] = useState('aspecto')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ width: 'min(1100px, 95vw)', maxHeight: '92vh', height: 'min(720px, 92vh)' }}>

        <div className="modal-header" style={{ paddingBottom: 16 }}>
          <div className="modal-title">Ajustes</div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <IconX size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Sidebar */}
          <aside style={{
            width: 220, padding: '12px 8px', borderRight: '1px solid var(--line-1)',
            background: 'var(--bg-1)', overflowY: 'auto',
          }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
                  background: section === s.id
                    ? 'linear-gradient(180deg, rgba(168,95,51,0.18), rgba(128,64,18,0.08))'
                    : 'transparent',
                  color: section === s.id ? 'var(--copper-100)' : 'var(--text-2)',
                  border: section === s.id
                    ? '1px solid rgba(232,181,145,0.25)'
                    : '1px solid transparent',
                  fontSize: 13, fontWeight: section === s.id ? 600 : 500,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s ease', marginBottom: 2,
                }}>
                <s.Icon size={15} /> {s.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            {section === 'aspecto'        && <SectionAspecto />}
            {section === 'monitores'      && <SectionMonitores />}
            {section === 'almacenamiento' && <SectionAlmacenamiento />}
            {section === 'audio'          && <SectionAudio />}
            {section === 'video'          && <SectionVideo />}
            {section === 'biblias'        && <SectionBiblias onUpdate={onUpdate} />}
            {section === 'canciones'      && <SectionCanciones onUpdate={onUpdate} />}
            {section === 'apibible'       && <SectionApiBible onUpdate={onUpdate} />}
            {section === 'acerca'         && <SectionAcerca />}
          </main>
        </div>

        <div className="modal-footer">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            Los cambios se guardan automáticamente
          </span>
          <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ---------- ASPECTO ----------
const THEMES = [
  { id: 'native', label: 'Nativo',     description: 'Cobre cinematográfico',
    swatch: ['#14100d', '#c8794a', '#f4e6d7'] },
  { id: 'dark',   label: 'Oscuro',     description: 'Negro/gris neutro',
    swatch: ['#0b0b0d', '#6b6f9a', '#f0f1f3'] },
  { id: 'light',  label: 'Claro',      description: 'Blanco cálido',
    swatch: ['#fbf8f2', '#c8794a', '#2a1a10'] },
  { id: 'ocean',  label: 'Océano',     description: 'Azul claro fresco',
    swatch: ['#f5f8fc', '#316fa8', '#0d2238'] },
  { id: 'rose',   label: 'Rosa',       description: 'Rosado suave',
    swatch: ['#fef7f8', '#b04860', '#3a1620'] },
]

function SectionAspecto() {
  const settings = useAppSettings()

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Aspecto
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Cambia el aspecto visual de la app. La proyección mantiene su tema independiente.
      </p>

      {/* Idioma */}
      <div className="section-h" style={{ marginBottom: 10 }}>
        <h3>Idioma · Language · Idioma</h3>
        <span className="sub">interfaz de la app</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
        {AVAILABLE_LOCALES.map(loc => {
          const active = settings.locale === loc.id
          return (
            <button key={loc.id} onClick={() => setSettings({ locale: loc.id })}
              className={'template-card' + (active ? ' active' : '')}
              style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--copper-200)', letterSpacing: '0.1em', marginBottom: 4 }}>
                {loc.flag}
              </div>
              <div className="template-card-title">{loc.label}</div>
            </button>
          )
        })}
      </div>

      {/* Tema */}
      <div className="section-h" style={{ marginBottom: 10 }}>
        <h3>Tema visual</h3>
        <span className="sub">{THEMES.length} esquemas</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {THEMES.map(t => {
          const active = settings.theme === t.id
          return (
            <button key={t.id} onClick={() => setSettings({ theme: t.id })}
              className={'template-card' + (active ? ' active' : '')}
              style={{ padding: 14, position: 'relative', textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {t.swatch.map((color, i) => (
                  <span key={i} style={{
                    width: 28, height: 28, borderRadius: 'var(--r-xs)',
                    background: color,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }} />
                ))}
              </div>
              <div className="template-card-title">{t.label}</div>
              <div className="template-card-meta">{t.description}</div>
              {active && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--copper-300)',
                  display: 'grid', placeItems: 'center', color: '#fff',
                }}>
                  <IconCheck size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- MONITORES ----------
function SectionMonitores() {
  const settings = useAppSettings()
  const [displays, setDisplays] = useState([])

  useEffect(() => {
    if (!window.electron?.projection) return
    window.electron.projection.state().then(s => setDisplays(s.displays || []))
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Monitores
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Selecciona en qué pantalla se abre cada salida de proyección por defecto.
      </p>

      {displays.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p className="empty-text">Detectando monitores...</p>
        </div>
      )}

      {displays.length > 0 && (
        <>
          <div className="section-h">
            <h3>Pantallas detectadas</h3>
            <span className="sub">{displays.length} monitor{displays.length > 1 ? 'es' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {displays.map(d => (
              <div key={d.id} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <span className="song-icon"><IconMonitor size={16} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                    {d.label} {d.primary && <span style={{ color: 'var(--copper-200)', fontSize: 11, marginLeft: 6 }}>· principal</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {d.bounds.width} × {d.bounds.height} px
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="song-tag">ID {d.id}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-h" style={{ marginTop: 24 }}>
            <h3>Asignación por defecto</h3>
            <span className="sub">al abrir cada salida</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <DisplaySelector
              label="Pantalla completa (proyector)"
              value={settings.defaultDisplayBackground}
              displays={displays}
              onChange={v => setSettings({ defaultDisplayBackground: v })}
            />
            <DisplaySelector
              label="Overlay (Lower-Third)"
              value={settings.defaultDisplayOverlay}
              displays={displays}
              onChange={v => setSettings({ defaultDisplayOverlay: v })}
            />
          </div>
        </>
      )}
    </div>
  )
}

function DisplaySelector({ label, value, displays, onChange }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <select className="select" style={{ width: '100%', height: 40 }}
        value={value || ''} onChange={e => onChange(e.target.value ? +e.target.value : null)}>
        <option value="">Automática (secundaria)</option>
        {displays.map(d => (
          <option key={d.id} value={d.id}>
            {d.label} {d.primary ? '(principal)' : ''} · {d.bounds.width}×{d.bounds.height}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------- ALMACENAMIENTO ----------
function SectionAlmacenamiento() {
  const settings = useAppSettings()
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!window.electron?.app) return
    window.electron.app.info().then(setInfo)
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Almacenamiento
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Carpetas donde la app guarda canciones, imágenes, videos y datos del usuario.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PathRow
          label="Datos de la app (canciones, ajustes)"
          value={settings.storagePath || info?.userData}
          onChange={v => setSettings({ storagePath: v })}
          fixed
        />
        <PathRow
          label="Carpeta para imágenes"
          value={settings.imagesPath || info?.pictures}
          onChange={v => setSettings({ imagesPath: v })}
        />
        <PathRow
          label="Carpeta para videos"
          value={settings.videosPath || info?.videos}
          onChange={v => setSettings({ videosPath: v })}
        />
        <PathRow
          label="Carpeta para fondos (backgrounds de proyección)"
          value={settings.backgroundsPath || info?.pictures}
          onChange={v => setSettings({ backgroundsPath: v })}
        />
      </div>

      <div className="card" style={{ padding: 14, marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-2)' }}>Sobre el almacenamiento de datos</p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Los datos de la app (SQLite con canciones, biblioteca de medios) se guardan en {info?.userData ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{info.userData}</code> : '...'}.
          Cambiar la ubicación principal mueve la base de datos al nuevo destino. Las carpetas
          de imágenes y videos solo definen dónde se abre el explorador al subir nuevos archivos.
        </p>
      </div>
    </div>
  )
}

function PathRow({ label, value, onChange, fixed }) {
  const handlePick = async () => {
    const dir = await pickDirectory(label)
    if (dir) onChange(dir)
  }
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="input-wrap" style={{ height: 40 }}>
        <input value={value || '(no configurado)'} readOnly
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }} />
        <button className="btn" onClick={handlePick} disabled={fixed}
          style={{ height: 28, padding: '0 12px' }}>
          Cambiar
        </button>
      </div>
    </div>
  )
}

// ---------- AUDIO ----------
function SectionAudio() {
  const settings = useAppSettings()
  const [outputs, setOutputs] = useState([])

  useEffect(() => {
    // Enumera dispositivos de audio (necesita permiso del navegador, en Electron suele ir directo)
    if (!navigator.mediaDevices?.enumerateDevices) return
    navigator.mediaDevices.enumerateDevices()
      .then(devs => setOutputs(devs.filter(d => d.kind === 'audiooutput')))
      .catch(() => {})
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Audio
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Selecciona la salida de audio para los videos proyectados.
        El audio siempre se enruta desde el video — nunca desde el escritorio o programa — para evitar fugas no deseadas.
      </p>

      <div className="field" style={{ marginBottom: 24 }}>
        <span className="label">Salida de audio para videos</span>
        <select className="select" style={{ width: '100%', height: 40 }}
          value={settings.audioOutput} onChange={e => setSettings({ audioOutput: e.target.value })}>
          <option value="default">Predeterminada del sistema</option>
          {outputs.map(o => (
            <option key={o.deviceId} value={o.deviceId}>
              {o.label || `Salida ${o.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 14, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-2)' }}>
          Por qué el audio depende del video
        </p>
        <p style={{ margin: 0 }}>
          Algunos programas envían el audio del escritorio o de fuentes globales,
          lo que mete sonidos no deseados en la transmisión (notificaciones, otros videos, etc.).
          EclesiaPresenter solo reproduce el audio del video que estás proyectando, ruteado a la salida que elijas.
        </p>
      </div>
    </div>
  )
}

// ---------- VIDEO ----------
function SectionVideo() {
  const settings = useAppSettings()

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Video
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Calidad y rendimiento de la reproducción de video proyectado.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="field">
          <span className="label">Calidad de reproducción</span>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
            {[
              { v: 'low',    l: 'Baja' },
              { v: 'medium', l: 'Media' },
              { v: 'high',   l: 'Alta' },
            ].map(o => (
              <button key={o.v}
                className={'modal-tab ' + (settings.videoQuality === o.v ? 'active' : '')}
                style={{ flex: 1 }}
                onClick={() => setSettings({ videoQuality: o.v })}>{o.l}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">Frames por segundo</span>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
            {[24, 30, 60].map(fps => (
              <button key={fps}
                className={'modal-tab ' + (settings.videoFps === fps ? 'active' : '')}
                style={{ flex: 1 }}
                onClick={() => setSettings({ videoFps: fps })}>{fps} fps</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginTop: 24, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}>
          <b style={{ color: 'var(--text-2)' }}>Calidad alta + 60 fps</b> requiere GPU decente. Si notas tirones,
          baja a 30 fps o calidad media. La proyección a pantalla completa siempre intenta el modo nativo del video.
        </p>
      </div>
    </div>
  )
}

// ---------- BIBLIAS ----------
function SectionBiblias({ onUpdate }) {
  const [imported, setImported] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const refresh = async () => {
    if (!window.electron?.bibles) return
    setImported(await window.electron.bibles.listImported())
  }
  useEffect(() => { refresh() }, [])

  const handleImport = async () => {
    if (!window.electron?.bibles) return
    setBusy(true); setMsg(null)
    const r = await window.electron.bibles.import()
    setBusy(false)
    if (r.canceled) return
    if (r.ok) {
      setMsg({ ok: true, text: `✓ "${r.meta.name}" importada (${r.meta.books} libros)` })
      await refreshImportedVersions()  // recarga el registry para que aparezca en BiblePanel
      refresh(); onUpdate?.()
    } else {
      setMsg({ ok: false, text: r.error })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta Biblia importada?')) return
    await window.electron.bibles.deleteImported(id)
    await refreshImportedVersions()
    refresh(); onUpdate?.()
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Biblias
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Importa Biblias adicionales en formato <code>.xmm</code>, <code>.xml</code>, <code>.json</code> o <code>.bib</code>.
      </p>

      <button className="btn btn-primary" onClick={handleImport} disabled={busy}>
        <IconUpload size={14} /> {busy ? 'Importando…' : 'Importar Biblia'}
      </button>

      {msg && (
        <div className="card" style={{ padding: 12, marginTop: 12, fontSize: 12,
          background: msg.ok ? 'rgba(107, 207, 142, 0.08)' : 'rgba(255, 61, 61, 0.08)',
          borderColor: msg.ok ? 'rgba(107, 207, 142, 0.3)' : 'rgba(255, 61, 61, 0.3)',
          color: msg.ok ? 'var(--ready)' : 'var(--live)' }}>
          {msg.text}
        </div>
      )}

      <div className="section-h" style={{ marginTop: 24 }}>
        <h3>Biblias importadas</h3>
        <span className="sub">{imported.length} {imported.length === 1 ? 'versión' : 'versiones'}</span>
      </div>

      {imported.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <p className="empty-text">Aún no has importado ninguna Biblia personalizada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {imported.map(b => (
            <div key={b.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="song-icon bible"><IconBible size={16} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {b.books} libros · importada {new Date(b.addedAt).toLocaleDateString()}
                </div>
              </div>
              <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(b.id)}>
                <IconTrash size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 14, marginTop: 24, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--text-2)' }}>Formatos soportados</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><b>.xmm / .xml</b> — formato MyBible / OpenSong (XML con etiquetas <code>&lt;b&gt;&lt;c&gt;&lt;v&gt;</code>)</li>
          <li><b>.json</b> — array de libros con <code>{`{ name, abbrev, chapters: [[v1,v2,...]] }`}</code></li>
          <li><b>.bib</b> — se intenta parsear como XML</li>
        </ul>
      </div>
    </div>
  )
}

// ---------- CANCIONES ----------
function SectionCanciones({ onUpdate }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleExport = async () => {
    if (!window.electron?.songs) return
    setBusy(true); setMsg(null)
    const r = await window.electron.songs.export()
    setBusy(false)
    if (r.canceled) return
    setMsg({ ok: r.ok, text: r.ok ? `✓ ${r.count} canciones exportadas a ${r.path}` : r.error })
  }

  const handleImport = async () => {
    if (!window.electron?.songs) return
    setBusy(true); setMsg(null)
    const r = await window.electron.songs.import()
    setBusy(false)
    if (r.canceled) return
    if (r.ok) {
      setMsg({ ok: true, text: `✓ ${r.count} de ${r.total} canciones importadas` })
      onUpdate?.()
    } else {
      setMsg({ ok: false, text: r.error })
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Canciones — copia de seguridad
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Exporta toda tu biblioteca a un archivo JSON (para backup o migrar a otro PC) e importa de vuelta cuando lo necesites.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={handleExport} disabled={busy}>
          <IconUpload size={14} style={{ transform: 'rotate(180deg)' }} /> Exportar todas
        </button>
        <button className="btn" onClick={handleImport} disabled={busy}>
          <IconUpload size={14} /> Importar desde JSON
        </button>
      </div>

      {msg && (
        <div className="card" style={{ padding: 12, marginTop: 14, fontSize: 12,
          background: msg.ok ? 'rgba(107, 207, 142, 0.08)' : 'rgba(255, 61, 61, 0.08)',
          borderColor: msg.ok ? 'rgba(107, 207, 142, 0.3)' : 'rgba(255, 61, 61, 0.3)',
          color: msg.ok ? 'var(--ready)' : 'var(--live)' }}>
          {msg.text}
        </div>
      )}

      <div className="card" style={{ padding: 14, marginTop: 24, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--text-2)' }}>Formato del archivo</p>
        <p style={{ margin: 0 }}>
          El JSON exportado incluye título, autor, etiquetas, todas las secciones (con su tipo, label y letra) y la
          configuración de auto-split. Es un formato legible — puedes abrirlo en cualquier editor de texto.
        </p>
      </div>
    </div>
  )
}

// ---------- API BIBLE (heredado del Settings antiguo) ----------
function SectionApiBible({ onUpdate }) {
  const [keyValue, setKeyValue]       = useState(getKey())
  const [testing, setTesting]         = useState(false)
  const [testResult, setTestResult]   = useState(null)
  const [discovering, setDiscovering] = useState(false)
  const [available, setAvailable]     = useState([])
  const [discoveryError, setError]    = useState(null)
  const [enabled, setEnabled]         = useState(getEnabledBibles())

  useEffect(() => { if (keyValue) handleTest() }, [])

  const handleTest = async () => {
    setTesting(true); setTestResult(null)
    const result = await testKey(keyValue)
    setTesting(false); setTestResult(result)
    if (result.ok) setKey(keyValue)
  }
  const handleDiscover = async () => {
    setDiscovering(true); setError(null); setKey(keyValue)
    try { setAvailable(await listAvailableBibles('spa')) }
    catch (e) { setError(e.message) }
    setDiscovering(false)
  }
  const isEnabled = (id) => enabled.some(e => e.id === id)
  const toggleBible = (bible) => {
    const next = isEnabled(bible.id) ? enabled.filter(e => e.id !== bible.id) : [...enabled, bible]
    setEnabled(next); setEnabledBibles(next); onUpdate?.()
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>API.Bible</h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Conecta versiones bajo copyright (TLA, RVR60, NVI, DHH, etc.) usando una API key gratuita de
        <a href="https://scripture.api.bible" target="_blank" rel="noreferrer" style={{ color: 'var(--copper-200)', marginLeft: 4 }}>
          scripture.api.bible
        </a>.
      </p>

      <div className="field">
        <span className="label">API key</span>
        <div className="input-wrap" style={{ height: 40 }}>
          <input type="password" value={keyValue} onChange={e => setKeyValue(e.target.value)}
            placeholder="Pega tu key aquí" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <button className="btn btn-primary" onClick={handleTest} disabled={!keyValue || testing}
            style={{ height: 28, padding: '0 12px' }}>
            {testing ? '...' : 'Probar'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className="card" style={{ padding: 12, marginTop: 12, fontSize: 12,
          background: testResult.ok ? 'rgba(107, 207, 142, 0.08)' : 'rgba(255, 61, 61, 0.08)',
          borderColor: testResult.ok ? 'rgba(107, 207, 142, 0.3)' : 'rgba(255, 61, 61, 0.3)',
          color: testResult.ok ? 'var(--ready)' : 'var(--live)' }}>
          {testResult.ok ? `✓ Conexión OK · ${testResult.count} Biblias en español` : `✗ ${testResult.error}`}
        </div>
      )}

      {testResult?.ok && (
        <div style={{ marginTop: 18 }}>
          <div className="section-h">
            <h3>Biblias disponibles</h3>
            <button className="btn" onClick={handleDiscover} disabled={discovering}>
              {discovering ? 'Cargando…' : (available.length > 0 ? 'Recargar' : 'Listar')}
            </button>
          </div>

          {discoveryError && (
            <div className="card" style={{ padding: 12, fontSize: 12, color: 'var(--live)' }}>
              {discoveryError}
            </div>
          )}

          {available.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
              {available.map(bible => {
                const on = isEnabled(bible.id)
                return (
                  <button key={bible.id} onClick={() => toggleBible(bible)}
                    className="card" style={{
                      padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
                      borderColor: on ? 'rgba(232,181,145,0.4)' : 'var(--line-1)',
                      background: on
                        ? 'linear-gradient(180deg, rgba(168,95,51,0.18), var(--bg-1))'
                        : undefined,
                    }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 'var(--r-xs)', flexShrink: 0,
                      background: on ? 'var(--copper-300)' : 'transparent',
                      border: '1px solid ' + (on ? 'var(--copper-300)' : 'var(--line-2)'),
                      display: 'grid', placeItems: 'center', color: '#fff',
                    }}>{on && <IconCheck size={12} />}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{bible.abbr}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{bible.nameLocal}</span>
                      </div>
                      {bible.copyright && (
                        <p style={{ margin: 4, fontSize: 11, color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bible.copyright}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- ACERCA DE ----------
function SectionAcerca() {
  const [info, setInfo] = useState(null)
  useEffect(() => {
    if (window.electron?.app) window.electron.app.info().then(setInfo)
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>
        EclesiaPresenter
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 24px' }}>
        Software de presentación para iglesias.
      </p>

      <div className="card" style={{ padding: 18, fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8 }}>
          <span style={{ color: 'var(--text-3)' }}>Versión</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{info?.version || '0.2.0'}</span>
          <span style={{ color: 'var(--text-3)' }}>Datos del usuario</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{info?.userData || '...'}</span>
          <span style={{ color: 'var(--text-3)' }}>Repositorio</span>
          <a href="https://github.com/Juanalejo01/eclesia-presenter" target="_blank" rel="noreferrer"
            style={{ color: 'var(--copper-200)' }}>
            github.com/Juanalejo01/eclesia-presenter
          </a>
          <span style={{ color: 'var(--text-3)' }}>Licencia</span>
          <span>MIT</span>
        </div>
      </div>
    </div>
  )
}
