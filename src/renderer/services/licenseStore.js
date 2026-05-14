// Store de licencia para el renderer.
//
// Lee el estado desde el main process (window.electron.license.state()) y lo
// cachea. Otros componentes pueden suscribirse vía useLicense() hook o llamar
// a getState() / isPro() para checks síncronos (pueden devolver null antes
// del primer refresh, asumir Free en ese caso).
//
// El estado se refresca:
//   - Al cargar el módulo (primera vez)
//   - Cuando el usuario activa/desactiva desde Settings (forceRefresh)
//   - Cada 5 min en background (heartbeat de validate del main)

import { useEffect, useState } from 'react'

const PRO_PLANS = ['pro_monthly', 'pro_yearly', 'lifetime']

let _state = null
const _subs = new Set()

async function refresh() {
  if (!window.electron?.license) {
    _state = { licensed: false, plan: 'free', max_devices: 1 }
  } else {
    try {
      _state = await window.electron.license.state()
    } catch (e) {
      _state = { licensed: false, plan: 'free', max_devices: 1 }
    }
  }
  _subs.forEach(fn => fn(_state))
}

function subscribe(fn) {
  _subs.add(fn)
  if (_state) fn(_state)
  return () => _subs.delete(fn)
}

export function getState() { return _state }

export function isPro() {
  if (!_state) return false
  return !!_state.licensed && PRO_PLANS.includes(_state.plan)
}

export function getPlan() {
  return _state?.plan || 'free'
}

/** Hook React para consumir el estado de licencia. */
export function useLicense() {
  const [state, setState] = useState(_state)
  useEffect(() => subscribe(setState), [])
  return state
}

export function forceRefresh() { return refresh() }

// Auto-refresh al cargar el módulo
refresh()
