// Servicio dual: usa IPC de Electron (SQLite real) si está disponible,
// sino cae a localStorage para poder previsualizar en navegador.

import { normalizeText } from './textUtils.js'

const hasElectron = typeof window !== 'undefined' && !!window.electron?.songs
const LS_KEY = 'eclesia.songs'
let nextId = 1

function readLS() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    nextId = Math.max(nextId, ...data.map(s => s.id), 0) + 1
    return data
  } catch { return [] }
}

function writeLS(songs) {
  localStorage.setItem(LS_KEY, JSON.stringify(songs))
}

function seedLSIfEmpty() {
  const existing = readLS()
  if (existing.length > 0) return existing
  const seed = [
    {
      id: nextId++, title: 'Cuán Grande Es Él', author: 'Stuart K. Hine',
      tags: 'adoración,clásica', is_favorite: false,
      sections: [
        { type: 'verse',  label: 'Estrofa 1', text: 'Señor mi Dios, al contemplar los cielos,\nEl firmamento y las estrellas mil' },
        { type: 'chorus', label: 'Coro',      text: 'Mi corazón entona la canción:\n¡Cuán grande es Él! ¡Cuán grande es Él!' },
      ],
    },
    {
      id: nextId++, title: 'Grande y Eterno', author: 'Marcos Witt',
      tags: 'alabanza', is_favorite: false,
      sections: [
        { type: 'verse', label: 'Estrofa', text: 'Grande y eterno es nuestro Dios,\nDigno de toda honra y gloria' },
      ],
    },
  ]
  writeLS(seed)
  return seed
}

// --------- API pública ---------

export async function listSongs({ search = '', onlyFavorites = false } = {}) {
  if (hasElectron) {
    // Pide TODAS al main (sin filter SQL) y filtra en cliente con normalizeText.
    // Así la búsqueda funciona aunque el usuario omita tildes/comas.
    let songs = await window.electron.songs.list({ search: '', onlyFavorites })
    if (search) {
      const q = normalizeText(search)
      songs = songs.filter(s =>
        normalizeText(s.title).includes(q) ||
        normalizeText(s.author || '').includes(q) ||
        normalizeText(s.tags || '').includes(q)
      )
    }
    return songs
  }

  let songs = seedLSIfEmpty()
  if (search) {
    const q = normalizeText(search)
    songs = songs.filter(s =>
      normalizeText(s.title).includes(q) ||
      normalizeText(s.author || '').includes(q) ||
      normalizeText(s.tags || '').includes(q)
    )
  }
  if (onlyFavorites) songs = songs.filter(s => s.is_favorite)

  return songs.sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return b.is_favorite - a.is_favorite
    return a.title.localeCompare(b.title)
  })
}

export async function createSong(data) {
  if (hasElectron) return window.electron.songs.create(data)

  const songs = readLS()
  const song = {
    id: nextId++, is_favorite: false,
    created_at: Date.now(), updated_at: Date.now(),
    ...data,
  }
  writeLS([...songs, song])
  return song
}

export async function updateSong(id, data) {
  if (hasElectron) return window.electron.songs.update(id, data)

  const songs = readLS()
  const next = songs.map(s => s.id === id ? { ...s, ...data, updated_at: Date.now() } : s)
  writeLS(next)
  return next.find(s => s.id === id)
}

export async function deleteSong(id) {
  if (hasElectron) return window.electron.songs.delete(id)

  const songs = readLS().filter(s => s.id !== id)
  writeLS(songs)
  return { deleted: true, id }
}

export async function toggleFavorite(id) {
  if (hasElectron) return window.electron.songs.favorite(id)

  const songs = readLS()
  const next = songs.map(s => s.id === id ? { ...s, is_favorite: !s.is_favorite } : s)
  writeLS(next)
  return next.find(s => s.id === id)
}

export function isUsingSQLite() {
  return hasElectron
}
