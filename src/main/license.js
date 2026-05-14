// Módulo de licencia para la app desktop.
//
// Responsabilidades:
//   1. Generar y persistir un device_id estable por instalación.
//   2. Persistir la licencia activa en userData/license.json.
//   3. Hablar con el API (https://eclesia-presenter.vercel.app):
//        - POST /api/activate
//        - POST /api/deactivate
//        - POST /api/license/validate
//   4. Exponer un estado en memoria (`current`) que el resto del main process
//      consulta para feature gates.
//
// El renderer NO accede a este módulo directamente — pasa por IPC (license.js handlers
// en main.js → este módulo).

const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')

// API base — sobrescribible vía env var para desarrollo local
const API_BASE = process.env.ECLESIA_API_BASE || 'https://eclesia-presenter.vercel.app'

const LICENSE_FILE = () => path.join(app.getPath('userData'), 'license.json')
const DEVICE_FILE  = () => path.join(app.getPath('userData'), 'device-id.txt')

// ---------- Estado en memoria ----------
// Forma:
//   {
//     license_key: "EP-XXXX-...",
//     plan: "pro_yearly",
//     status: "active",
//     max_devices: 3,
//     expires_at: "2027-05-11T..." | null,
//     last_validated: "2026-05-12T..."
//   }
let current = null

// ---------- Device ID estable ----------
// Generado una sola vez por instalación, guardado en userData.
// No expone datos personales (MAC/IP/serial). Solo un UUID aleatorio.
function getDeviceId() {
  try {
    const file = DEVICE_FILE()
    if (fs.existsSync(file)) {
      const id = fs.readFileSync(file, 'utf8').trim()
      if (id && id.length >= 16) return id
    }
    const id = crypto.randomBytes(16).toString('hex')
    fs.writeFileSync(file, id, 'utf8')
    return id
  } catch (e) {
    // Fallback: hash de hostname + username. Estable pero no ideal.
    return crypto.createHash('sha256')
      .update(`${os.hostname()}-${os.userInfo().username}`)
      .digest('hex')
      .slice(0, 32)
  }
}

function getDeviceName() {
  try { return os.hostname() } catch { return 'PC' }
}

function getOSLabel() {
  const p = process.platform
  const r = os.release()
  if (p === 'win32')  return `Windows ${r}`
  if (p === 'darwin') return `macOS ${r}`
  return `${p} ${r}`
}

// ---------- Persistencia local ----------
function loadFromDisk() {
  try {
    const file = LICENSE_FILE()
    if (!fs.existsSync(file)) return null
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return (data && typeof data === 'object') ? data : null
  } catch (e) {
    return null
  }
}

function saveToDisk(data) {
  try {
    fs.writeFileSync(LICENSE_FILE(), JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.warn('[license] No se pudo persistir:', e.message)
  }
}

function clearFromDisk() {
  try { if (fs.existsSync(LICENSE_FILE())) fs.unlinkSync(LICENSE_FILE()) } catch {}
}

// ---------- API client ----------
async function postJSON(path, body) {
  // Usamos fetch global de Node 18+ (Electron 29 lleva Node 20)
  const url = `${API_BASE}${path}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { status: res.status, data }
  } catch (e) {
    return { status: 0, data: { ok: false, error: 'network_error', message: e.message } }
  }
}

// ---------- Public API ----------

/**
 * Activa la licencia en este PC.
 * @param {string} licenseKey  EP-XXXX-XXXX-XXXX-XXXX
 * @returns {Promise<{ok, error?, plan?, status?, max_devices?, expires_at?}>}
 */
async function activate(licenseKey) {
  const key = (licenseKey || '').trim().toUpperCase()
  if (!/^EP-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(key)) {
    return { ok: false, error: 'formato_invalido', message: 'La clave debe tener el formato EP-XXXX-XXXX-XXXX-XXXX' }
  }

  const { status, data } = await postJSON('/api/activate', {
    license_key: key,
    device_id: getDeviceId(),
    device_name: getDeviceName(),
    os: getOSLabel(),
    app_version: app.getVersion(),
  })

  if (status === 200 && data.ok) {
    current = {
      license_key: key,
      plan: data.plan,
      status: data.status,
      max_devices: data.max_devices,
      expires_at: data.expires_at,
      last_validated: new Date().toISOString(),
    }
    saveToDisk(current)
    return { ok: true, ...current }
  }

  return { ok: false, error: data.error || 'desconocido', status, ...data }
}

/**
 * Desactiva este PC (libera el slot para que el user active otro).
 */
async function deactivate() {
  if (!current) return { ok: true } // nada que hacer

  const { data } = await postJSON('/api/deactivate', {
    license_key: current.license_key,
    device_id: getDeviceId(),
  })

  if (data.ok) {
    current = null
    clearFromDisk()
    return { ok: true }
  }

  return { ok: false, error: data.error || 'desconocido' }
}

/**
 * Valida la licencia contra el servidor. Llamado al arrancar y periódicamente.
 * Si el server dice que está inactiva/expirada, bajamos a Free (clear local).
 */
async function validate() {
  if (!current) return { ok: false, reason: 'sin_licencia' }

  const { data } = await postJSON('/api/license/validate', {
    license_key: current.license_key,
    device_id: getDeviceId(),
    app_version: app.getVersion(),
  })

  if (data.ok) {
    current = {
      ...current,
      plan: data.plan,
      status: data.status,
      max_devices: data.max_devices,
      expires_at: data.expires_at,
      last_validated: new Date().toISOString(),
    }
    saveToDisk(current)
    return { ok: true, ...current }
  }

  // Estado inválido permanente: limpiar local
  if (['license_no_existe', 'license_inactiva', 'expirada', 'device_no_activado'].includes(data.reason)) {
    current = null
    clearFromDisk()
  }

  return { ok: false, reason: data.reason || 'desconocido' }
}

/** Devuelve el estado actual (read-only). */
function getState() {
  return {
    licensed: !!current,
    plan: current?.plan || 'free',
    status: current?.status || null,
    license_key: current?.license_key || null,
    max_devices: current?.max_devices || 1,
    expires_at: current?.expires_at || null,
    last_validated: current?.last_validated || null,
    device_id: getDeviceId(),
    device_name: getDeviceName(),
    os: getOSLabel(),
    app_version: app.getVersion(),
  }
}

/** ¿Tiene plan Pro (cualquier variante)? */
function isPro() {
  return !!current && ['pro_monthly', 'pro_yearly', 'lifetime'].includes(current.plan)
}

// ---------- Init ----------
// Cargar la licencia persistida al arrancar el módulo.
// Esto se ejecuta cuando se hace `require('./license')` desde main.js.
function init() {
  current = loadFromDisk()
  // Validación en background (no bloqueante)
  if (current) {
    validate().catch(() => {})
  }
}

module.exports = {
  init,
  activate,
  deactivate,
  validate,
  getState,
  isPro,
}
