// Bus de eventos + hook de atajos globales.
// Los paneles se suscriben con `subscribe(action, handler)` para reaccionar a navegación.

import { useEffect } from 'react'

const listeners = new Map()  // action → Set<handler>
let actionVersion = 0        // se incrementa con cada cambio (para invalidar cache si hace falta)

export function emit(action, payload) {
  const set = listeners.get(action)
  if (!set) return
  for (const handler of set) {
    try { handler(payload) } catch (e) { console.error('shortcut handler', e) }
  }
}

export function subscribe(action, handler) {
  if (!listeners.has(action)) listeners.set(action, new Set())
  listeners.get(action).add(handler)
  actionVersion++
  return () => {
    listeners.get(action)?.delete(handler)
    actionVersion++
  }
}

/** Hook: suscribirse declarativamente a una acción */
export function useAction(action, handler, deps = []) {
  useEffect(() => subscribe(action, handler), deps)
}

/** ¿Estamos escribiendo en un input/textarea? */
function isTyping(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

/**
 * Lista canónica de atajos. Documentada para mostrar en CommandPalette/ayuda.
 *
 *  Navegación de paneles (con o sin Ctrl+número):
 *   Ctrl + B  →  Biblia
 *   Ctrl + N  →  Canciones
 *   Ctrl + 3  →  Lista del día (Schedule)
 *   Ctrl + I  →  Imágenes
 *   Ctrl + H  →  Videos
 *   Ctrl + 6  →  Texto libre
 *   Ctrl + Q  →  Proyección (ajustes de tema)
 *   Ctrl + 8  →  Transmisión
 *
 *  Acciones globales:
 *   Ctrl + M  →  Abrir Menú / Command Palette
 *   Ctrl + K  →  Alias del Menú (los que vienen de VS Code, Notion, etc.)
 *   Ctrl + A  →  Abrir Ajustes
 *   Ctrl + P  →  Toggle proyector pantalla completa (abrir/cerrar)
 *
 *  Slides en vivo:
 *   →  /  ←  →  navegar al siguiente / anterior
 *   Espacio  →  pantalla en blanco
 *   B        →  blackout (negro absoluto)
 *   F9       →  limpiar slide
 *   ESC      →  limpiar selección / salir de input
 */
export const SHORTCUT_LIST = [
  { keys: ['Ctrl', 'B'], action: 'Biblia',           category: 'panel' },
  { keys: ['Ctrl', 'N'], action: 'Canciones',        category: 'panel' },
  { keys: ['Ctrl', '3'], action: 'Lista del día',    category: 'panel' },
  { keys: ['Ctrl', 'I'], action: 'Imágenes',         category: 'panel' },
  { keys: ['Ctrl', 'H'], action: 'Videos',           category: 'panel' },
  { keys: ['Ctrl', '6'], action: 'Texto libre',      category: 'panel' },
  { keys: ['Ctrl', 'T'], action: 'Herramientas',     category: 'panel' },
  { keys: ['Ctrl', 'Q'], action: 'Proyección',       category: 'panel' },
  { keys: ['Ctrl', '8'], action: 'Transmisión',      category: 'panel' },
  { keys: ['Ctrl', 'M'], action: 'Abrir Menú',       category: 'global' },
  { keys: ['Ctrl', 'A'], action: 'Abrir Ajustes',    category: 'global' },
  { keys: ['Ctrl', 'P'], action: 'Toggle proyector', category: 'global' },
  { keys: ['→'],         action: 'Siguiente slide',  category: 'live' },
  { keys: ['←'],         action: 'Slide anterior',   category: 'live' },
  { keys: ['Espacio'],   action: 'Pantalla blanco',  category: 'live' },
  { keys: ['B'],         action: 'Blackout',         category: 'live' },
  { keys: ['F9'],        action: 'Limpiar slide',    category: 'live' },
  { keys: ['ESC'],       action: 'Limpiar / salir',  category: 'live' },
]

/**
 * Hook principal — registra los atajos globales en window.
 * Llama desde la raíz (App.jsx) UNA sola vez.
 */
export function useGlobalShortcuts({ onPanelChange, onBlank, onClearSlide, onOpenPalette }) {
  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      // === COMBOS CON CTRL ===
      // Se aceptan SIEMPRE, incluso si estás escribiendo en un input.
      if (ctrl) {
        // Menú (Command Palette)
        if (key === 'm' || key === 'k') {
          e.preventDefault()
          onOpenPalette?.()
          return
        }

        // Ajustes
        if (key === 'a') {
          e.preventDefault()
          emit('settings:open')
          return
        }

        // Toggle proyector fullscreen
        if (key === 'p') {
          e.preventDefault()
          emit('projection:toggle-fullscreen')
          return
        }

        // Atajos directos a panel (letras)
        const LETTER_TO_PANEL = {
          b: 'bible',
          n: 'songs',
          i: 'image',
          h: 'video',
          t: 'tools',
          q: 'projection',
        }
        if (LETTER_TO_PANEL[key]) {
          e.preventDefault()
          onPanelChange?.(LETTER_TO_PANEL[key])
          return
        }

        // Ctrl+1..8 sigue funcionando como antes (compatibilidad)
        if (['1','2','3','4','5','6','7','8'].includes(e.key)) {
          e.preventDefault()
          const panels = ['bible', 'songs', 'schedule', 'image', 'video', 'text', 'projection', 'transmision']
          onPanelChange?.(panels[+e.key - 1])
          return
        }
      }

      // === RESTO: solo si no estamos escribiendo (salvo Escape) ===
      if (isTyping(e.target) && e.key !== 'Escape') return

      // Navegación de slides
      if (e.key === 'ArrowRight') { e.preventDefault(); emit('navigate:next'); return }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); emit('navigate:prev'); return }

      // Pantalla en blanco / blackout
      if (e.key === ' ') { e.preventDefault(); onBlank?.('blank');    return }
      if (key === 'b' && !ctrl) { e.preventDefault(); onBlank?.('blackout'); return }

      // F9: limpiar el live
      if (e.key === 'F9') { e.preventDefault(); onClearSlide?.(); return }

      // Limpiar
      if (e.key === 'Escape') {
        if (isTyping(e.target)) { e.target.blur(); return }
        e.preventDefault()
        onClearSlide?.()
        emit('selection:clear')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPanelChange, onBlank, onClearSlide, onOpenPalette])
}
