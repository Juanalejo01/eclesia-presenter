import { useEffect, useState } from 'react'
import {
  listSongs, createSong, updateSong, deleteSong, toggleFavorite, isUsingSQLite,
} from '../services/songsService.js'
import SongEditor from './SongEditor.jsx'
import { subscribe } from '../hooks/useShortcuts.js'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import { songToSlides } from '../services/songSplit.js'
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconArrowRight,
  IconStar, IconStarFill, IconMusic, IconRefresh,
} from './Icons.jsx'

export default function SongsPanel({ onSendSlide }) {
  const [songs, setSongs]           = useState([])
  const [search, setSearch]         = useState('')
  const [onlyFavorites, setFavOnly] = useState(false)  // 'Servicio del día' = canciones marcadas para hoy
  const [selected, setSelected]     = useState(null)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [editing, setEditing]       = useState(null)

  const refresh = async () => {
    const data = await listSongs({ search, onlyFavorites })
    setSongs(data)
  }

  useEffect(() => {
    const t = setTimeout(refresh, 200)
    return () => clearTimeout(t)
  }, [search, onlyFavorites])

  const handleSave = async (data) => {
    if (editing === 'new') await createSong(data)
    else                   await updateSong(editing.id, data)
    setEditing(null)
    refresh()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta canción?')) return
    await deleteSong(id)
    if (selected?.id === id) setSelected(null)
    refresh()
  }

  const handleFavorite = async (id) => {
    await toggleFavorite(id)
    refresh()
  }

  const flatSlides = selected
    ? songToSlides(selected, { maxLines: selected.maxLines ?? 4 })
    : []
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => { setSlideIndex(0) }, [selected?.id])

  const sendSlide = (idx) => {
    if (!flatSlides[idx]) return
    setSlideIndex(idx)
    setSectionIndex(flatSlides[idx].sectionIndex)
    onSendSlide({
      text: flatSlides[idx].text,
      reference: flatSlides[idx].reference,
      type: 'song',
    })
  }

  const handleSendSection = (song, section, idx) => {
    setSelected(song)
    setSectionIndex(idx)
    const slides = songToSlides(song, { maxLines: song.maxLines ?? 4 })
    const firstSlideOfSection = slides.findIndex(s => s.sectionIndex === idx)
    if (firstSlideOfSection !== -1) {
      setSlideIndex(firstSlideOfSection)
      onSendSlide({
        text: slides[firstSlideOfSection].text,
        reference: slides[firstSlideOfSection].reference,
        type: 'song',
      })
    }
  }

  useEffect(() => {
    if (flatSlides.length === 0) return
    const next = () => sendSlide(Math.min(flatSlides.length - 1, slideIndex + 1))
    const prev = () => sendSlide(Math.max(0, slideIndex - 1))
    const offNext = subscribe('navigate:next', next)
    const offPrev = subscribe('navigate:prev', prev)
    return () => { offNext(); offPrev() }
  }, [selected, slideIndex, flatSlides.length])

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Canciones</h1>
          <span className="ws-sub">
            {songs.length} canciones · {isUsingSQLite() ? 'SQLite' : 'localStorage (preview)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><IconRefresh size={14} /> Importar</button>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <IconPlus size={14} /> Nueva canción
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <IconSearch size={15} className="input-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título, autor o etiqueta (sin tildes ok)…" />
              <span className="input-kbd"><span className="kbd">/</span></span>
            </div>
            <button
              className={'btn' + (onlyFavorites ? ' btn-primary' : '')}
              onClick={() => setFavOnly(v => !v)}
              title="Filtra solo las canciones marcadas para el servicio del día">
              {onlyFavorites ? <IconStarFill size={14} /> : <IconStar size={14} />} Servicio del día
            </button>
            {onlyFavorites && songs.some(s => s.is_favorite) && (
              <button className="btn btn-ghost btn-danger"
                onClick={async () => {
                  if (!confirm('¿Quitar todas las canciones de la selección del día?')) return
                  for (const s of songs.filter(x => x.is_favorite)) {
                    await toggleFavorite(s.id)
                  }
                  refresh()
                }}
                title="Quita la marca de servicio del día a TODAS las canciones marcadas">
                Limpiar lista
              </button>
            )}
          </div>

          {songs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="empty-text">
                {search || onlyFavorites ? 'Sin resultados' : 'No hay canciones todavía. Crea la primera.'}
              </p>
            </div>
          )}

          <div>
            {songs.map(song => {
              const expanded = selected?.id === song.id
              return (
                <div key={song.id}>
                  <div className="song-row" style={expanded ? { borderColor: 'rgba(232, 181, 145, 0.4)' } : {}}>
                    <span className="drag-handle">
                      <span className="dot" /><span className="dot" />
                      <span className="dot" /><span className="dot" />
                      <span className="dot" /><span className="dot" />
                    </span>
                    <span className="song-icon"><IconMusic size={16} /></span>
                    <div className="song-info" onClick={() => setSelected(expanded ? null : song)}>
                      <div className="song-title">
                        {song.title}
                        {song.is_favorite && <span style={{ color: 'var(--copper-200)' }}><IconStarFill size={11} /></span>}
                        {song.tags && song.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                          <span key={t} className="song-tag">{t}</span>
                        ))}
                      </div>
                      <div className="song-meta">
                        <span className="author">{song.author || 'Sin autor'}</span>
                        {song.sections?.length > 0 && (
                          <>
                            <span style={{ margin: '0 8px', color: 'var(--text-4)' }}>·</span>
                            {song.sections.length} secciones
                          </>
                        )}
                      </div>
                    </div>
                    <span className="song-actions">
                      <button className="btn btn-ghost" onClick={() => handleFavorite(song.id)}
                        title={song.is_favorite ? 'Quitar favorito' : 'Marcar favorito'}>
                        {song.is_favorite
                          ? <span style={{ color: 'var(--copper-200)' }}><IconStarFill size={13} /></span>
                          : <IconStar size={13} />}
                      </button>
                      <button className="btn btn-ghost"
                        onClick={() => addToSchedule({
                          type: 'song', title: song.title,
                          text: song.sections?.[0]?.text || song.title,
                          reference: song.author || '',
                          meta: { songId: song.id, sections: song.sections },
                        })}
                        title="Añadir a lista del día">
                        <IconPlus size={13} /> Lista
                      </button>
                      <button className="btn btn-ghost" onClick={() => setEditing(song)} title="Editar">
                        <IconEdit size={13} />
                      </button>
                      <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(song.id)} title="Eliminar">
                        <IconTrash size={13} />
                      </button>
                    </span>
                  </div>

                  {/* Expanded sections */}
                  {expanded && song.sections?.length > 0 && (
                    <div style={{
                      margin: '4px 0 8px 36px', paddingLeft: 14,
                      borderLeft: '2px solid var(--line-2)',
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      {song.sections.map((section, i) => {
                        const active = sectionIndex === i
                        return (
                          <button key={i}
                            onClick={() => handleSendSection(song, section, i)}
                            style={{
                              textAlign: 'left', padding: '8px 12px',
                              borderRadius: 'var(--r-sm)', cursor: 'pointer',
                              background: active
                                ? 'linear-gradient(180deg, rgba(168,95,51,0.22), rgba(128,64,18,0.14))'
                                : 'transparent',
                              border: '1px solid ' + (active ? 'rgba(232,181,145,0.35)' : 'transparent'),
                              transition: 'all 0.15s ease',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span style={{
                                fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                                color: active ? 'var(--copper-100)' : 'var(--copper-200)', fontWeight: 600,
                              }}>{section.label}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                · {section.type}
                              </span>
                            </div>
                            <p style={{
                              fontSize: 12, color: 'var(--text-2)', margin: 0,
                              whiteSpace: 'pre-line',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>{section.text}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {editing && (
        <SongEditor
          song={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
