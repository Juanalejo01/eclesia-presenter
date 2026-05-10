// Settings globales de la app: tema visual, monitores por defecto, paths, audio/video.
// Se persiste en localStorage. Los paths/picker dependen de IPC con el main process.

import { useEffect, useState } from 'react'
import { setLocale } from './i18n.js'

const KEY = 'eclesia.appSettings'

export const DEFAULT_SETTINGS = {
  theme: 'light',            // 'native' | 'dark' | 'light' | 'ocean' | 'rose'  (light = default principal)
  locale: 'es',              // 'es' | 'en' | 'pt'
  defaultDisplayBackground: null, // displayId
  defaultDisplayOverlay:    null,
  storagePath: null,         // carpeta principal
  imagesPath:  null,
  videosPath:  null,
  backgroundsPath: null,     // carpeta para fondos de proyección
  audioOutput: 'default',    // deviceId del audio output
  videoQuality: 'high',      // 'low' | 'medium' | 'high'
  videoFps: 60,              // 30 | 60
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { return { ...DEFAULT_SETTINGS } }
}

let current = load()
const listeners = new Set()

function emit() { for (const fn of listeners) try { fn(current) } catch {} }
function persist() { localStorage.setItem(KEY, JSON.stringify(current)) }

export function getSettings() { return current }

export function setSettings(patch) {
  current = { ...current, ...patch }
  persist()
  emit()
  applySideEffects(patch)
}

export function subscribeSettings(fn) {
  listeners.add(fn); fn(current)
  return () => listeners.delete(fn)
}

export function useAppSettings() {
  const [s, set] = useState(current)
  useEffect(() => subscribeSettings(set), [])
  return s
}

// --- Side effects: aplicar settings al DOM/sistema cuando cambian ---

function applySideEffects(patch) {
  if (patch.theme !== undefined) {
    document.documentElement.dataset.theme = patch.theme
  }
  if (patch.locale !== undefined) {
    setLocale(patch.locale)
  }
}

// Aplica tema + locale al cargar (importante hacerlo aquí porque se importa desde main.jsx)
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = current.theme
  setLocale(current.locale)
}

// --- Helpers para diálogos nativos (vía IPC) ---

export async function pickDirectory(title) {
  if (!window.electron?.app?.pickDirectory) {
    alert('Esta función requiere Electron real (npm run dev).')
    return null
  }
  return window.electron.app.pickDirectory(title)
}
