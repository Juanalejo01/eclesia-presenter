import { useEffect, useMemo, useRef, useState } from 'react'
import { listSongs } from '../services/songsService.js'
import { searchText, getActiveVersion, getChapter, combineVerses, getChapterCount } from '../services/bibleService.js'
import { normalizeText } from '../services/textUtils.js'
import { selectSlide, setLive } from '../services/slideStore.js'
import { useT } from '../services/i18n.js'
import { songToSlides } from '../services/songSplit.js'
import {
  IconSearch, IconBible, IconMusic, IconSettings, IconArrowRight,
  IconList, IconImage, IconVideo, IconType, IconBroadcast, IconProjector, IconX,
} from './Icons.jsx'

/**
 * Command Palette estilo Cmd+K. Búsqueda global de:
 *   - Canciones (matched por título, autor, etiquetas)
 *   - Versículos por referencia (regex "Juan 3:16", "Genesis 1:1-3")
 *   - Búsqueda de texto en la Biblia activa (3+ caracteres)
 *   - Navegación a paneles
 *   - Acciones rápidas (limpiar pantalla, abrir ajustes…)
 *
 * Atajos:
 *   - Ctrl+B / Cmd+B abren el palette
 *   - Esc cierra
 *   - ↑↓ navegan resultados
 *   - Enter ejecuta
 */

const PANEL_ITEMS = [
  { id: 'bible',       Icon: IconBible,      i18n: 'nav.bible' },
  { id: 'songs',       Icon: IconMusic,      i18n: 'nav.songs' },
  { id: 'schedule',    Icon: IconList,       i18n: 'nav.schedule' },
  { id: 'image',       Icon: IconImage,      i18n: 'nav.image' },
  { id: 'video',       Icon: IconVideo,      i18n: 'nav.video' },
  { id: 'text',        Icon: IconType,       i18n: 'nav.text' },
  { id: 'projection',  Icon: IconProjector,  i18n: 'nav.projection' },
  { id: 'transmision', Icon: IconBroadcast,  i18n: 'nav.transmision' },
]

// Regex para detectar referencias bíblicas: "Juan 3:16", "1 Cor 13:4-7", "salmo 23"
const REF_REGEX = /^(\d?\s?[a-záéíóúñ]+)\s*(\d+)(?::(\d+)(?:[-,](\d+))?)?$/i

const BOOK_ALIASES = {
  // Aliases comunes → nombre canónico
  'génesis': 'génesis', 'genesis': 'génesis', 'gn': 'génesis', 'gen': 'génesis',
  'éxodo': 'éxodo', 'exodo': 'éxodo', 'ex': 'éxodo',
  'levítico': 'levítico', 'levitico': 'levítico', 'lev': 'levítico', 'lv': 'levítico',
  'números': 'números', 'numeros': 'números', 'num': 'números', 'nm': 'números',
  'deuteronomio': 'deuteronomio', 'dt': 'deuteronomio', 'deut': 'deuteronomio',
  'josué': 'josué', 'josue': 'josué', 'jos': 'josué',
  'jueces': 'jueces', 'jue': 'jueces', 'jc': 'jueces',
  'rut': 'rut',
  '1 samuel': '1 samuel', '1samuel': '1 samuel', '1 sam': '1 samuel', '1sam': '1 samuel',
  '2 samuel': '2 samuel', '2samuel': '2 samuel', '2 sam': '2 samuel', '2sam': '2 samuel',
  '1 reyes': '1 reyes', '1reyes': '1 reyes', '1 re': '1 reyes',
  '2 reyes': '2 reyes', '2reyes': '2 reyes', '2 re': '2 reyes',
  '1 crónicas': '1 crónicas', '1cronicas': '1 crónicas', '1cr': '1 crónicas',
  '2 crónicas': '2 crónicas', '2cronicas': '2 crónicas', '2cr': '2 crónicas',
  'esdras': 'esdras', 'esd': 'esdras',
  'nehemías': 'nehemías', 'nehemias': 'nehemías', 'neh': 'nehemías',
  'ester': 'ester', 'est': 'ester',
  'job': 'job',
  'salmos': 'salmos', 'salmo': 'salmos', 'sal': 'salmos', 'sl': 'salmos',
  'proverbios': 'proverbios', 'pr': 'proverbios', 'prov': 'proverbios',
  'eclesiastés': 'eclesiastés', 'eclesiastes': 'eclesiastés', 'ecl': 'eclesiastés',
  'cantares': 'cantares', 'cant': 'cantares',
  'isaías': 'isaías', 'isaias': 'isaías', 'is': 'isaías',
  'jeremías': 'jeremías', 'jeremias': 'jeremías', 'jer': 'jeremías',
  'lamentaciones': 'lamentaciones', 'lam': 'lamentaciones',
  'ezequiel': 'ezequiel', 'ez': 'ezequiel',
  'daniel': 'daniel', 'dan': 'daniel', 'dn': 'daniel',
  'oseas': 'oseas', 'os': 'oseas',
  'joel': 'joel',
  'amós': 'amós', 'amos': 'amós', 'am': 'amós',
  'abdías': 'abdías', 'abdias': 'abdías',
  'jonás': 'jonás', 'jonas': 'jonás',
  'miqueas': 'miqueas', 'mi': 'miqueas',
  'nahúm': 'nahúm', 'nahum': 'nahúm', 'na': 'nahúm',
  'habacuc': 'habacuc', 'hab': 'habacuc',
  'sofonías': 'sofonías', 'sofonias': 'sofonías', 'sof': 'sofonías',
  'hageo': 'hageo', 'hag': 'hageo',
  'zacarías': 'zacarías', 'zacarias': 'zacarías', 'zac': 'zacarías',
  'malaquías': 'malaquías', 'malaquias': 'malaquías', 'mal': 'malaquías',
  'mateo': 'mateo', 'mt': 'mateo', 'mat': 'mateo',
  'marcos': 'marcos', 'mc': 'marcos', 'mar': 'marcos',
  'lucas': 'lucas', 'lc': 'lucas', 'luc': 'lucas',
  'juan': 'juan', 'jn': 'juan',
  'hechos': 'hechos', 'hch': 'hechos', 'hech': 'hechos',
  'romanos': 'romanos', 'rom': 'romanos', 'rm': 'romanos',
  '1 corintios': '1 corintios', '1corintios': '1 corintios', '1 cor': '1 corintios', '1co': '1 corintios',
  '2 corintios': '2 corintios', '2corintios': '2 corintios', '2 cor': '2 corintios', '2co': '2 corintios',
  'gálatas': 'gálatas', 'galatas': 'gálatas', 'gal': 'gálatas',
  'efesios': 'efesios', 'ef': 'efesios',
  'filipenses': 'filipenses', 'fil': 'filipenses',
  'colosenses': 'colosenses', 'col': 'colosenses',
  '1 tesalonicenses': '1 tesalonicenses', '1ts': '1 tesalonicenses', '1 tes': '1 tesalonicenses',
  '2 tesalonicenses': '2 tesalonicenses', '2ts': '2 tesalonicenses', '2 tes': '2 tesalonicenses',
  '1 timoteo': '1 timoteo', '1tm': '1 timoteo', '1 tim': '1 timoteo',
  '2 timoteo': '2 timoteo', '2tm': '2 timoteo', '2 tim': '2 timoteo',
  'tito': 'tito', 'tit': 'tito',
  'filemón': 'filemón', 'filemon': 'filemón',
  'hebreos': 'hebreos', 'heb': 'hebreos',
  'santiago': 'santiago', 'stg': 'santiago',
  '1 pedro': '1 pedro', '1pedro': '1 pedro', '1 pe': '1 pedro', '1p': '1 pedro',
  '2 pedro': '2 pedro', '2pedro': '2 pedro', '2 pe': '2 pedro', '2p': '2 pedro',
  '1 juan': '1 juan', '1juan': '1 juan', '1jn': '1 juan',
  '2 juan': '2 juan', '2juan': '2 juan', '2jn': '2 juan',
  '3 juan': '3 juan', '3juan': '3 juan', '3jn': '3 juan',
  'judas': 'judas', 'jud': 'judas',
  'apocalipsis': 'apocalipsis', 'ap': 'apocalipsis', 'apo': 'apocalipsis',
}

export default function CommandPalette({ open, onClose, onPanelChange }) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  // Focus al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
      setQuery(''); setActiveIdx(0)
    }
  }, [open])

  // Construir resultados al cambiar query
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const items = await buildResults(query, t)
      if (!cancelled) { setResults(items); setActiveIdx(0) }
    })()
    return () => { cancelled = true }
  }, [query])

  // Atajos dentro del modal
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape')          { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(results.length - 1, i + 1)) }
      else if (e.key === 'ArrowUp')    { e.preventDefault(); setActiveIdx(i => Math.max(0, i - 1)) }
      else if (e.key === 'Enter')      {
        e.preventDefault()
        const item = results[activeIdx]
        if (item) executeItem(item, { onPanelChange, onClose })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIdx, onClose, onPanelChange])

  if (!open) return null

  // Agrupar por categoría
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ width: 'min(680px, 92vw)', maxHeight: '70vh', overflow: 'hidden' }}>

        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--line-1)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <IconSearch size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: 'var(--text-1)', fontSize: 16, fontFamily: 'inherit',
            }} />
          <span className="kbd">ESC</span>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 70px)', padding: '8px 0' }}>
          {results.length === 0 && query.length > 0 && (
            <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              {t('palette.noResults')} "{query}"
            </p>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div style={{
                padding: '10px 22px 4px', fontSize: 10,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--text-3)',
              }}>{category}</div>
              {items.map((item) => {
                const flatIdx = results.indexOf(item)
                const active = flatIdx === activeIdx
                return (
                  <button key={item.id} onClick={() => executeItem(item, { onPanelChange, onClose })}
                    onMouseEnter={() => setActiveIdx(flatIdx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      width: '100%', padding: '10px 22px',
                      background: active
                        ? 'linear-gradient(180deg, rgba(168,95,51,0.18), rgba(128,64,18,0.06))'
                        : 'transparent',
                      color: active ? 'var(--copper-100)' : 'var(--text-2)',
                      cursor: 'pointer', textAlign: 'left',
                      borderLeft: active ? '3px solid var(--copper-300)' : '3px solid transparent',
                      transition: 'background 0.1s ease', border: 0, fontFamily: 'inherit',
                    }}>
                    {item.Icon && <item.Icon size={16} style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? 'var(--copper-100)' : 'var(--text-1)' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    {active && <IconArrowRight size={14} style={{ color: 'var(--copper-200)' }} />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Search engine ---

async function buildResults(query, t) {
  const items = []
  const q = query.trim()

  // Sin query: muestra acciones rápidas + paneles
  if (!q) {
    items.push(
      { id: 'action-clear', category: t('palette.actions'), Icon: IconX,
        title: 'Limpiar pantalla (F9)', subtitle: 'Quita el slide en vivo',
        action: () => setLive(null) },
    )
    PANEL_ITEMS.forEach(p => items.push({
      id: `panel-${p.id}`, category: t('palette.panels'), Icon: p.Icon,
      title: t(p.i18n), subtitle: '',
      panel: p.id,
    }))
    return items
  }

  const nq = normalizeText(q)

  // 1. Detectar referencia bíblica tipo "Juan 3:16"
  const refMatch = q.match(REF_REGEX)
  if (refMatch) {
    const bookText = refMatch[1].trim().toLowerCase()
    const chapNum = +refMatch[2]
    const verseNum = refMatch[3] ? +refMatch[3] : null
    const verseEnd = refMatch[4] ? +refMatch[4] : null

    const canonical = BOOK_ALIASES[bookText] || BOOK_ALIASES[normalizeText(bookText)]
    if (canonical) {
      // Buscar el bookIndex
      const { getBooks, getActiveVersion } = await import('../services/bibleService.js')
      const v = getActiveVersion()
      try {
        const books = await getBooks(v.id)
        const bookIdx = books.findIndex(b => normalizeText(b.name) === normalizeText(canonical))
        if (bookIdx >= 0) {
          items.push({
            id: `ref-${bookIdx}-${chapNum}-${verseNum || 1}`,
            category: t('palette.bible'),
            Icon: IconBible,
            title: `${books[bookIdx].name} ${chapNum}${verseNum ? ':' + verseNum + (verseEnd ? '-' + verseEnd : '') : ''}`,
            subtitle: `Ir al ${verseNum ? 'versículo' : 'capítulo'} en ${v.short}`,
            ref: { bookIndex: bookIdx, chapterNum: chapNum, verseNum, verseEnd, version: v.id },
          })
        }
      } catch {}
    }
  }

  // 2. Búsqueda de texto bíblico (3+ chars)
  if (q.length >= 3) {
    try {
      const v = getActiveVersion()
      const found = await searchText(q, 5, v.id)
      found.forEach(r => items.push({
        id: `verse-${r.bookIndex}-${r.chapterNum}-${r.verseNum}`,
        category: t('palette.bible'),
        Icon: IconBible,
        title: r.reference,
        subtitle: r.text.slice(0, 90) + (r.text.length > 90 ? '…' : ''),
        ref: { bookIndex: r.bookIndex, chapterNum: r.chapterNum, verseNum: r.verseNum, version: v.id },
      }))
    } catch {}
  }

  // 3. Canciones (filtra por título/autor/etiquetas)
  try {
    const songs = await listSongs({ search: q })
    songs.slice(0, 5).forEach(s => items.push({
      id: `song-${s.id}`,
      category: t('palette.songs'),
      Icon: IconMusic,
      title: s.title,
      subtitle: s.author || (s.tags || ''),
      song: s,
    }))
  } catch {}

  // 4. Paneles que coincidan
  PANEL_ITEMS.forEach(p => {
    const label = t(p.i18n)
    if (normalizeText(label).includes(nq)) {
      items.push({
        id: `panel-${p.id}`, category: t('palette.panels'), Icon: p.Icon,
        title: label, subtitle: '',
        panel: p.id,
      })
    }
  })

  return items
}

async function executeItem(item, { onPanelChange, onClose }) {
  if (item.action) {
    item.action()
    onClose()
    return
  }
  if (item.panel) {
    onPanelChange?.(item.panel)
    onClose()
    return
  }
  if (item.ref) {
    // Cargar el versículo y enviarlo
    try {
      const chap = await getChapter(item.ref.bookIndex, item.ref.chapterNum, item.ref.version)
      if (!chap) { onClose(); return }
      let verses = chap.verses
      if (item.ref.verseNum) {
        verses = chap.verses.filter(v =>
          v.verseNum >= item.ref.verseNum &&
          v.verseNum <= (item.ref.verseEnd || item.ref.verseNum)
        )
      }
      const combined = combineVerses(chap.bookName, chap.chapterNum, verses)
      if (combined) selectSlide({ ...combined, type: 'bible' })
    } catch {}
    onClose()
    return
  }
  if (item.song) {
    // Proyectar la primera sección de la canción
    const slides = songToSlides(item.song, { maxLines: item.song.maxLines ?? 4 })
    if (slides[0]) {
      selectSlide({
        text: slides[0].text,
        reference: slides[0].reference,
        type: 'song',
      })
    }
    onClose()
    return
  }
}
