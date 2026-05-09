import { useMemo, useState } from 'react'
import { songToSlides } from '../services/songSplit.js'
import {
  IconX, IconPlus, IconArrowUp, IconArrowDown, IconCheck, IconChevDown,
} from './Icons.jsx'

const SECTION_TYPES = [
  { value: 'verse',   label: 'Estrofa' },
  { value: 'chorus',  label: 'Coro' },
  { value: 'bridge',  label: 'Puente' },
  { value: 'intro',   label: 'Intro' },
  { value: 'outro',   label: 'Final' },
  { value: 'tag',     label: 'Tag' },
]

const TEMPLATES = [
  { id: 'simple', label: 'Verso · Coro', structure: [
    { type: 'verse', label: 'Estrofa 1' }, { type: 'chorus', label: 'Coro' },
  ]},
  { id: 'classic', label: 'V · C · V · P · C', structure: [
    { type: 'verse', label: 'Estrofa 1' }, { type: 'chorus', label: 'Coro' },
    { type: 'verse', label: 'Estrofa 2' }, { type: 'chorus', label: 'Coro' },
    { type: 'bridge', label: 'Puente' }, { type: 'chorus', label: 'Coro' },
  ]},
  { id: 'hymn', label: 'Himno (4 estrofas)', structure: [
    { type: 'verse', label: 'Estrofa 1' }, { type: 'verse', label: 'Estrofa 2' },
    { type: 'verse', label: 'Estrofa 3' }, { type: 'verse', label: 'Estrofa 4' },
  ]},
  { id: 'worship', label: 'V · C · P · C · Tag', structure: [
    { type: 'intro', label: 'Intro' }, { type: 'verse', label: 'Estrofa' },
    { type: 'chorus', label: 'Coro' }, { type: 'bridge', label: 'Puente' },
    { type: 'chorus', label: 'Coro' }, { type: 'tag', label: 'Tag' },
  ]},
]

export default function SongEditor({ song, onSave, onCancel }) {
  const [title, setTitle]       = useState(song?.title || '')
  const [author, setAuthor]     = useState(song?.author || '')
  const [tags, setTags]         = useState(song?.tags || '')
  const [sections, setSections] = useState(
    song?.sections?.length ? song.sections : [{ type: 'verse', label: 'Estrofa 1', text: '' }]
  )
  const [maxLines, setMaxLines] = useState(song?.maxLines ?? 4)
  const [tab, setTab] = useState('edit')
  const [activeTpl, setActiveTpl] = useState(null)

  const presentationSlides = useMemo(
    () => songToSlides({ title, sections }, { maxLines }),
    [title, sections, maxLines]
  )

  const applyTemplate = (template) => {
    if (sections.some(s => s.text?.trim()) &&
        !confirm('La canción tiene contenido. ¿Reemplazar con la plantilla? (se mantienen los textos coincidentes)')) return
    const next = template.structure.map((slot, i) => {
      const sameTypeMatch = sections.find((s, j) => s.type === slot.type && j === i)
      return { ...slot, text: sameTypeMatch?.text || '' }
    })
    setSections(next)
    setActiveTpl(template.id)
  }

  const addSection = () => {
    const count = sections.filter(s => s.type === 'verse').length + 1
    setSections([...sections, { type: 'verse', label: `Estrofa ${count}`, text: '' }])
  }
  const updateSection = (i, patch) => setSections(sections.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  const removeSection = (i) => setSections(sections.filter((_, idx) => idx !== i))

  // Convierte la letra de TODAS las secciones a mayúsculas (operación bulk).
  // Útil para canciones que se proyectan estilo broadcast/clásico.
  const upperAll = () => {
    setSections(sections.map(s => ({ ...s, text: (s.text || '').toUpperCase() })))
  }
  // Inverso: deja todo en formato normal (capitalización natural según primera letra).
  const lowerAll = () => {
    setSections(sections.map(s => ({ ...s, text: (s.text || '').toLowerCase() })))
  }
  const moveSection = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const copy = [...sections]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    setSections(copy)
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), author: author.trim(), tags: tags.trim(), sections, maxLines })
  }

  const sliderVal = ((maxLines - 2) / 6 * 100) + '%'

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{song ? 'Editar canción' : 'Nueva canción'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="modal-tabs">
              <button className={'modal-tab ' + (tab === 'edit' ? 'active' : '')} onClick={() => setTab('edit')}>Editar</button>
              <button className={'modal-tab ' + (tab === 'preview' ? 'active' : '')} onClick={() => setTab('preview')}>
                Presentación · {presentationSlides.length}
              </button>
            </div>
            <button className="btn btn-ghost" onClick={onCancel} style={{ padding: 6 }}><IconX size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {tab === 'edit' && (
            <>
              <div className="field-row">
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <span className="label">Título <span className="req">*</span></span>
                  <input className="field-input" placeholder="Nombre de la canción"
                    value={title} onChange={e => setTitle(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <span className="label">Autor / compositor</span>
                  <input className="field-input" placeholder="Ej: Marcos Witt"
                    value={author} onChange={e => setAuthor(e.target.value)} />
                </div>
                <div className="field">
                  <span className="label">Etiquetas</span>
                  <input className="field-input" placeholder="adoración, clásica…"
                    value={tags} onChange={e => setTags(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <span className="label">Plantilla de estructura</span>
                <div className="template-grid">
                  {TEMPLATES.map(t => (
                    <button key={t.id}
                      className={'template-card' + (activeTpl === t.id ? ' active' : '')}
                      onClick={() => applyTemplate(t)}>
                      <span className="template-card-title">{t.label}</span>
                      <span className="template-card-meta">{t.structure.length} secciones</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="split-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Auto-split de slides largos</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                      Máximo de líneas por slide · {maxLines}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--copper-200)' }}>
                    {presentationSlides.length} slides totales
                  </span>
                </div>
                <input type="range" min="2" max="8" value={maxLines}
                  onChange={e => setMaxLines(+e.target.value)} className="slider"
                  style={{ '--val': sliderVal }} />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  Si una sección excede esto, se divide en sub-slides (ej: estrofa de 8 líneas → 2 slides de 4).
                </span>
              </div>

              <div>
                <div className="section-h" style={{ marginBottom: 10 }}>
                  <h3 style={{ fontSize: 14 }}>Letra por secciones</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" onClick={upperAll}
                      title="Convertir toda la letra a mayúsculas">
                      AA · MAYÚS
                    </button>
                    <button className="btn btn-ghost" onClick={lowerAll}
                      title="Convertir toda la letra a minúsculas">
                      aa · minús
                    </button>
                    <button className="btn btn-ghost" onClick={addSection}><IconPlus size={13} /> Sección</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sections.map((section, i) => (
                    <SectionRow key={i} section={section} index={i}
                      total={sections.length} maxLines={maxLines}
                      onChange={(patch) => updateSection(i, patch)}
                      onRemove={() => removeSection(i)}
                      onMove={(dir) => moveSection(i, dir)} />
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'preview' && <PresentationPreview slides={presentationSlides} />}
        </div>

        <div className="modal-footer">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            {sections.length} secciones · {presentationSlides.length} slides al proyectar
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
              <IconCheck size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionRow({ section, index, total, maxLines, onChange, onRemove, onMove }) {
  const lineCount = (section.text || '').split('\n').filter(l => l.trim()).length
  const willSplit = lineCount > maxLines
  const splitCount = Math.ceil(lineCount / maxLines) || 1

  return (
    <div className="section-block">
      <div className="section-head">
        <select className="select" style={{ height: 26, fontSize: 11 }}
          value={section.type} onChange={e => onChange({ type: e.target.value })}>
          {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input className="field-input" value={section.label}
          onChange={e => onChange({ label: e.target.value })}
          placeholder="Etiqueta..."
          style={{ height: 26, flex: 1, fontSize: 12 }} />
        {willSplit && (
          <span className="song-tag" style={{
            background: 'rgba(244,184,64,0.15)', borderColor: 'rgba(244,184,64,0.35)', color: 'var(--preview)',
          }} title={`Esta sección excede ${maxLines} líneas, se proyectará en ${splitCount} slides`}>
            {splitCount} slides
          </span>
        )}
        <button className="btn btn-ghost" onClick={() => onMove(-1)} disabled={index === 0}><IconArrowUp size={12} /></button>
        <button className="btn btn-ghost" onClick={() => onMove(1)} disabled={index === total - 1}><IconArrowDown size={12} /></button>
        <button className="btn btn-ghost btn-danger" onClick={onRemove}><IconX size={12} /></button>
      </div>
      <textarea className="field-input"
        style={{ border: 0, borderRadius: 0, minHeight: 96 }}
        value={section.text} onChange={e => onChange({ text: e.target.value })}
        placeholder="Escribe la letra aquí…&#10;Cada salto de línea se respeta como línea del slide." />
      <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
        {lineCount} línea{lineCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function PresentationPreview({ slides }) {
  if (slides.length === 0) {
    return <p className="empty-text" style={{ textAlign: 'center', padding: 32 }}>
      Sin contenido. Añade letra a las secciones para ver la presentación.
    </p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
        Así se verá la canción al proyectarla — cada caja es un slide independiente al que se navega con ←/→.
      </p>
      {slides.map((slide, i) => (
        <div key={i} style={{
          background: 'linear-gradient(135deg, #14100d, #0a1620)',
          borderRadius: 'var(--r-md)', border: '1px solid var(--line-1)', padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--copper-200)', fontWeight: 700, letterSpacing: '0.08em' }}>
              SLIDE {i + 1} / {slides.length}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
              {slide.sectionLabel} · {slide.sectionType}
            </span>
          </div>
          <p style={{
            color: '#fff', fontSize: 14, fontFamily: 'var(--font-display)',
            whiteSpace: 'pre-line', lineHeight: 1.5, margin: 0,
          }}>{slide.text}</p>
        </div>
      ))}
    </div>
  )
}
