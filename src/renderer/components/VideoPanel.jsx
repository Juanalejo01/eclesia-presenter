import { useEffect, useRef, useState } from 'react'
import {
  listMedia, pickMedia, deleteMedia, getMediaURL,
} from '../services/mediaService.js'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import {
  IconUpload, IconVideo, IconTrash, IconArrowRight, IconPlus, IconPlay, IconPause,
} from './Icons.jsx'

/**
 * Panel "Video" — proyecta videos (informes, anuncios, intros).
 * Envía un slide con bgType=video que se reproduce en la ventana de proyección.
 */
export default function VideoPanel({ onSendSlide }) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [caption, setCaption] = useState('')
  const [reference, setReference] = useState('')
  const [loop, setLoop] = useState(true)
  const [muted, setMuted] = useState(true)
  const [videoFit, setVideoFit] = useState('cover')

  const refresh = async () => {
    setLoading(true)
    try { setItems(await listMedia({ type: 'video' })) }
    catch (e) { console.error(e) }
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  const handleUpload = async () => {
    const added = await pickMedia('video')
    await refresh()
    if (added?.[0]) setSelected(added[0])
  }

  const project = (item, withCaption = false) => {
    setSelected(item)
    onSendSlide({
      type: 'video',
      text: withCaption ? caption : '',
      reference: withCaption ? reference : '',
      bgType: 'video',
      bgVideo: getMediaURL(item),
      videoLoop: loop,
      videoMuted: muted,
      videoFit,
    })
  }

  const addToList = (item) => {
    addToSchedule({
      type: 'video',
      title: caption || item.name || 'Video',
      text: caption || '',
      reference: reference || '',
      meta: { bgType: 'video', bgVideo: getMediaURL(item), loop, muted, videoFit },
    })
  }

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Video</h1>
          <span className="ws-sub">{items.length} videos · informes, anuncios e intros</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleUpload}>
            <IconUpload size={14} /> Subir video
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Ajuste de video */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-h" style={{ marginBottom: 10 }}>
              <h3>Ajuste del video</h3>
              <span className="sub">cómo encaja en pantalla 16:9</span>
            </div>
            <div className="field">
              <span className="label">Modo</span>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
                {[
                  { v: 'cover',   l: 'Cubrir (recorta)' },
                  { v: 'contain', l: 'Contener (con barras)' },
                  { v: 'fill',    l: 'Estirar (deforma)' },
                ].map(o => (
                  <button key={o.v}
                    className={'modal-tab ' + (videoFit === o.v ? 'active' : '')}
                    style={{ flex: 1 }}
                    onClick={() => setVideoFit(o.v)}>{o.l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Reproducción + caption */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-h">
              <h3>Texto sobre el video <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span></h3>
              <span className="sub">Con bucle y mute por defecto</span>
            </div>
            <div className="field-row">
              <div className="field">
                <span className="label">Texto principal</span>
                <input className="field-input" value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder='Ej: "Informe misionero 2026"' />
              </div>
              <div className="field">
                <span className="label">Referencia / subtítulo</span>
                <input className="field-input" value={reference} onChange={e => setReference(e.target.value)}
                  placeholder='Ej: "Hermano Pablo · 3 min"' />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
                Reproducir en bucle
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={muted} onChange={e => setMuted(e.target.checked)} />
                Sin sonido (recomendado para fondo)
              </label>

              <span style={{ flex: 1 }} />

              {selected && (
                <>
                  <button className="btn" onClick={() => addToList(selected)}>
                    <IconPlus size={13} /> Lista
                  </button>
                  <button className="btn btn-primary" onClick={() => project(selected, !!(caption || reference))}>
                    <IconArrowRight size={13} /> Proyectar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Galería de videos */}
          <div>
            <div className="section-h">
              <h3>Biblioteca</h3>
              <span className="sub">{loading ? 'cargando…' : `${items.length} elementos`}</span>
            </div>

            {items.length === 0 && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: 40, borderStyle: 'dashed' }}>
                <IconVideo size={36} style={{ color: 'var(--text-4)', marginBottom: 12 }} />
                <p className="empty-text">No hay videos todavía. Sube el primero.</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {items.map(item => (
                <VideoTile key={item.id}
                  item={item}
                  isSelected={selected?.id === item.id}
                  onSelect={() => setSelected(item)}
                  onProject={() => project(item)}
                  onDelete={async () => {
                    if (confirm(`¿Eliminar "${item.name}"?`)) {
                      await deleteMedia(item.id); refresh()
                      if (selected?.id === item.id) setSelected(null)
                    }
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoTile({ item, isSelected, onSelect, onProject, onDelete }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const url = getMediaURL(item)

  const togglePlay = (e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  return (
    <div onClick={onSelect}
      style={{
        position: 'relative', aspectRatio: '16 / 11',
        borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'pointer',
        border: '1px solid ' + (isSelected ? 'rgba(232,181,145,0.5)' : 'var(--line-1)'),
        boxShadow: isSelected ? 'var(--shadow-glow-copper)' : 'var(--shadow-1)',
        background: '#000',
        transition: 'all 0.18s ease',
      }}>
      <video ref={videoRef} src={url} muted loop playsInline preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Bottom actions overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
        display: 'flex', alignItems: 'flex-end', padding: 10, gap: 6,
      }}>
        <button className="btn btn-ghost"
          style={{ background: 'rgba(0,0,0,0.5)', height: 28, width: 28, padding: 0, justifyContent: 'center' }}
          onClick={togglePlay} title={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <IconPause size={12} /> : <IconPlay size={12} />}
        </button>
        <button className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center', height: 28, fontSize: 11 }}
          onClick={(e) => { e.stopPropagation(); onProject() }}>
          <IconArrowRight size={12} /> Proyectar
        </button>
        <button className="btn btn-ghost btn-danger"
          style={{ height: 28, padding: '0 8px' }}
          onClick={(e) => { e.stopPropagation(); onDelete() }}>
          <IconTrash size={12} />
        </button>
      </div>

      {isSelected && (
        <span className="tally live" style={{ position: 'absolute', top: 8, left: 8, fontSize: 9 }}>
          <span className="led" /> Activo
        </span>
      )}

      <div style={{
        position: 'absolute', top: 0, right: 0,
        fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)',
        padding: '4px 8px', background: 'rgba(0,0,0,0.5)',
        borderBottomLeftRadius: 'var(--r-xs)',
      }}>
        {item.name?.slice(0, 22) || '—'}
      </div>
    </div>
  )
}
