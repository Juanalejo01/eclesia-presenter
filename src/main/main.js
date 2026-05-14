const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron')
const path = require('path')
const fs = require('fs')
const { startServer } = require('../server/server')
const db = require('./database')
const projection = require('./projection')
const license = require('./license')

// app.isPackaged es true cuando se ejecuta el .exe instalado, false en `npm run dev`.
// Es más fiable que NODE_ENV porque electron-builder no setea esa variable automáticamente.
const isDev = !app.isPackaged

let mainWindow = null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'EclesiaPresenter',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// IPC: enviar slide al proyector. Antes había un sistema legacy con
// `presenterWindow` (otra BrowserWindow) que se cargó toda la app de nuevo.
// Eliminado: ahora todo va al sistema moderno `projection` que abre
// ventanas dedicadas (background fullscreen + overlay transparente para OBS).
ipcMain.on('slide:send', (_event, slideData) => {
  try { projection.setSlide(slideData) }
  catch (e) { console.warn('projection.setSlide failed:', e.message) }
})

// IPC: licencia (activación / validación / desactivación / estado)
ipcMain.handle('license:state',       ()      => license.getState())
ipcMain.handle('license:activate',    (_e, k) => license.activate(k))
ipcMain.handle('license:deactivate',  ()      => license.deactivate())
ipcMain.handle('license:validate',    ()      => license.validate())

// IPC: proyección externa (overlay/background sin red, capturable por OBS)
ipcMain.handle('projection:open',  (_e, opts)   => projection.openProjection(opts))
ipcMain.handle('projection:close', (_e, mode)   => projection.closeProjection(mode))
ipcMain.handle('projection:theme', (_e, patch)  => { projection.setTheme(patch); return projection.getState().theme })
ipcMain.handle('projection:state', ()           => projection.getState())
ipcMain.handle('projection:toggleOverlayVisible', (_e, visible) => projection.toggleOverlayVisible(visible))

// --------- Media library ---------

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'mkv', 'avi']

function getMediaDir() {
  const dir = path.join(app.getPath('userData'), 'media')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function detectType(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  if (IMAGE_EXTS.includes(ext)) return { type: 'image', mime: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
  if (VIDEO_EXTS.includes(ext)) return { type: 'video', mime: `video/${ext}` }
  return null
}

ipcMain.handle('media:pick', async (_e, kind = 'all') => {
  const filters = []
  if (kind === 'image' || kind === 'all') filters.push({ name: 'Imágenes', extensions: IMAGE_EXTS })
  if (kind === 'video' || kind === 'all') filters.push({ name: 'Videos',   extensions: VIDEO_EXTS })

  const result = await dialog.showOpenDialog({
    title: 'Seleccionar medio',
    properties: ['openFile', 'multiSelections'],
    filters,
  })
  if (result.canceled || result.filePaths.length === 0) return []

  const added = []
  for (const sourcePath of result.filePaths) {
    const detected = detectType(sourcePath)
    if (!detected) continue
    const name = path.basename(sourcePath)
    const safe = `${Date.now()}-${name.replace(/[^\w.\-]/g, '_')}`
    const dest = path.join(getMediaDir(), safe)
    try {
      fs.copyFileSync(sourcePath, dest)
      const stats = fs.statSync(dest)
      const item = db.addMedia({ name, type: detected.type, path: dest, mime: detected.mime, size: stats.size })
      added.push(item)
    } catch (err) {
      console.error('media:pick copy failed', err)
    }
  }
  return added
})

ipcMain.handle('media:list',   (_e, opts) => db.listMedia(opts))
ipcMain.handle('media:delete', (_e, id)   => db.deleteMedia(id))

// Drag & drop: recibe paths absolutos de archivos arrastrados al renderer
// y los copia a userData/media igual que media:pick.
ipcMain.handle('media:addFiles', async (_e, sourcePaths = []) => {
  const added = []
  for (const sourcePath of sourcePaths) {
    if (!sourcePath || !fs.existsSync(sourcePath)) continue
    const detected = detectType(sourcePath)
    if (!detected) continue
    const name = path.basename(sourcePath)
    const safe = `${Date.now()}-${name.replace(/[^\w.\-]/g, '_')}`
    const dest = path.join(getMediaDir(), safe)
    try {
      fs.copyFileSync(sourcePath, dest)
      const stats = fs.statSync(dest)
      const item = db.addMedia({ name, type: detected.type, path: dest, mime: detected.mime, size: stats.size })
      added.push(item)
    } catch (err) {
      console.error('media:addFiles copy failed', err)
    }
  }
  return added
})

// IPC: songs CRUD
ipcMain.handle('songs:list',     (_e, opts)    => db.listSongs(opts))
ipcMain.handle('songs:get',      (_e, id)      => db.getSong(id))
ipcMain.handle('songs:create',   (_e, data)    => db.createSong(data))
ipcMain.handle('songs:update',   (_e, id, data)=> db.updateSong(id, data))
ipcMain.handle('songs:delete',   (_e, id)      => db.deleteSong(id))
ipcMain.handle('songs:favorite', (_e, id)      => db.toggleFavorite(id))

// --------- App utilities (settings) ---------

// Selector de carpeta nativo
ipcMain.handle('app:pickDirectory', async (_e, title) => {
  const result = await dialog.showOpenDialog({
    title: title || 'Seleccionar carpeta',
    properties: ['openDirectory'],
  })
  if (result.canceled || !result.filePaths.length) return null
  return result.filePaths[0]
})

// Versión + paths de la app
ipcMain.handle('app:info', () => ({
  version: app.getVersion(),
  userData: app.getPath('userData'),
  documents: app.getPath('documents'),
  videos: app.getPath('videos'),
  pictures: app.getPath('pictures'),
}))

// --------- Songs export/import (backup) ---------

ipcMain.handle('songs:export', async () => {
  const result = await dialog.showSaveDialog({
    title: 'Exportar canciones',
    defaultPath: `eclesia-canciones-${new Date().toISOString().slice(0,10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePath) return { canceled: true }

  const songs = db.listSongs({})
  const payload = {
    type: 'eclesiapresenter.songs',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: songs.length,
    songs,
  }
  fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf8')
  return { ok: true, path: result.filePath, count: songs.length }
})

ipcMain.handle('songs:import', async (_e, opts = {}) => {
  const result = await dialog.showOpenDialog({
    title: 'Importar canciones',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePaths.length) return { canceled: true }

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf8')
    const payload = JSON.parse(raw)
    const list = Array.isArray(payload) ? payload : payload.songs || []
    let created = 0
    for (const s of list) {
      try {
        db.createSong({
          title: s.title, author: s.author, tags: s.tags,
          sections: s.sections, maxLines: s.maxLines,
        })
        created++
      } catch (e) { console.warn('skip song:', e.message) }
    }
    return { ok: true, count: created, total: list.length }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// --------- Bibles import (XMM, JSON) ---------

const BIBLES_DIR = path.join(app.getPath('userData'), 'bibles')

function ensureBiblesDir() {
  if (!fs.existsSync(BIBLES_DIR)) fs.mkdirSync(BIBLES_DIR, { recursive: true })
}

const ABBREV = {
  'Génesis': 'gn', 'Éxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm',
  'Deuteronomio': 'dt', 'Josué': 'js', 'Jueces': 'jud', 'Rut': 'rt',
  '1 Samuel': '1sm', '2 Samuel': '2sm', '1 Reyes': '1kgs', '2 Reyes': '2kgs',
  '1 Crónicas': '1ch', '2 Crónicas': '2ch', 'Esdras': 'ezr', 'Nehemías': 'ne',
  'Ester': 'et', 'Job': 'job', 'Salmos': 'ps', 'Proverbios': 'prv',
  'Eclesiastés': 'ec', 'Cantares': 'so', 'Cantar de los Cantares': 'so',
  'Isaías': 'is', 'Jeremías': 'jr', 'Lamentaciones': 'lm', 'Ezequiel': 'ez',
  'Daniel': 'dn', 'Oseas': 'ho', 'Joel': 'jl', 'Amós': 'am',
  'Abdías': 'ob', 'Jonás': 'jn', 'Miqueas': 'mi', 'Nahúm': 'na',
  'Habacuc': 'hk', 'Sofonías': 'zp', 'Hageo': 'hg', 'Zacarías': 'zc',
  'Malaquías': 'ml',
  'Mateo': 'mt', 'Marcos': 'mk', 'Lucas': 'lk', 'Juan': 'jo',
  'Hechos': 'act', 'Romanos': 'rm',
  '1 Corintios': '1co', '2 Corintios': '2co', 'Gálatas': 'gl',
  'Efesios': 'eph', 'Filipenses': 'ph', 'Colosenses': 'cl',
  '1 Tesalonicenses': '1ts', '2 Tesalonicenses': '2ts',
  '1 Timoteo': '1tm', '2 Timoteo': '2tm',
  'Tito': 'tt', 'Filemón': 'phm', 'Hebreos': 'hb', 'Santiago': 'jm',
  '1 Pedro': '1pe', '2 Pedro': '2pe',
  '1 Juan': '1jo', '2 Juan': '2jo', '3 Juan': '3jo',
  'Judas': 'jd', 'Apocalipsis': 'rv',
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}

function cleanVerse(text) {
  return decodeEntities(text)
    .replace(/\r?\n/g, ' ').replace(/\s+/g, ' ')
    .replace(/\[\d+\]/g, '').trim()
}

// Parser para .xmm y .xml estilo OpenSong/MyBible que usen el mismo schema
function parseBibleXML(xml) {
  xml = xml.replace(/^﻿/, '').replace(/<\?xml[^?]*\?>/, '')
  const books = []
  const bookRe = /<b\s+n="([^"]+)"\s*>([\s\S]*?)<\/b>/g
  let bMatch
  while ((bMatch = bookRe.exec(xml)) !== null) {
    const bookName = bMatch[1]
    const bookBody = bMatch[2]
    const chapters = []
    const chapRe = /<c\s+n="(\d+)"\s*>([\s\S]*?)<\/c>/g
    let cMatch
    while ((cMatch = chapRe.exec(bookBody)) !== null) {
      const chapNum = +cMatch[1]
      const chapBody = cMatch[2]
      const verses = []
      const verseRe = /<v\s+n="(\d+)"\s*>([\s\S]*?)<\/v>/g
      let vMatch
      while ((vMatch = verseRe.exec(chapBody)) !== null) {
        verses[+vMatch[1] - 1] = cleanVerse(vMatch[2])
      }
      chapters[chapNum - 1] = verses
    }
    books.push({
      abbrev: ABBREV[bookName] || bookName.toLowerCase().replace(/\s+/g, ''),
      name: bookName,
      chapters,
    })
  }
  return books
}

ipcMain.handle('bibles:import', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Importar Biblia',
    properties: ['openFile'],
    filters: [
      { name: 'Biblia', extensions: ['xmm', 'xml', 'json', 'bib'] },
      { name: 'Todos', extensions: ['*'] },
    ],
  })
  if (result.canceled || !result.filePaths.length) return { canceled: true }

  ensureBiblesDir()
  const sourcePath = result.filePaths[0]
  const ext = path.extname(sourcePath).slice(1).toLowerCase()
  const filename = path.basename(sourcePath, path.extname(sourcePath))
  const id = 'custom-' + filename.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  try {
    let books
    const raw = fs.readFileSync(sourcePath, 'utf8')

    if (ext === 'json') {
      const data = JSON.parse(raw.replace(/^﻿/, ''))
      books = Array.isArray(data) ? data : data.books || data.songs
    } else if (ext === 'xmm' || ext === 'xml' || ext === 'bib') {
      books = parseBibleXML(raw)
    } else {
      return { ok: false, error: 'Formato no soportado: ' + ext }
    }

    if (!books || !books.length) return { ok: false, error: 'No se encontraron libros' }

    const outPath = path.join(BIBLES_DIR, `${id}.json`)
    fs.writeFileSync(outPath, JSON.stringify(books))

    const meta = {
      id, short: filename.slice(0, 8).toUpperCase(),
      name: filename, license: 'Importada por el usuario',
      type: 'imported', file: outPath,
      books: books.length,
      addedAt: new Date().toISOString(),
    }

    // Persistir registry
    const registryPath = path.join(BIBLES_DIR, 'registry.json')
    let registry = []
    if (fs.existsSync(registryPath)) {
      try { registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) } catch {}
    }
    registry = registry.filter(r => r.id !== id)
    registry.push(meta)
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))

    return { ok: true, meta }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('bibles:listImported', () => {
  ensureBiblesDir()
  const registryPath = path.join(BIBLES_DIR, 'registry.json')
  if (!fs.existsSync(registryPath)) return []
  try { return JSON.parse(fs.readFileSync(registryPath, 'utf8')) } catch { return [] }
})

ipcMain.handle('bibles:readImported', (_e, id) => {
  const filePath = path.join(BIBLES_DIR, `${id}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
})

ipcMain.handle('bibles:deleteImported', (_e, id) => {
  ensureBiblesDir()
  const filePath = path.join(BIBLES_DIR, `${id}.json`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  const registryPath = path.join(BIBLES_DIR, 'registry.json')
  if (fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
      fs.writeFileSync(registryPath, JSON.stringify(reg.filter(r => r.id !== id), null, 2))
    } catch {}
  }
  return { ok: true }
})

app.whenReady().then(() => {
  db.init()
  license.init()

  // Protocolo custom: media://archivo.mp4 → userData/media/archivo.mp4
  // Permite que las ventanas de proyección lean archivos locales sin file:// inseguro
  protocol.registerFileProtocol('media', (request, callback) => {
    const fileName = decodeURI(request.url.replace(/^media:\/\//, ''))
    const fullPath = path.join(getMediaDir(), fileName)
    callback({ path: fullPath })
  })

  startServer()
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// macOS: si el user cierra todas las ventanas pero deja el icono en el Dock,
// click en el icono debe reabrir la ventana principal (convención macOS).
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})
