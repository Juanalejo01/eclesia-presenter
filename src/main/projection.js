// Gestor de ventanas de proyección.
// Crea BrowserWindows nativas que OBS puede capturar directamente
// (sin servidor HTTP, sin red, latencia cero vía IPC del SO).

const { app, BrowserWindow, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

const isDev = !app.isPackaged
const projections = new Map()  // mode → { window, options }
let currentSlide = null
let currentTheme = defaultTheme()

// --- Persistencia del theme en disco (sobrevive cierre de la app) ---
const THEME_FILE = () => path.join(app.getPath('userData'), 'projection-theme.json')

function loadPersistedTheme() {
  try {
    const file = THEME_FILE()
    if (!fs.existsSync(file)) return
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (data && typeof data === 'object') {
      // Merge con defaults (en caso de añadir keys nuevas en updates)
      currentTheme = { ...defaultTheme(), ...data, overlay: { ...defaultTheme().overlay, ...(data.overlay || {}) } }

      // Sanity check: si el theme persistido es trivial (solid + negro absoluto sin imagen/video),
      // probablemente sea un theme antiguo o corrupto que da "pantalla negra" al abrir el proyector.
      // Reseteamos a defaults visuales (gradiente azul) — el usuario puede cambiar el tema desde Proyección.
      if (
        currentTheme.bgType === 'solid' &&
        currentTheme.bgColor === '#000000' &&
        !currentTheme.bgImage &&
        !currentTheme.bgVideo
      ) {
        const d = defaultTheme()
        currentTheme.bgType = d.bgType
        currentTheme.bgColor = d.bgColor
        currentTheme.bgGradient = d.bgGradient
      }
    }
  } catch (e) {
    console.warn('Could not load persisted theme:', e.message)
  }
}

function persistTheme() {
  try {
    fs.writeFileSync(THEME_FILE(), JSON.stringify(currentTheme), 'utf8')
  } catch (e) {
    console.warn('Could not persist theme:', e.message)
  }
}

// Carga al arrancar el módulo
loadPersistedTheme()

// IMPORTANTE: este default debe coincidir con DEFAULT_THEME en
// src/renderer/services/themeStore.js para evitar desincronía visual.
function defaultTheme() {
  return {
    bgType: 'gradient',
    bgColor: '#0a1620',
    bgGradient: ['#0a1620', '#1e3a5f'],
    bgImage: null,
    bgVideo: null,
    imageFit: 'contain',
    videoFit: 'contain',
    bgImageBlur: 16,
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 64,
    fontColor: '#ffffff',
    fontWeight: 500,
    textShadow: true,
    textAlign: 'center',
    referenceVisible: true,
    transitionType: 'fade',
    transitionDuration: 500,
    transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
}

function getDisplays() {
  return screen.getAllDisplays().map(d => ({
    id: d.id,
    label: d.label || `Pantalla ${d.id}`,
    bounds: d.bounds,
    primary: d.id === screen.getPrimaryDisplay().id,
  }))
}

function buildWindowURL(mode) {
  // En producción, construir URL file:// correctamente.
  // pathToFileURL() produce `file:///C:/path/index.html` con el formato que Chromium
  // requiere en Windows (3 slashes + forward slashes). Concatenar `file://` + ruta
  // cruda con backslashes (como teníamos antes) producía una URL inválida que cargaba
  // bien en algunos casos pero fallaba en producción dentro de app.asar.
  const base = isDev
    ? 'http://localhost:5173/'
    : pathToFileURL(path.join(__dirname, '../../dist/renderer/index.html')).toString()
  return `${base}#/projection?mode=${mode}`
}

/**
 * Abre una ventana de proyección.
 * @param {Object} opts
 * @param {'background'|'overlay'} opts.mode  - background = pantalla completa con fondo / overlay = transparente
 * @param {number} [opts.displayId]            - id de la pantalla, default secundaria
 * @param {boolean} [opts.fullscreen]          - default true para background, false para overlay
 */
function openProjection(opts = {}) {
  const mode = opts.mode || 'background'
  if (projections.has(mode)) {
    const existing = projections.get(mode).window
    if (!existing.isDestroyed()) existing.focus()
    return existing.id
  }

  const displays = screen.getAllDisplays()
  const primary  = screen.getPrimaryDisplay()
  const target   = displays.find(d => d.id === opts.displayId)
                || displays.find(d => d.id !== primary.id)
                || primary

  const isOverlay = mode === 'overlay'
  const isStage   = mode === 'stage'

  // OVERLAY: estrategia robusta para OBS sin estorbar al usuario ni tapar
  // la ventana de Pantalla completa.
  // STAGE: ventana opaca tipo presentador (slide actual + reloj + tiempo).
  //        Va idealmente a un monitor secundario distinto al de Pantalla
  //        completa, pero si no hay, abre como ventana normal con marco.
  const overlayBounds = { x: 0, y: 0, width: 1920, height: 1080 }

  // Para stage: si hay 3+ monitores, usa el tercero. Si hay 2, usa primario.
  // Si hay 1, abre ventana normal con marco a 1280x720 que el usuario puede mover.
  let stageBounds = null
  if (isStage) {
    if (displays.length >= 3) {
      const tertiary = displays.find(d => d.id !== primary.id && d.id !== target.id)
      stageBounds = tertiary?.bounds || primary.bounds
    } else {
      stageBounds = { x: 100, y: 100, width: 1280, height: 720 }
    }
  }

  const win = new BrowserWindow({
    x: isOverlay ? overlayBounds.x : isStage ? stageBounds.x : target.bounds.x,
    y: isOverlay ? overlayBounds.y : isStage ? stageBounds.y : target.bounds.y,
    width:  isOverlay ? overlayBounds.width  : isStage ? stageBounds.width  : target.bounds.width,
    height: isOverlay ? overlayBounds.height : isStage ? stageBounds.height : target.bounds.height,
    fullscreen: !isOverlay && !isStage && (opts.fullscreen ?? true),
    frame: !isOverlay && isStage ? true : !isOverlay && !isStage ? false : false,
    transparent: isOverlay,
    backgroundColor: isOverlay ? '#00000000' : '#0a0a0d',
    hasShadow: !isOverlay,
    skipTaskbar: false,
    alwaysOnTop: false,
    resizable: !isOverlay,
    focusable: !isOverlay,
    show: !isOverlay,
    title:
      isOverlay ? 'EclesiaPresenter — Lower-Third (OBS)' :
      isStage   ? 'EclesiaPresenter — Stage Display' :
                  'EclesiaPresenter — Pantalla completa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })

  if (isOverlay) {
    win.setIgnoreMouseEvents(true, { forward: true })
    win.once('ready-to-show', () => {
      win.showInactive()
      // Minimizar siempre después de cargar:
      // 1. El usuario nunca la ve estorbando
      // 2. NO se superpone a la ventana de Pantalla completa (que está en otro monitor)
      // 3. OBS la captura igual via DWM thumbnail
      setTimeout(() => {
        if (!win.isDestroyed()) win.minimize()
      }, 300)

      // Bonus: si la ventana de Pantalla completa ya estaba abierta, devolverle el foco.
      const bg = projections.get('background')
      if (bg && !bg.window.isDestroyed()) {
        setTimeout(() => bg.window.focus(), 400)
      }
    })
  }

  win.loadURL(buildWindowURL(mode))

  win.webContents.on('did-finish-load', () => {
    // Estado inicial al abrir
    win.webContents.send('projection:init', { mode, slide: currentSlide, theme: currentTheme })
  })

  win.on('closed', () => projections.delete(mode))

  projections.set(mode, { window: win, options: opts })
  return win.id
}

function closeProjection(mode) {
  const entry = projections.get(mode)
  if (!entry) return false
  if (!entry.window.isDestroyed()) entry.window.close()
  return true
}

/**
 * Muestra/oculta la ventana del overlay para inspección manual.
 * Útil para verificar visualmente qué está capturando OBS sin abrir OBS.
 */
function toggleOverlayVisible(visible) {
  const entry = projections.get('overlay')
  if (!entry || entry.window.isDestroyed()) return false
  const win = entry.window
  if (visible) {
    if (win.isMinimized()) win.restore()
    win.showInactive()
  } else {
    win.minimize()
  }
  return true
}

function closeAll() {
  for (const mode of [...projections.keys()]) closeProjection(mode)
}

function broadcast(channel, payload) {
  for (const { window } of projections.values()) {
    if (!window.isDestroyed()) window.webContents.send(channel, payload)
  }
}

function setSlide(slide) {
  currentSlide = slide
  broadcast('projection:slide', slide)
}

function setTheme(patch) {
  // Deep merge para `overlay`: si no hacemos merge profundo aquí, mandar
  // un patch como `{ overlay: { bgType: 'gradient' } }` borraría TODOS los
  // demás campos del overlay (offsetY, fontSize, colores, etc.).
  const next = { ...currentTheme, ...patch }
  if (patch && patch.overlay) {
    next.overlay = { ...currentTheme.overlay, ...patch.overlay }
  }
  currentTheme = next
  persistTheme()  // guarda a disco para sobrevivir cierres de la app
  broadcast('projection:theme', currentTheme)
}

function getState() {
  return {
    slide: currentSlide,
    theme: currentTheme,
    open: [...projections.keys()],
    displays: getDisplays(),
  }
}

module.exports = {
  openProjection, closeProjection, closeAll,
  setSlide, setTheme, getState,
  toggleOverlayVisible,
}
