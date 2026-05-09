import { useEffect, useMemo, useState } from 'react'
import {
  getAllVersions, getActiveVersion, setActiveVersion,
  getBooks, getChapter, getChapterCount, searchText, combineVerses,
} from '../services/bibleService.js'
import { normalizeText } from '../services/textUtils.js'
import { subscribe } from '../hooks/useShortcuts.js'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import { IconSearch, IconPlus, IconArrowRight } from './Icons.jsx'

/**
 * Flujo de navegación:
 *   step='book'    → grid de libros
 *   step='chapter' → grid numérico de capítulos del libro seleccionado
 *   step='verse'   → grid numérico de versículos del capítulo + texto del versículo activo
 *   ESC retrocede un paso, también hay breadcrumbs visibles para navegar.
 */
export default function BiblePanel({ onSendSlide }) {
  const [versions, setVersions] = useState(getAllVersions())
  const [versionId, setVersionId] = useState(getActiveVersion().id)

  const [books, setBooks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [bookSearch, setBookSearch] = useState('')
  const [textSearch, setTextSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const [step, setStep]           = useState('book')   // 'book' | 'chapter' | 'verse'
  const [selectedBookIndex, setSelectedBookIndex] = useState(null)
  const [chapterNum, setChapterNum] = useState(1)
  const [maxChapters, setMaxChapters] = useState(0)

  const [chapter, setChapter] = useState(null)
  const [chapterLoading, setChapterLoading] = useState(false)
  const [selectedVerses, setSelectedVerses] = useState([])

  // Cambio de versión
  useEffect(() => {
    setVersions(getAllVersions())
    setActiveVersion(versionId)
    setLoading(true); setLoadError(null); setBooks([])
    setStep('book'); setSelectedBookIndex(null); setChapter(null)
    getBooks(versionId)
      .then(b => { setBooks(b); setLoading(false) })
      .catch(err => { setLoadError(err.message); setLoading(false) })
  }, [versionId])

  // Click sobre un libro
  const pickBook = async (bookIndex) => {
    setSelectedBookIndex(bookIndex)
    setChapterNum(1); setSelectedVerses([])
    const count = await getChapterCount(bookIndex, versionId)
    setMaxChapters(count)
    setStep('chapter')
  }

  // Click sobre un capítulo
  const pickChapter = async (n) => {
    setChapterNum(n); setSelectedVerses([])
    setChapterLoading(true)
    try {
      const c = await getChapter(selectedBookIndex, n, versionId)
      setChapter(c); setChapterLoading(false)
      setStep('verse')
    } catch (err) {
      setLoadError(err.message); setChapterLoading(false)
    }
  }

  // Click sobre un versículo (selección)
  const toggleVerse = (verseNum, event) => {
    if (event?.shiftKey && selectedVerses.length > 0) {
      const anchor = selectedVerses[0]
      const [from, to] = [Math.min(anchor, verseNum), Math.max(anchor, verseNum)]
      const range = []
      for (let i = from; i <= to; i++) range.push(i)
      setSelectedVerses(range); return
    }
    if (event?.ctrlKey || event?.metaKey) {
      setSelectedVerses(prev =>
        prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum].sort((a, b) => a - b)
      )
      return
    }
    setSelectedVerses([verseNum])
  }

  const goBack = () => {
    if (step === 'verse')        { setStep('chapter'); setSelectedVerses([]) }
    else if (step === 'chapter') { setStep('book'); setSelectedBookIndex(null); setChapter(null) }
  }

  // Búsqueda de texto
  useEffect(() => {
    if (textSearch.length < 3) { setSearchResults([]); return }
    const t = setTimeout(() => {
      searchText(textSearch, 30, versionId).then(setSearchResults).catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [textSearch, versionId])

  // Envío al live cuando cambian versículos seleccionados
  useEffect(() => {
    if (!chapter || selectedVerses.length === 0) return
    const versesData = chapter.verses.filter(v => selectedVerses.includes(v.verseNum))
    const combined = combineVerses(chapter.bookName, chapter.chapterNum, versesData)
    if (combined) onSendSlide({ ...combined, type: 'bible' })
  }, [selectedVerses, chapter])

  // Atajos: navegación + ESC retrocede + ←/→ entre versículos
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Escape') {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, selectedBookIndex])

  useEffect(() => {
    if (step !== 'verse' || !chapter) return
    const max = chapter.verses.length
    const next = () => {
      const current = selectedVerses[0] ?? 0
      if (current < max) setSelectedVerses([current + 1])
      else if (chapterNum < maxChapters) {
        const n = chapterNum + 1
        setChapterNum(n); setSelectedVerses([1])
        getChapter(selectedBookIndex, n, versionId).then(setChapter)
      }
    }
    const prev = () => {
      const current = selectedVerses[0] ?? 1
      if (current > 1) setSelectedVerses([current - 1])
      else if (chapterNum > 1) {
        const n = chapterNum - 1
        setChapterNum(n)
        getChapter(selectedBookIndex, n, versionId).then(setChapter)
      }
    }
    const offNext  = subscribe('navigate:next', next)
    const offPrev  = subscribe('navigate:prev', prev)
    const offClear = subscribe('selection:clear', () => setSelectedVerses([]))
    return () => { offNext(); offPrev(); offClear() }
  }, [step, chapter, chapterNum, maxChapters, selectedVerses, selectedBookIndex])

  const filteredBooks = useMemo(() => {
    if (!bookSearch) return books
    const q = normalizeText(bookSearch)
    return books.filter(b => normalizeText(b.name).includes(q))
  }, [books, bookSearch])

  const activeVersion = versions.find(v => v.id === versionId)
  const isRemote = activeVersion?.type === 'apibible'
  const currentBook = selectedBookIndex !== null ? books[selectedBookIndex] : null

  const addCurrentToList = () => {
    if (!chapter || selectedVerses.length === 0) return
    const versesData = chapter.verses.filter(v => selectedVerses.includes(v.verseNum))
    const combined = combineVerses(chapter.bookName, chapter.chapterNum, versesData)
    if (combined) addToSchedule({
      type: 'bible', title: combined.reference, text: combined.text, reference: combined.reference,
      meta: { bookIndex: selectedBookIndex, chapterNum, verseNums: [...selectedVerses] },
    })
  }

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Biblia</h1>
          <span className="ws-sub">
            {books.length > 0 && `${books.length} libros · `}{activeVersion?.license}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={versionId} onChange={e => setVersionId(e.target.value)} className="select" style={{ height: 32 }}>
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                {v.short}{v.type === 'apibible' ? ' 🔒' : ''}{v.type === 'placeholder' ? ' ⚠' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadError && (
            <div style={{
              background: 'rgba(244, 184, 64, 0.1)', border: '1px solid rgba(244, 184, 64, 0.4)',
              borderRadius: 'var(--r-md)', padding: 12, fontSize: 13, color: 'var(--preview)',
            }}>⚠️ {loadError}</div>
          )}

          {loading && <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '16px 0' }}>Cargando {activeVersion?.short}...</div>}

          {!loading && !loadError && books.length > 0 && (
            <>
              {/* Búsqueda de texto */}
              {!isRemote && (
                <div>
                  <div className="input-wrap">
                    <IconSearch size={15} className="input-icon" />
                    <input placeholder='Buscar texto, versículo o referencia (sin tildes ok)'
                      value={textSearch} onChange={e => setTextSearch(e.target.value)} />
                    <span className="input-kbd"><span className="kbd">/</span></span>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="card" style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto', padding: 6 }}>
                      {searchResults.map((r, i) => (
                        <div key={i}
                          onClick={async () => {
                            setSelectedBookIndex(r.bookIndex)
                            const count = await getChapterCount(r.bookIndex, versionId)
                            setMaxChapters(count)
                            setChapterNum(r.chapterNum)
                            const c = await getChapter(r.bookIndex, r.chapterNum, versionId)
                            setChapter(c)
                            setSelectedVerses([r.verseNum])
                            setStep('verse')
                            setTextSearch('')
                          }}
                          style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <p style={{ fontSize: 11, color: 'var(--copper-200)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                            {r.reference}
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0 0' }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isRemote && (
                <p className="empty-text" style={{ fontStyle: 'italic' }}>
                  Búsqueda de texto deshabilitada en versiones remotas (cada consulta usa cuota de tu API key).
                </p>
              )}

              {/* Breadcrumb / navegación */}
              <Breadcrumb step={step} bookName={currentBook?.name} chapterNum={chapterNum} onBack={goBack} />

              {/* STEP: BOOKS */}
              {step === 'book' && (
                <div>
                  <div className="section-h">
                    <h3>Libros</h3>
                    <span className="sub">{books.length} · {activeVersion?.short}</span>
                  </div>
                  <div className="input-wrap" style={{ marginBottom: 10 }}>
                    <IconSearch size={14} className="input-icon" />
                    <input placeholder="Buscar libro (sin tildes)..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                  </div>
                  <div className="book-grid" style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
                    {filteredBooks.map(book => (
                      <div key={book.index}
                        className="book-item"
                        onClick={() => pickBook(book.index)}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: CHAPTERS */}
              {step === 'chapter' && currentBook && (
                <div>
                  <div className="section-h">
                    <h3>{currentBook.name}</h3>
                    <span className="sub">{maxChapters} capítulos · ESC para volver</span>
                  </div>
                  <NumberGrid
                    count={maxChapters}
                    onPick={pickChapter}
                  />
                </div>
              )}

              {/* STEP: VERSES */}
              {step === 'verse' && chapter && (
                <div>
                  <div className="section-h" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <h3>{currentBook?.name} {chapter.chapterNum}</h3>
                      <span className="sub">{chapter.verses.length} versículos · ESC volver</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 6 }}>
                        {selectedVerses.length > 0
                          ? `${selectedVerses.length} seleccionado${selectedVerses.length > 1 ? 's' : ''}`
                          : 'Click · Shift = rango · Ctrl = agregar'}
                      </span>
                      <button className="btn btn-ghost" onClick={() => setSelectedVerses([])} disabled={!selectedVerses.length}>Limpiar</button>
                      <button className="btn" onClick={() => setSelectedVerses(chapter.verses.map(v => v.verseNum))}>Todos</button>
                      <button className="btn" onClick={addCurrentToList} disabled={!selectedVerses.length}>
                        <IconPlus size={12} /> Lista
                      </button>
                    </div>
                  </div>

                  {/* Grid numérico de versículos */}
                  <NumberGrid
                    count={chapter.verses.length}
                    selectedNumbers={selectedVerses}
                    onPick={(n, e) => toggleVerse(n, e)}
                  />

                  {/* Texto del versículo activo */}
                  {selectedVerses.length > 0 && (
                    <div className="card" style={{ marginTop: 12, padding: 16 }}>
                      {selectedVerses
                        .sort((a, b) => a - b)
                        .map(vNum => {
                          const verse = chapter.verses.find(v => v.verseNum === vNum)
                          if (!verse) return null
                          return (
                            <div key={vNum} style={{ display: 'flex', gap: 14, padding: '6px 0' }}>
                              <span className="verse-num" style={{ minWidth: 32 }}>{vNum}</span>
                              <span className="verse-text">{verse.text}</span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Breadcrumb({ step, bookName, chapterNum, onBack }) {
  const crumbs = []
  crumbs.push({ label: 'Libros', active: step === 'book' })
  if (bookName) crumbs.push({ label: bookName, active: step === 'chapter' })
  if (step === 'verse' && chapterNum) crumbs.push({ label: `Capítulo ${chapterNum}`, active: true })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 12, color: 'var(--text-3)',
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {i > 0 && <IconArrowRight size={11} />}
          <span style={{
            color: c.active ? 'var(--copper-100)' : 'var(--text-3)',
            fontWeight: c.active ? 600 : 400,
          }}>{c.label}</span>
        </span>
      ))}
      {step !== 'book' && (
        <>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onBack}
            style={{ fontSize: 11, height: 26 }}>
            ← Volver <span className="kbd" style={{ marginLeft: 4 }}>ESC</span>
          </button>
        </>
      )}
    </div>
  )
}

function NumberGrid({ count, selectedNumbers = [], onPick }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
      gap: 6,
    }}>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => {
        const sel = selectedNumbers.includes(n)
        return (
          <button key={n}
            onClick={(e) => onPick(n, e)}
            style={{
              aspectRatio: '1', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
              borderRadius: 'var(--r-sm)',
              background: sel
                ? 'linear-gradient(180deg, rgba(168, 95, 51, 0.32), rgba(128, 64, 18, 0.22))'
                : 'var(--bg-2)',
              color: sel ? 'var(--copper-50)' : 'var(--text-2)',
              border: '1px solid ' + (sel ? 'rgba(232,181,145,0.45)' : 'var(--line-1)'),
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              boxShadow: sel ? 'var(--shadow-glow-copper)' : 'none',
            }}
            onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--line-2)' } }}
            onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--line-1)' } }}
            title={`Versículo ${n}`}>
            {n}
          </button>
        )
      })}
    </div>
  )
}
