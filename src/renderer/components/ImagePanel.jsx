import { useEffect, useRef, useState } from 'react'
import {
  listMedia, pickMedia, addFiles, deleteMedia, getMediaURL,
} from '../services/mediaService.js'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import {
  IconUpload, IconImage, IconTrash, IconArrowRight, IconPlus,
} from './Icons.jsx'
import { useT } from '../services/i18n.js'

/**
 * Panel "Imagen" — proyecta imágenes (anuncios, fondos, fotos de eventos).
 * Envía un slide con bgType=image + texto opcional (titular/anuncio).
 */
export default function ImagePanel({ onSendSlide }) {
  const t = useT()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [caption, setCaption] = useState('')
  const [reference, setReference] = useState('')
  const [imageFit, setImageFit] = useState('contain')
  const [bgImageBlur, setBgImageBlur] = useState(16)
  const [dragActive, setDragActive] = useState(false)
  const dragCounter = useRef(0)

  const refresh = async () => {
    setLoading(true)
    try { setItems(await listMedia({ type: 'image' })) }
    catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const handleUpload = async () => {
    const added = await pickMedia('image')
    await refresh()
    if (added?.[0]) setSelected(added[0])
  }

  // Drag & drop: arrastra archivos al panel para añadirlos sin pulsar Subir
  const onDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer?.types?.includes('Files')) setDragActive(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) { setDragActive(false); dragCounter.current = 0 }
  }
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const onDrop = async (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false); dragCounter.current = 0
    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return
    const added = await addFiles(files, 'image')
    await refresh()
    if (added?.[0]) setSelected(added[0])
  }

  const project = (item, withCaption = false) => {
    setSelected(item)
    onSendSlide({
      type: 'image',
      text: withCaption ? caption : '',
      reference: withCaption ? reference : '',
      bgType: 'image',
      bgImage: getMediaURL(item),
      imageFit,
      bgImageBlur,
    })
  }

  const projectCaption = () => selected && project(selected, true)

  const addToList = (item) => {
    addToSchedule({
      type: 'image',
      title: caption || item.name || 'Imagen',
      text: caption || '',
      reference: reference || '',
      meta: { bgType: 'image', bgImage: getMediaURL(item), imageFit, bgImageBlur },
    })
  }

  return (
    <div className="workspace"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ position: 'relative' }}>

      {/* Overlay visual cuando se arrastra un archivo encima */}
      {dragActive && (
        <div style={{
          position: 'absolute', inset: 16, zIndex: 50,
          border: '2px dashed var(--copper-300)',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(168, 95, 51, 0.08)',
          display: 'grid', placeItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center', color: 'var(--copper-100)' }}>
            <IconUpload size={36} />
            <p style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>{t('image.dropHere')}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              {t('image.dropImagesOnly')}
            </p>
          </div>
        </div>
      )}

      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">{t('image.title')}</h1>
          <span className="ws-sub">{t('image.subtitle', { n: items.length })}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleUpload}>
            <IconUpload size={14} /> {t('image.upload')}
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Ajuste de imagen */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-h" style={{ marginBottom: 10 }}>
              <h3>{t('image.fitTitle')}</h3>
              <span className="sub">{t('image.fitSubtitle')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <span className="label">{t('image.fitMode')}</span>
                <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)' }}>
                  {[
                    { v: 'cover',   l: t('image.fit.cover') },
                    { v: 'contain', l: t('image.fit.contain') },
                    { v: 'fill',    l: t('image.fit.fill') },
                  ].map(o => (
                    <button key={o.v}
                      className={'modal-tab ' + (imageFit === o.v ? 'active' : '')}
                      style={{ flex: 1 }}
                      onClick={() => setImageFit(o.v)}>{o.l}</button>
                  ))}
                </div>
              </div>
              {imageFit === 'contain' && (
                <div className="field">
                  <span className="label">{t('image.fitBlur', { n: bgImageBlur })}</span>
                  <input type="range" min="0" max="50" value={bgImageBlur}
                    onChange={e => setBgImageBlur(+e.target.value)}
                    className="slider"
                    style={{ '--val': (bgImageBlur / 50 * 100) + '%' }} />
                </div>
              )}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-3)' }}>
              {t('image.fitHelp')}
            </p>
          </div>

          {/* Caption opcional */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-h">
              <h3>{t('image.captionTitle')}</h3>
              <span className="sub">{t('image.captionSubtitle')}</span>
            </div>
            <div className="field-row">
              <div className="field">
                <span className="label">{t('image.captionMain')}</span>
                <input className="field-input" value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder={t('image.captionMainPh')} />
              </div>
              <div className="field">
                <span className="label">{t('image.captionRef')}</span>
                <input className="field-input" value={reference} onChange={e => setReference(e.target.value)}
                  placeholder={t('image.captionRefPh')} />
              </div>
            </div>
            {selected && (caption || reference) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => addToList(selected)}>
                  <IconPlus size={13} /> {t('songs.list')}
                </button>
                <button className="btn btn-primary" onClick={projectCaption}>
                  <IconArrowRight size={13} /> {t('image.projectCaption')}
                </button>
              </div>
            )}
          </div>

          {/* Galería */}
          <div>
            <div className="section-h">
              <h3>{t('image.libraryTitle')}</h3>
              <span className="sub">{loading ? t('common.loading') : `${items.length}`}</span>
            </div>

            {items.length === 0 && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: 40, borderStyle: 'dashed' }}>
                <IconImage size={36} style={{ color: 'var(--text-4)', marginBottom: 12 }} />
                <p className="empty-text">{t('image.libraryEmpty')}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {items.map(item => {
                const url = getMediaURL(item)
                const isSel = selected?.id === item.id
                return (
                  <div key={item.id}
                    onClick={() => setSelected(item)}
                    style={{
                      position: 'relative', aspectRatio: '16 / 11',
                      borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'pointer',
                      border: '1px solid ' + (isSel ? 'rgba(232,181,145,0.5)' : 'var(--line-1)'),
                      boxShadow: isSel ? 'var(--shadow-glow-copper)' : 'var(--shadow-1)',
                      background: '#000',
                      transition: 'all 0.18s ease',
                    }}>
                    <img src={url} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Hover/selection actions */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                      display: 'flex', alignItems: 'flex-end', padding: 10, gap: 6,
                      opacity: isSel ? 1 : 0, transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = isSel ? 1 : 0}>
                      <button className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center', height: 28, fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); project(item) }}>
                        <IconArrowRight size={12} /> {t('image.project')}
                      </button>
                      <button className="btn btn-ghost btn-danger"
                        style={{ height: 28, padding: '0 8px' }}
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm(t('image.deleteConfirm', { name: item.name }))) {
                            await deleteMedia(item.id); refresh()
                            if (selected?.id === item.id) setSelected(null)
                          }
                        }}>
                        <IconTrash size={12} />
                      </button>
                    </div>

                    {isSel && (
                      <span className="tally live" style={{ position: 'absolute', top: 8, left: 8, fontSize: 9 }}>
                        <span className="led" /> {t('image.activeBadge')}
                      </span>
                    )}

                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)',
                      padding: '4px 8px', background: 'rgba(0,0,0,0.5)',
                      borderBottomLeftRadius: 'var(--r-xs)',
                    }}>
                      {item.name?.slice(0, 18) || '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
