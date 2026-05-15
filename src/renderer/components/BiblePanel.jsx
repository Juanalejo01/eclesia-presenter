import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getAllVersions, getVisibleVersions, getActiveVersion, setActiveVersion,
  getBooks, getChapter, getChapterCount, searchText, combineVerses, splitLongVerse,
} from '../services/bibleService.js'
import { normalizeText } from '../services/textUtils.js'
import { subscribe } from '../hooks/useShortcuts.js'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import { useT } from '../services/i18n.js'
import { useLicense, isPro } from '../services/licenseStore.js'
import { IconSearch, IconPlus, IconArrowRight } from './Icons.jsx'

/**
 * Flujo de navegación:
 *   step='book'    → grid de libros
 *   step='chapter' → grid numérico de capítulos del libro seleccionado
 *   step='verse'   → grid numérico de versículos del capítulo + texto del versículo activo
 *   ESC retrocede un paso, también hay breadcrumbs visibles para navegar.
 */
export default function BiblePanel({ onSendSlide }) {
  const t = useT()
  const license = useLicense()
  const pro = !!license && ['pro_monthly', 'pro_yearly', 'lifetime'].includes(license.plan)
  const [versions, setVersions] = useState(getVisibleVersions(pro))
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

  // Sub-slides cuando un versículo es muy largo y se divide en partes.
  // verseSlides = array de {text, reference, part?, totalParts?}
  // verseSlideIdx = índice activo dentro de verseSlides
  const [verseSlides, setVerseSlides] = useState([])
  const [verseSlideIdx, setVerseSlideIdx] = useState(0)

  // Cambio de versión
  useEffect(() => {
    setVersions(getVisibleVersions(pro))
    setActiveVersion(versionId)
    setLoading(true); setLoadError(null); setBooks([])
    setStep('book'); setSelectedBookIndex(null); setChapter(null)
    getBooks(versionId)
      .then(b => { setBooks(b); setLoading(false) })
      .catch(err => { setLoadError(err.message); setLoading(false) })
  }, [versionId, pro])

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
    else if (step === 'chapter') { setStep('book'); setSelectedBookIndex(null); setChapter(null); setBookSearch('') }
  }

  // Navegación directa via breadcrumb
  const goToBooks = () => {
    setStep('book'); setSelectedBookIndex(null); setChapter(null); setSelectedVerses([]); setBookSearch('')
  }
  const goToChapters = () => {
    if (selectedBookIndex !== null) { setStep('chapter'); setSelectedVerses([]) }
  }

  // Auto-focus de los buscadores al entrar en cada step
  const bookSearchRef = useRef(null)
  useEffect(() => {
    if (step === 'book') {
      // pequeño delay para que el input ya esté en DOM
      requestAnimationFrame(() => bookSearchRef.current?.focus())
    }
  }, [step])

  // Parser del query del buscador. Acepta:
  //   "salmos"            → solo libro
  //   "salmos 22"         → libro + capítulo
  //   "salmos 22:1"       → libro + capítulo + versículo
  //   "salmos 22 1"       → mismo que :1 (espacio en vez de :)
  //   "salmos 22:1-5"     → rango de versículos
  const parsedQuery = useMemo(() => {
    if (!bookSearch?.trim()) return { bookText: '', chapter: null, verse: null, verseEnd: null }
    // Unificar separadores ":" y "-"
    const norm = bookSearch.trim().replace(/\s*:\s*/g, ' ').replace(/\s*-\s*/g, '-')
    const tokens = norm.split(/\s+/)
    const result = { bookText: '', chapter: null, verse: null, verseEnd: null }
    // Quitar números (y rangos a-b) del final, en orden inverso
    while (tokens.length > 0) {
      const last = tokens[tokens.length - 1]
      const rangeMatch = last.match(/^(\d+)-(\d+)$/)
      if (rangeMatch) {
        // Rango "1-5"
        result.verseEnd = +rangeMatch[2]
        result.verse   = +rangeMatch[1]
        tokens.pop()
      } else if (/^\d+$/.test(last)) {
        if (result.verse == null && result.chapter == null) {
          // primer número desde el final → si solo hay uno, es capítulo
          result.chapter = +last
        } else if (result.verse == null) {
          // ya tenemos chapter, este es verse
          result.verse = result.chapter
          result.chapter = +last
        }
        tokens.pop()
      } else {
        break
      }
    }
    result.bookText = tokens.join(' ')
    return result
  }, [bookSearch])

  // Función auxiliar para navegar directo a libro+capítulo+versículo
  const goToReference = async (bookIndex, chapter, verse, verseEnd) => {
    setSelectedBookIndex(bookIndex)
    const count = await getChapterCount(bookIndex, versionId)
    setMaxChapters(count)

    if (!chapter || chapter > count) {
      // Solo libro → mostrar capítulos
      setChapterNum(1)
      setSelectedVerses([])
      setStep('chapter')
      return
    }

    setChapterNum(chapter)
    setChapterLoading(true)
    try {
      const c = await getChapter(bookIndex, chapter, versionId)
      setChapter(c)
      setChapterLoading(false)
      if (verse && verse <= c.verses.length) {
        // Seleccionar versículo o rango
        if (verseEnd && verseEnd >= verse && verseEnd <= c.verses.length) {
          const range = []
          for (let i = verse; i <= verseEnd; i++) range.push(i)
          setSelectedVerses(range)
        } else {
          setSelectedVerses([verse])
        }
      } else {
        setSelectedVerses([])
      }
      setStep('verse')
    } catch (err) {
      setLoadError(err.message)
      setChapterLoading(false)
    }
  }

  // Enter en el buscador: navega según lo que se haya tipeado
  const onBookSearchKey = (e) => {
    if (e.key === 'Enter') {
      const first = filteredBooks[0]
      if (!first) return
      e.preventDefault()
      if (parsedQuery.chapter || parsedQuery.verse) {
        goToReference(first.index, parsedQuery.chapter, parsedQuery.verse, parsedQuery.verseEnd)
        setBookSearch('')
      } else {
        pickBook(first.index)
        setBookSearch('')
      }
    } else if (e.key === 'Escape' && bookSearch) {
      e.stopPropagation()
      setBookSearch('')
    }
  }

  // Búsqueda de texto
  useEffect(() => {
    if (textSearch.length < 3) { setSearchResults([]); return }
    const t = setTimeout(() => {
      searchText(textSearch, 30, versionId).then(setSearchResults).catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [textSearch, versionId])

  // Búsqueda lanzada desde el móvil (`socket → App → emit('bible:remote-search')`).
  // El móvil envía algo tipo `{ query: "salmos 22:1" }`; nosotros lo parseamos
  // con la misma logica del buscador local y navegamos automáticamente.
  useEffect(() => {
    return subscribe('bible:remote-search', (payload) => {
      const query = payload?.query?.trim()
      if (!query) return
      // Parsear igual que parsedQuery
      const norm = query.replace(/\s*:\s*/g, ' ').replace(/\s*-\s*/g, '-')
      const tokens = norm.split(/\s+/)
      let chapter = null, verse = null, verseEnd = null
      while (tokens.length > 0) {
        const last = tokens[tokens.length - 1]
        const rangeMatch = last.match(/^(\d+)-(\d+)$/)
        if (rangeMatch) { verseEnd = +rangeMatch[2]; verse = +rangeMatch[1]; tokens.pop() }
        else if (/^\d+$/.test(last)) {
          if (verse == null && chapter == null) chapter = +last
          else if (verse == null) { verse = chapter; chapter = +last }
          tokens.pop()
        } else break
      }
      const bookText = tokens.join(' ')
      if (!bookText) return
      const q = normalizeText(bookText)
      const match = books.find(b => normalizeText(b.name).includes(q))
      if (match) {
        goToReference(match.index, chapter, verse, verseEnd)
      } else {
        // No encontramos libro: lo dejamos como filtro escrito en el buscador
        // para que el usuario vea el estado.
        setBookSearch(query)
      }
    })
  }, [books, versionId])

  // Envío al live cuando cambian versículos seleccionados.
  // Si el texto excede ~280 caracteres, se divide en N sub-slides
  // navegables con ←/→ antes de saltar al siguiente versículo.
  useEffect(() => {
    if (!chapter || selectedVerses.length === 0) {
      setVerseSlides([])
      setVerseSlideIdx(0)
      return
    }
    const versesData = chapter.verses.filter(v => selectedVerses.includes(v.verseNum))
    const combined = combineVerses(chapter.bookName, chapter.chapterNum, versesData)
    if (!combined) return
    const splits = splitLongVerse(combined)
    setVerseSlides(splits)
    setVerseSlideIdx(0)
    onSendSlide({ ...splits[0], type: 'bible' })
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
      // Si estamos en medio de un versículo largo dividido, avanzar a la siguiente parte
      if (verseSlides.length > 1 && verseSlideIdx < verseSlides.length - 1) {
        const newIdx = verseSlideIdx + 1
        setVerseSlideIdx(newIdx)
        onSendSlide({ ...verseSlides[newIdx], type: 'bible' })
        return
      }
      // Si no, saltar al siguiente versículo
      const current = selectedVerses[0] ?? 0
      if (current < max) setSelectedVerses([current + 1])
      else if (chapterNum < maxChapters) {
        const n = chapterNum + 1
        setChapterNum(n); setSelectedVerses([1])
        getChapter(selectedBookIndex, n, versionId).then(setChapter)
      }
    }
    const prev = () => {
      // Si estamos en parte 2+ de un versículo dividido, retroceder
      if (verseSlides.length > 1 && verseSlideIdx > 0) {
        const newIdx = verseSlideIdx - 1
        setVerseSlideIdx(newIdx)
        onSendSlide({ ...verseSlides[newIdx], type: 'bible' })
        return
      }
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
  }, [step, chapter, chapterNum, maxChapters, selectedVerses, selectedBookIndex, verseSlides, verseSlideIdx])

  const filteredBooks = useMemo(() => {
    const text = parsedQuery.bookText
    if (!text) return books
    const q = normalizeText(text)
    return books.filter(b => normalizeText(b.name).includes(q))
  }, [books, parsedQuery.bookText])

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
          <h1 className="ws-h1">{t('nav.bible')}</h1>
          <span className="ws-sub">
            {books.length > 0 && `${t('bible.subtitle', { n: books.length })} · `}{activeVersion?.license}
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

          {loading && <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '16px 0' }}>{t('bible.loadingBibles', { short: activeVersion?.short })}</div>}

          {!loading && !loadError && books.length > 0 && (
            <>
              {/* Búsqueda de texto */}
              {!isRemote && (
                <div>
                  <div className="input-wrap">
                    <IconSearch size={15} className="input-icon" />
                    <input placeholder={t('bible.searchText')}
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
                  {t('bible.searchRemoteDisabled')}
                </p>
              )}

              {/* Breadcrumb / navegación (clickable) */}
              <Breadcrumb
                step={step}
                bookName={currentBook?.name}
                chapterNum={chapterNum}
                onBack={goBack}
                onGoBooks={goToBooks}
                onGoChapters={goToChapters}
              />

              {/* STEP: BOOKS */}
              {step === 'book' && (
                <div>
                  <div className="section-h">
                    <h3>{t('bible.books')}</h3>
                    <span className="sub">{books.length} · {activeVersion?.short}</span>
                  </div>
                  <div className="input-wrap" style={{ marginBottom: 10 }}>
                    <IconSearch size={14} className="input-icon" />
                    <input
                      ref={bookSearchRef}
                      autoFocus
                      placeholder='ej: "sal", "salmos 22", "salmos 22:1", "juan 3 16"'
                      value={bookSearch}
                      onChange={e => setBookSearch(e.target.value)}
                      onKeyDown={onBookSearchKey}
                    />
                    {bookSearch && filteredBooks.length > 0 && (
                      <span style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em', pointerEvents: 'none',
                      }}>
                        ↵ {filteredBooks[0].name}
                        {parsedQuery.chapter ? ` ${parsedQuery.chapter}` : ''}
                        {parsedQuery.verse ? `:${parsedQuery.verse}` : ''}
                        {parsedQuery.verseEnd ? `-${parsedQuery.verseEnd}` : ''}
                      </span>
                    )}
                  </div>
                  <div className="book-grid" style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
                    {filteredBooks.map((book, i) => (
                      <div key={book.index}
                        className={'book-item' + (i === 0 && bookSearch ? ' book-item-suggested' : '')}
                        onClick={() => pickBook(book.index)}
                        style={i === 0 && bookSearch ? {
                          border: '1px solid var(--copper-200)',
                          background: 'linear-gradient(180deg, rgba(168, 95, 51, 0.18), rgba(128, 64, 18, 0.08))',
                        } : undefined}>
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
                    <span className="sub">{maxChapters} {t('bible.chapters')} · {t('bible.escBack')}</span>
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
                      <span className="sub">{chapter.verses.length} {t('bible.verses')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 6 }}>
                        {selectedVerses.length > 0
                          ? t(selectedVerses.length === 1 ? 'bible.selectedCount' : 'bible.selectedCountPlural', { n: selectedVerses.length })
                          : t('bible.selectionInfo')}
                      </span>
                      <button className="btn btn-ghost" onClick={() => setSelectedVerses([])} disabled={!selectedVerses.length}>{t('common.clear')}</button>
                      <button className="btn" onClick={() => setSelectedVerses(chapter.verses.map(v => v.verseNum))}>{t('common.all')}</button>
                      <button className="btn" onClick={addCurrentToList} disabled={!selectedVerses.length}>
                        <IconPlus size={12} /> {t('songs.list')}
                      </button>
                    </div>
                  </div>

                  {/* Grid numérico de versículos (jump rápido) */}
                  <NumberGrid
                    count={chapter.verses.length}
                    selectedNumbers={selectedVerses}
                    onPick={(n, e) => toggleVerse(n, e)}
                  />

                  {/* Lista COMPLETA de versículos con texto — clickable, scrollable.
                      Antes solo se mostraban los seleccionados (perdías el contexto).
                      Ahora ves todo el capítulo y puedes clickar/Shift-clickar/Ctrl-clickar
                      cualquier versículo igual que en el NumberGrid. */}
                  <div className="card" style={{
                    marginTop: 12, padding: 12,
                    maxHeight: 'calc(100vh - 480px)',
                    minHeight: 200,
                    overflowY: 'auto',
                  }}>
                    {chapter.verses.map(v => {
                      const isSelected = selectedVerses.includes(v.verseNum)
                      return (
                        <div
                          key={v.verseNum}
                          onClick={(e) => toggleVerse(v.verseNum, e)}
                          style={{
                            display: 'flex', gap: 14, padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: 8,
                            background: isSelected
                              ? 'linear-gradient(180deg, rgba(168, 95, 51, 0.22), rgba(128, 64, 18, 0.10))'
                              : 'transparent',
                            border: '1px solid ' + (isSelected ? 'rgba(232,181,145,0.35)' : 'transparent'),
                            transition: 'background 0.12s',
                            marginBottom: 2,
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--bg-3)'
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent'
                          }}
                          title={isSelected ? 'Click para quitar · Shift+click rango · Ctrl+click múltiple' : 'Click para seleccionar'}
                        >
                          <span className="verse-num" style={{
                            minWidth: 32,
                            color: isSelected ? 'var(--copper-100)' : 'var(--copper-200)',
                          }}>{v.verseNum}</span>
                          <span className="verse-text" style={{
                            color: isSelected ? 'var(--text-1)' : 'var(--text-2)',
                            fontSize: 14, lineHeight: 1.6,
                          }}>{v.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Breadcrumb({ step, bookName, chapterNum, onBack, onGoBooks, onGoChapters }) {
  // Cada crumb tiene un handler de click. El crumb activo se ve resaltado pero
  // también es clickable (no-op si ya estás ahí).
  const crumbs = [
    { label: 'Libros',                  active: step === 'book',    onClick: onGoBooks },
  ]
  if (bookName) {
    crumbs.push({ label: bookName,      active: step === 'chapter', onClick: onGoChapters })
  }
  if (step === 'verse' && chapterNum) {
    crumbs.push({ label: `Capítulo ${chapterNum}`, active: true, onClick: null })
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 12, color: 'var(--text-3)',
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <IconArrowRight size={11} />}
          <button
            type="button"
            onClick={c.onClick || undefined}
            disabled={c.active && !c.onClick}
            style={{
              all: 'unset',
              cursor: c.onClick && !c.active ? 'pointer' : 'default',
              color: c.active ? 'var(--copper-100)' : 'var(--text-3)',
              fontWeight: c.active ? 600 : 500,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 12,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (c.onClick && !c.active) e.currentTarget.style.background = 'var(--bg-3)'
            }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {c.label}
          </button>
        </span>
      ))}

      {/* Botón ESC justo al lado de la guía (sin flex: 1 separador) */}
      {step !== 'book' && (
        <button className="btn btn-ghost" onClick={onBack}
          style={{ fontSize: 11, height: 26, marginLeft: 4 }}
          title="Atrás (Esc)">
          ← Atrás <span className="kbd" style={{ marginLeft: 4 }}>ESC</span>
        </button>
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
