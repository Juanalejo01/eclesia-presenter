// Servidor Express + Socket.IO embebido en el main process.
// Sirve:
//   - /overlay   → HTML transparente para usar como Browser Source en OBS
//   - /remote    → UI móvil para controlar la app desde el teléfono
//   - /          → Página de bienvenida con info de conexión + QR
//
// Comunicación bidireccional con el main process via los callbacks
// `onRemoteEvent` (mando móvil → app) y `pushSlide` (app → móviles).

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const os = require('os')

const PORT = 3434  // movido del clásico 3000 para evitar choque con otros dev servers

// Estado del slide actual (lo mantiene el server para enviarlo a clientes nuevos)
let currentSlide = { text: '', reference: '', type: 'blank' }
let currentTheme = null

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) return config.address
    }
  }
  return '127.0.0.1'
}

let onRemoteEventHandlers = []

function emitRemoteEvent(name, payload) {
  for (const fn of onRemoteEventHandlers) {
    try { fn(name, payload) } catch (e) { console.error('[server] remote handler:', e) }
  }
}

/** Llamar desde main.js para recibir eventos del móvil. */
function onRemoteEvent(fn) {
  onRemoteEventHandlers.push(fn)
  return () => { onRemoteEventHandlers = onRemoteEventHandlers.filter(x => x !== fn) }
}

let _io = null

/** Llamar desde main.js cuando el slide cambie en la app, para empujar a los móviles. */
function pushSlide(slide) {
  currentSlide = slide || { text: '', reference: '', type: 'blank' }
  if (_io) _io.emit('slide:update', currentSlide)
}

function pushTheme(theme) {
  currentTheme = theme
  if (_io) _io.emit('theme:update', currentTheme)
}

function startServer() {
  const app = express()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, { cors: { origin: '*' } })
  _io = io

  // Página raíz: bienvenida + link al remote
  app.get('/', (_req, res) => {
    const ip = getLocalIP()
    res.send(WELCOME_PAGE.replace(/\$\{IP\}/g, ip).replace(/\$\{PORT\}/g, String(PORT)))
  })

  // OBS browser source
  app.get('/overlay', (_req, res) => res.send(OVERLAY_PAGE))

  // Mobile remote control
  app.get('/remote', (_req, res) => res.send(REMOTE_PAGE))

  io.on('connection', (socket) => {
    // Estado inicial al conectar
    socket.emit('slide:update', currentSlide)
    if (currentTheme) socket.emit('theme:update', currentTheme)

    // Comandos desde móvil → bridge al main process
    socket.on('remote:next',  () => emitRemoteEvent('next'))
    socket.on('remote:prev',  () => emitRemoteEvent('prev'))
    socket.on('remote:blank', () => emitRemoteEvent('blank'))
    socket.on('remote:black', () => emitRemoteEvent('black'))
    socket.on('remote:clear', () => emitRemoteEvent('clear'))
  })

  httpServer.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP()
    console.log(`[EclesiaPresenter] server activo en http://${ip}:${PORT}`)
    console.log(`  Página inicio:    http://${ip}:${PORT}/`)
    console.log(`  Control móvil:    http://${ip}:${PORT}/remote`)
    console.log(`  OBS overlay:      http://${ip}:${PORT}/overlay`)
  })

  return { io, getLocalIP, port: PORT, pushSlide, pushTheme, onRemoteEvent }
}

// ------------ PAGES ------------

const OVERLAY_PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Overlay OBS</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; background: transparent; font-family: 'Cormorant Garamond', Georgia, serif; }
  body { display:flex; align-items:flex-end; justify-content:center; padding: 6vh 8vw; }
  #slide { text-align:center; color:#fff; text-shadow: 0 4px 16px rgba(0,0,0,.85); max-width: 84vw; }
  #text { font-size: clamp(36px, 4.4vw, 76px); font-weight:500; line-height:1.25; letter-spacing:.005em; }
  #reference { font-family: 'Geist Mono', monospace; font-size: clamp(13px, 1.05vw, 18px);
               margin-top: 14px; letter-spacing:.18em; text-transform:uppercase;
               color:#f4e6d7; opacity:.92; }
</style>
</head>
<body>
  <div id="slide">
    <div id="text"></div>
    <div id="reference"></div>
  </div>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io()
    function render(d) {
      const text = d?.type === 'blackout' ? '' : (d?.text || '')
      document.getElementById('text').textContent = text
      document.getElementById('reference').textContent = d?.reference || ''
    }
    socket.on('slide:update', render)
  </script>
</body>
</html>`

const REMOTE_PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0c0a09">
<title>EclesiaPresenter — Control</title>
<style>
  :root {
    --bg-0: #0c0a09;
    --bg-1: #14100d;
    --bg-2: #1c1614;
    --bg-3: #261e1a;
    --copper-100: #f4e6d7;
    --copper-200: #db9f75;
    --copper-300: #a85f33;
    --text-1: #f5ebe0;
    --text-2: #c9b29c;
    --text-3: #8a7866;
    --danger: #e87575;
  }
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color: transparent; }
  html, body { min-height: 100vh; background: var(--bg-0); color: var(--text-1);
    font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif;
    overscroll-behavior: contain; user-select: none; -webkit-user-select: none; }
  body { padding: 16px 14px env(safe-area-inset-bottom, 14px); display: flex; flex-direction: column; gap: 14px; }

  header { display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; }
  .brand { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 20px; color: var(--copper-100); }
  .brand em { color: var(--copper-200); font-style: normal; }
  .status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-family: 'Courier New', monospace;
    letter-spacing: .14em; text-transform: uppercase; color: var(--text-3); }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #7df3a8; box-shadow: 0 0 8px #7df3a8; }
  .dot.off { background: #555; box-shadow: none; }

  /* Slide actual */
  .slide-card {
    background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
    border: 1px solid rgba(232,181,145,.18);
    border-radius: 16px; padding: 22px 18px;
    min-height: 140px; display: flex; flex-direction: column; justify-content: center;
  }
  .slide-ref { font-family: 'Courier New', monospace; font-size: 10px; color: var(--copper-200);
    letter-spacing: .16em; text-transform: uppercase; margin-bottom: 10px; }
  .slide-text { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px;
    line-height: 1.35; color: var(--text-1); }
  .slide-empty { color: var(--text-3); font-style: italic; font-size: 15px; }

  /* Botones principales: prev / next gigantes */
  .nav { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .nav button {
    height: 88px; border: 0; border-radius: 14px; font-size: 17px; font-weight: 700;
    letter-spacing: .04em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: transform .08s, filter .12s;
  }
  .nav button:active { transform: scale(0.97); filter: brightness(0.92); }
  .nav .prev { background: var(--bg-2); color: var(--text-1); border: 1px solid rgba(232,181,145,.18); }
  .nav .next { background: linear-gradient(180deg, var(--copper-200), var(--copper-300)); color: #1a0e08; }
  .nav .arrow { font-size: 24px; line-height: 1; }

  /* Botones secundarios */
  .actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 4px; }
  .actions button {
    height: 56px; border: 0; border-radius: 12px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: filter .12s, background .12s;
    background: var(--bg-2); color: var(--text-2); border: 1px solid rgba(232,181,145,.10);
  }
  .actions button:active { filter: brightness(0.85); }
  .actions button.blackout { background: #000; color: var(--text-2); border-color: rgba(255,255,255,0.08); }
  .actions button.clear { background: var(--bg-3); color: var(--text-1); }
  .actions button.blank { background: var(--bg-3); color: var(--text-1); }

  /* Hint */
  .hint { text-align: center; font-size: 11px; color: var(--text-3); padding: 14px 0 0;
    font-family: 'Courier New', monospace; letter-spacing: .14em; text-transform: uppercase; }
</style>
</head>
<body>
  <header>
    <div class="brand">EclesiaPresenter <em>Remote</em></div>
    <div class="status"><span class="dot" id="dot"></span><span id="state">conectando</span></div>
  </header>

  <div class="slide-card" id="card">
    <div class="slide-ref" id="ref"></div>
    <div class="slide-text" id="text"><span class="slide-empty">Sin presentación activa…</span></div>
  </div>

  <div class="nav">
    <button class="prev"  onclick="send('prev')"><span class="arrow">◀</span> Anterior</button>
    <button class="next"  onclick="send('next')">Siguiente <span class="arrow">▶</span></button>
  </div>

  <div class="actions">
    <button class="blank"    onclick="send('blank')">Blanco</button>
    <button class="blackout" onclick="send('black')">Negro</button>
    <button class="clear"    onclick="send('clear')">Limpiar</button>
  </div>

  <div class="hint">Mantén la pantalla activa · WiFi compartido con el PC</div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io()
    const dot = document.getElementById('dot')
    const state = document.getElementById('state')

    socket.on('connect',    () => { dot.classList.remove('off'); state.textContent = 'conectado' })
    socket.on('disconnect', () => { dot.classList.add('off');    state.textContent = 'desconectado' })

    function send(cmd) {
      socket.emit('remote:' + cmd)
      if (navigator.vibrate) navigator.vibrate(8)
    }

    function render(d) {
      const ref = d?.reference || ''
      const text = d?.type === 'blackout' ? '— pantalla negra —'
                 : d?.type === 'blank'    ? '— pantalla en blanco —'
                 : (d?.text || '')
      document.getElementById('ref').textContent = ref
      const t = document.getElementById('text')
      t.innerHTML = text ? '' : '<span class="slide-empty">Sin presentación activa…</span>'
      if (text) t.textContent = text
    }
    socket.on('slide:update', render)

    // Prevenir scroll por toques accidentales
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false })
  </script>
</body>
</html>`

const WELCOME_PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EclesiaPresenter — Conexión</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0c0a09; color: #f5ebe0;
    margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 30px; }
  .card { background: #14100d; border: 1px solid rgba(232,181,145,.18); border-radius: 16px;
    padding: 36px 30px; max-width: 480px; width: 100%; text-align: center; }
  h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 32px; margin: 0 0 8px; }
  h1 em { color: #db9f75; font-style: italic; }
  p { color: #c9b29c; margin: 0 0 20px; line-height: 1.55; }
  a.link { display: inline-block; margin-top: 18px; padding: 14px 24px; border-radius: 12px;
    background: linear-gradient(180deg, #db9f75, #a85f33); color: #1a0e08; font-weight: 700;
    text-decoration: none; }
  code { font-family: 'Courier New', monospace; background: #1c1614; padding: 2px 8px; border-radius: 6px; color: #f4e6d7; }
</style>
</head>
<body>
  <div class="card">
    <h1>Eclesia<em>Presenter</em></h1>
    <p>Estás conectado al servidor local de EclesiaPresenter.</p>
    <p>Para controlar la app desde este dispositivo, abre:</p>
    <code>http://\${IP}:\${PORT}/remote</code>
    <br>
    <a class="link" href="/remote">Abrir control remoto →</a>
  </div>
</body>
</html>`

module.exports = { startServer }
