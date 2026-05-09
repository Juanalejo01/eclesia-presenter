// Bus de eventos + hook de atajos globales.
// Los paneles se suscriben con `onAction(handler)` para reaccionar a navegación.

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
 * Hook principal — registra los atajos globales en window.
 * Llama desde la raíz (App.jsx) UNA sola vez.
 */
export function useGlobalShortcuts({ onPanelChange, onBlank, onClearSlide }) {
  useEffect(() => {
    const handler = (e) => {
      // Permitir typing libre en inputs salvo Escape (que limpia)
      if (isTyping(e.target) && e.key !== 'Escape') return

      const ctrl = e.ctrlKey || e.metaKey

      // Cambiar de panel
      if (ctrl && ['1','2','3','4','5','6','7','8'].includes(e.key)) {
        e.preventDefault()
        const panels = ['bible', 'songs', 'schedule', 'image', 'video', 'text', 'projection', 'transmision']
        onPanelChange?.(panels[+e.key - 1])
        return
      }

      // Navegación de slides
      if (e.key === 'ArrowRight') { e.preventDefault(); emit('navigate:next'); return }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); emit('navigate:prev'); return }

      // Pantalla en blanco / blackout
      if (e.key === ' ') { e.preventDefault(); onBlank?.('blank');    return }
      if (e.key.toLowerCase() === 'b' && !ctrl) { e.preventDefault(); onBlank?.('blackout'); return }

      // F9: limpiar el live (sin slide proyectado, ventana queda con fondo del tema sin texto)
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
  }, [onPanelChange, onBlank, onClearSlide])
}
