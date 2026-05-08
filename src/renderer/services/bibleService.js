// Servicio de Biblia con soporte multi-versión (locales + api.bible).
// Local: JSON empaquetado, descarga completa, búsqueda y navegación instantánea.
// Remoto (api.bible): carga perezosa por capítulo, requiere API key del usuario.

import * as apiBible from './apiBible.js'

const BOOK_NAMES_ES = {
  'Genesis': 'Génesis', 'Exodus': 'Éxodo', 'Leviticus': 'Levítico',
  'Numbers': 'Números', 'Deuteronomy': 'Deuteronomio', 'Joshua': 'Josué',
  'Judges': 'Jueces', 'Ruth': 'Rut',
  '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
  '1 Kings': '1 Reyes', '2 Kings': '2 Reyes',
  '1 Chronicles': '1 Crónicas', '2 Chronicles': '2 Crónicas',
  'Ezra': 'Esdras', 'Nehemiah': 'Nehemías', 'Esther': 'Ester',
  'Job': 'Job', 'Psalms': 'Salmos', 'Proverbs': 'Proverbios',
  'Ecclesiastes': 'Eclesiastés', 'Song of Solomon': 'Cantares',
  'Isaiah': 'Isaías', 'Jeremiah': 'Jeremías', 'Lamentations': 'Lamentaciones',
  'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel', 'Hosea': 'Oseas',
  'Joel': 'Joel', 'Amos': 'Amós', 'Obadiah': 'Abdías',
  'Jonah': 'Jonás', 'Micah': 'Miqueas', 'Nahum': 'Nahúm',
  'Habakkuk': 'Habacuc', 'Zephaniah': 'Sofonías', 'Haggai': 'Hageo',
  'Zechariah': 'Zacarías', 'Malachi': 'Malaquías',
  'Matthew': 'Mateo', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'Juan',
  'Acts': 'Hechos', 'Romans': 'Romanos',
  '1 Corinthians': '1 Corintios', '2 Corinthians': '2 Corintios',
  'Galatians': 'Gálatas', 'Ephesians': 'Efesios', 'Philippians': 'Filipenses',
  'Colossians': 'Colosenses',
  '1 Thessalonians': '1 Tesalonicenses', '2 Thessalonians': '2 Tesalonicenses',
  '1 Timothy': '1 Timoteo', '2 Timothy': '2 Timoteo',
  'Titus': 'Tito', 'Philemon': 'Filemón', 'Hebrews': 'Hebreos',
  'James': 'Santiago',
  '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
  '1 John': '1 Juan', '2 John': '2 Juan', '3 John': '3 Juan',
  'Jude': 'Judas', 'Revelation': 'Apocalipsis',
}

// --------- Versiones LOCALES (siempre disponibles) ---------

// import.meta.env.BASE_URL = '/' en dev, './' en producción (configurado en vite.config.js).
// Esto garantiza que las biblias se carguen igual en `npm run dev` y en el .exe instalado.
const BASE = import.meta.env.BASE_URL || '/'

const LOCAL_VERSIONS = [
  { id: 'rvr1909', short: 'RVR 1909', name: 'Reina-Valera 1909',
    license: 'Dominio público', type: 'local', file: BASE + 'rvr60.json' },
  { id: 'nvi', short: 'NVI', name: 'Nueva Versión Internacional',
    license: 'Bíblica, Inc. · uso devocional', type: 'local', file: BASE + 'nvi.json' },
  { id: 'dhh', short: 'DHH', name: 'Dios Habla Hoy',
    license: 'Sociedades Bíblicas Unidas', type: 'local', file: BASE + 'dhh.json' },
  { id: 'lbla', short: 'LBLA', name: 'La Biblia de las Américas',
    license: 'The Lockman Foundation', type: 'local', file: BASE + 'lbla.json' },
  { id: 'ntv', short: 'NTV', name: 'Nueva Traducción Viviente',
    license: 'Tyndale House', type: 'local', file: BASE + 'ntv.json' },
  { id: 'pdt', short: 'PDT', name: 'Palabra de Dios para Todos',
    license: 'Centro Mundial de Traducción de la Biblia', type: 'local', file: BASE + 'pdt.json' },
  { id: 'tla', short: 'TLA', name: 'Traducción en Lenguaje Actual',
    license: 'Sociedades Bíblicas Unidas', type: 'local', file: BASE + 'tla.json' },
]

// --------- Estado ---------

const localCache = new Map()      // versionId → array de libros completo
const remoteChapterCache = new Map()  // `${bibleId}::${bookIndex}::${chapterNum}` → array de strings
const remoteSkeletonCache = new Map() // bibleId → libros con metadata (sin texto)
let activeVersionId = 'rvr1909'

// --------- Catálogo dinámico ---------

export function getAllVersions() {
  const remote = apiBible.getEnabledBibles().map(b => ({
    id: `apibible:${b.id}`,
    short: b.abbr || b.name.slice(0, 6),
    name: b.nameLocal || b.name,
    license: b.copyright || 'Bajo licencia (api.bible)',
    type: 'apibible',
    bibleId: b.id,
  }))
  return [...LOCAL_VERSIONS, ...remote]
}

export function getActiveVersion() {
  return getAllVersions().find(v => v.id === activeVersionId) || LOCAL_VERSIONS[0]
}

export function setActiveVersion(versionId) {
  if (getAllVersions().find(v => v.id === versionId)) activeVersionId = versionId
}

// --------- Local: descarga completa ---------

async function loadLocalVersion(version) {
  if (localCache.has(version.id)) return localCache.get(version.id)
  const response = await fetch(version.file)
  const raw = await response.json()
  const books = raw.map((book, index) => ({
    index,
    name: BOOK_NAMES_ES[book.name] || book.name,
    chapters: book.chapters,
  }))
  localCache.set(version.id, books)
  return books
}

// --------- Remoto: solo metadata, capítulos bajo demanda ---------

async function loadRemoteSkeleton(version) {
  if (remoteSkeletonCache.has(version.bibleId)) return remoteSkeletonCache.get(version.bibleId)
  const skeleton = await apiBible.getBookSkeleton(version.bibleId)
  // Traducir nombre a español si el inglés está mapeado
  const books = skeleton.map(b => ({
    index: b.index,
    name: BOOK_NAMES_ES[b.name] || b.name,
    chapters: { length: b.chapterIds.length },  // solo cuenta — no texto
    chapterIds: b.chapterIds,
  }))
  remoteSkeletonCache.set(version.bibleId, books)
  return books
}

// --------- API pública unificada ---------

export async function getBooks(versionId = activeVersionId) {
  const v = getAllVersions().find(x => x.id === versionId) || LOCAL_VERSIONS[0]
  if (v.type === 'local')    return loadLocalVersion(v)
  if (v.type === 'apibible') return loadRemoteSkeleton(v)
}

export async function getChapter(bookIndex, chapterNum, versionId = activeVersionId) {
  const v = getAllVersions().find(x => x.id === versionId) || LOCAL_VERSIONS[0]

  if (v.type === 'local') {
    const books = await loadLocalVersion(v)
    const book = books[bookIndex]
    const chapter = book?.chapters[chapterNum - 1]
    if (!chapter) return null
    return {
      bookName: book.name,
      chapterNum,
      verses: chapter.map((text, i) => ({ verseNum: i + 1, text })),
    }
  }

  if (v.type === 'apibible') {
    const cacheKey = `${v.bibleId}::${bookIndex}::${chapterNum}`
    if (!remoteChapterCache.has(cacheKey)) {
      const verses = await apiBible.getChapterText(v.bibleId, bookIndex, chapterNum)
      remoteChapterCache.set(cacheKey, verses || [])
    }
    const books = await loadRemoteSkeleton(v)
    const verses = remoteChapterCache.get(cacheKey)
    return {
      bookName: books[bookIndex]?.name || '?',
      chapterNum,
      verses: verses.map((text, i) => ({ verseNum: i + 1, text })),
    }
  }
}

export async function getChapterCount(bookIndex, versionId = activeVersionId) {
  const books = await getBooks(versionId)
  return books[bookIndex]?.chapters?.length || 0
}

/** Búsqueda solo para versiones locales (rápida y ofrece autocompletado).
 *  api.bible tiene endpoint /search pero requiere otra integración. */
export async function searchText(query, limit = 50, versionId = activeVersionId) {
  const v = getAllVersions().find(x => x.id === versionId) || LOCAL_VERSIONS[0]
  if (v.type !== 'local') return []  // solo búsqueda local por ahora

  const books = await loadLocalVersion(v)
  const q = query.trim().toLowerCase()
  if (q.length < 3) return []
  const results = []
  for (let b = 0; b < books.length; b++) {
    const book = books[b]
    for (let c = 0; c < book.chapters.length; c++) {
      const chapter = book.chapters[c]
      for (let vIdx = 0; vIdx < chapter.length; vIdx++) {
        if (chapter[vIdx].toLowerCase().includes(q)) {
          results.push({
            text: chapter[vIdx],
            reference: `${book.name} ${c + 1}:${vIdx + 1}`,
            bookIndex: b, chapterNum: c + 1, verseNum: vIdx + 1,
          })
          if (results.length >= limit) return results
        }
      }
    }
  }
  return results
}

export function combineVerses(bookName, chapterNum, verses) {
  if (verses.length === 0) return null
  if (verses.length === 1) {
    return { text: verses[0].text, reference: `${bookName} ${chapterNum}:${verses[0].verseNum}` }
  }
  const sorted = [...verses].sort((a, b) => a.verseNum - b.verseNum)
  const text = sorted.map(v => `${v.verseNum} ${v.text}`).join(' ')
  const nums = sorted.map(v => v.verseNum)
  const isConsecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)
  const reference = isConsecutive
    ? `${bookName} ${chapterNum}:${nums[0]}-${nums[nums.length - 1]}`
    : `${bookName} ${chapterNum}:${nums.join(',')}`
  return { text, reference }
}
