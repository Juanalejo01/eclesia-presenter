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
let _songsCache = null

/** Llamar desde main.js cuando el slide cambie en la app, para empujar a los móviles. */
function pushSlide(slide) {
  currentSlide = slide || { text: '', reference: '', type: 'blank' }
  if (_io) _io.emit('slide:update', currentSlide)
}

function pushTheme(theme) {
  currentTheme = theme
  if (_io) _io.emit('theme:update', currentTheme)
}

/** Push de la lista de canciones a los móviles conectados. */
function pushSongs(songs) {
  _songsCache = Array.isArray(songs) ? songs.map(s => ({
    id: s.id, title: s.title, author: s.author, tags: s.tags,
  })) : []
  if (_io) _io.emit('songs:list', _songsCache)
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
    if (_songsCache) socket.emit('songs:list', _songsCache)

    // Comandos desde móvil → bridge al main process
    socket.on('remote:next',  () => emitRemoteEvent('next'))
    socket.on('remote:prev',  () => emitRemoteEvent('prev'))
    socket.on('remote:blank', () => emitRemoteEvent('blank'))
    socket.on('remote:black', () => emitRemoteEvent('black'))
    socket.on('remote:clear', () => emitRemoteEvent('clear'))

    // Buscador de Biblia desde el móvil (query libre tipo "salmos 22:1")
    socket.on('remote:bible-ref', (payload) => {
      emitRemoteEvent('bible-ref', payload || {})
    })
    // Proyectar canción por id desde el móvil
    socket.on('remote:song', (payload) => {
      emitRemoteEvent('song', payload || {})
    })
  })

  httpServer.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP()
    console.log(`[EclesiaPresenter] server activo en http://${ip}:${PORT}`)
    console.log(`  Página inicio:    http://${ip}:${PORT}/`)
    console.log(`  Control móvil:    http://${ip}:${PORT}/remote`)
    console.log(`  OBS overlay:      http://${ip}:${PORT}/overlay`)
  })

  return { io, getLocalIP, port: PORT, pushSlide, pushTheme, pushSongs, onRemoteEvent }
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
    overscroll-behavior: contain; }
  body { padding: 14px 12px 96px; display: flex; flex-direction: column; gap: 12px; user-select: none; -webkit-user-select: none; }

  header { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px; }
  .brand { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 18px; color: var(--copper-100); }
  .brand em { color: var(--copper-200); font-style: normal; }
  .status { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-family: 'Courier New', monospace;
    letter-spacing: .14em; text-transform: uppercase; color: var(--text-3); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #7df3a8; box-shadow: 0 0 6px #7df3a8; }
  .dot.off { background: #555; box-shadow: none; }

  /* Slide actual (siempre visible arriba) */
  .slide-card {
    background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
    border: 1px solid rgba(232,181,145,.18);
    border-radius: 14px; padding: 16px 16px;
    min-height: 88px; display: flex; flex-direction: column; justify-content: center;
  }
  .slide-ref { font-family: 'Courier New', monospace; font-size: 10px; color: var(--copper-200);
    letter-spacing: .16em; text-transform: uppercase; margin-bottom: 6px; }
  .slide-text { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px;
    line-height: 1.3; color: var(--text-1); max-height: 90px; overflow: hidden; }
  .slide-empty { color: var(--text-3); font-style: italic; font-size: 13px; }

  /* Tabs sticky abajo */
  .tabs {
    position: fixed; bottom: 0; left: 0; right: 0;
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    background: var(--bg-1); border-top: 1px solid var(--line-1, rgba(232,181,145,.10));
    padding: 8px 8px calc(env(safe-area-inset-bottom, 8px) + 8px) 8px; gap: 6px;
    z-index: 20;
  }
  .tab {
    background: transparent; color: var(--text-3); border: 0;
    padding: 10px 4px; border-radius: 10px; font-size: 12px; font-weight: 600;
    letter-spacing: .04em; cursor: pointer;
  }
  .tab.active { background: linear-gradient(180deg, rgba(168,95,51,.20), rgba(128,64,18,.10));
                color: var(--copper-100); }

  /* Vista del Mando: botones gigantes prev/next */
  .nav { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .nav button {
    height: 84px; border: 0; border-radius: 14px; font-size: 16px; font-weight: 700;
    letter-spacing: .04em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .08s, filter .12s;
  }
  .nav button:active { transform: scale(0.97); filter: brightness(0.92); }
  .nav .prev { background: var(--bg-2); color: var(--text-1); border: 1px solid rgba(232,181,145,.18); }
  .nav .next { background: linear-gradient(180deg, var(--copper-200), var(--copper-300)); color: #1a0e08; }
  .nav .arrow { font-size: 22px; line-height: 1; }

  .actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .actions button {
    height: 52px; border: 0; border-radius: 12px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: filter .12s, background .12s;
    background: var(--bg-2); color: var(--text-2); border: 1px solid rgba(232,181,145,.10);
  }
  .actions button:active { filter: brightness(0.85); }
  .actions button.blackout { background: #000; color: var(--text-2); border-color: rgba(255,255,255,0.08); }

  /* Biblia / Canciones: input + lista */
  .search-row { display: flex; gap: 8px; }
  .search-input {
    flex: 1; height: 52px; border: 0; border-radius: 12px; background: var(--bg-2);
    color: var(--text-1); font-size: 16px; padding: 0 16px;
    border: 1px solid rgba(232,181,145,.15);
  }
  .search-input::placeholder { color: var(--text-3); font-size: 14px; }
  .search-input:focus { outline: none; border-color: var(--copper-200); }
  .send-btn {
    height: 52px; padding: 0 18px; border: 0; border-radius: 12px;
    background: linear-gradient(180deg, var(--copper-200), var(--copper-300)); color: #1a0e08;
    font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .send-btn:active { filter: brightness(.92); transform: scale(.97); }
  .send-btn:disabled { opacity: .4; }

  .hint-row { font-size: 11px; color: var(--text-3); padding: 4px 4px 0;
    font-family: 'Courier New', monospace; letter-spacing: .04em; }

  .song-item {
    display: flex; flex-direction: column; gap: 2px;
    padding: 14px 14px; background: var(--bg-2); border-radius: 10px;
    border: 1px solid rgba(232,181,145,.08); margin-bottom: 8px;
    cursor: pointer; transition: filter .1s, transform .08s;
  }
  .song-item:active { filter: brightness(.85); transform: scale(.99); }
  .song-title { font-size: 16px; font-weight: 600; color: var(--text-1); }
  .song-meta { font-size: 11px; color: var(--text-3); font-family: 'Courier New', monospace; }

  .empty-state { padding: 24px 16px; text-align: center; color: var(--text-3); font-size: 13px; }

  /* Suggested-refs (chips de accesos rápidos para Biblia) */
  .quick-refs { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 4px 12px; }
  .chip {
    background: var(--bg-2); color: var(--text-2);
    border: 1px solid rgba(232,181,145,.12); padding: 7px 10px;
    border-radius: 999px; font-size: 12px; cursor: pointer;
  }
  .chip:active { background: var(--bg-3); }

  .hidden { display: none !important; }
</style>
</head>
<body>
  <header>
    <div class="brand">EclesiaPresenter <em>Remote</em></div>
    <div class="status"><span class="dot" id="dot"></span><span id="state">conectando</span></div>
  </header>

  <div class="slide-card">
    <div class="slide-ref" id="ref"></div>
    <div class="slide-text" id="text"><span class="slide-empty">Sin presentación activa…</span></div>
  </div>

  <!-- VISTA: MANDO -->
  <section id="view-mando">
    <div class="nav" style="margin-bottom:8px">
      <button class="prev"  onclick="send('prev')"><span class="arrow">◀</span> Anterior</button>
      <button class="next"  onclick="send('next')">Siguiente <span class="arrow">▶</span></button>
    </div>
    <div class="actions">
      <button class="blank"    onclick="send('blank')">Blanco</button>
      <button class="blackout" onclick="send('black')">Negro</button>
      <button onclick="send('clear')">Limpiar</button>
    </div>
  </section>

  <!-- VISTA: BIBLIA -->
  <section id="view-biblia" class="hidden">
    <div class="search-row">
      <input class="search-input" id="bibleInput"
        placeholder="ej: salmos 22:1 · juan 3 16 · genesis 1"
        autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="send-btn" id="bibleSend">Ir</button>
    </div>
    <div class="hint-row">Acceso rápido</div>
    <div class="quick-refs">
      <button class="chip" onclick="quickBible('juan 3:16')">Juan 3:16</button>
      <button class="chip" onclick="quickBible('salmos 23')">Salmo 23</button>
      <button class="chip" onclick="quickBible('1 corintios 13')">1 Cor 13</button>
      <button class="chip" onclick="quickBible('mateo 5:3')">Mateo 5:3</button>
      <button class="chip" onclick="quickBible('genesis 1:1')">Gn 1:1</button>
      <button class="chip" onclick="quickBible('proverbios 3:5')">Pr 3:5</button>
      <button class="chip" onclick="quickBible('filipenses 4:13')">Fil 4:13</button>
      <button class="chip" onclick="quickBible('romanos 8:28')">Ro 8:28</button>
    </div>
  </section>

  <!-- VISTA: CANCIONES -->
  <section id="view-canciones" class="hidden">
    <input class="search-input" id="songInput"
      placeholder="Buscar canción por título o autor…"
      autocomplete="off" autocapitalize="off" spellcheck="false">
    <div id="songList"></div>
  </section>

  <!-- TABS -->
  <nav class="tabs">
    <button class="tab active" data-view="mando"     onclick="setView('mando')">Mando</button>
    <button class="tab"        data-view="biblia"    onclick="setView('biblia')">Biblia</button>
    <button class="tab"        data-view="canciones" onclick="setView('canciones')">Canciones</button>
  </nav>

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

    // --- Tabs ---
    function setView(name) {
      ['mando','biblia','canciones'].forEach(v => {
        document.getElementById('view-' + v).classList.toggle('hidden', v !== name)
        document.querySelector('.tab[data-view="' + v + '"]').classList.toggle('active', v === name)
      })
      if (name === 'biblia') setTimeout(() => document.getElementById('bibleInput').focus(), 50)
      if (name === 'canciones') setTimeout(() => document.getElementById('songInput').focus(), 50)
    }

    // --- Biblia ---
    const bibleInput = document.getElementById('bibleInput')
    const bibleSend = document.getElementById('bibleSend')
    function sendBible() {
      const query = bibleInput.value.trim()
      if (!query) return
      socket.emit('remote:bible-ref', { query })
      if (navigator.vibrate) navigator.vibrate(12)
      bibleSend.textContent = '✓'
      setTimeout(() => bibleSend.textContent = 'Ir', 800)
    }
    function quickBible(ref) {
      bibleInput.value = ref
      sendBible()
    }
    bibleSend.onclick = sendBible
    bibleInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendBible() } })

    // --- Canciones ---
    let allSongs = []
    const songInput = document.getElementById('songInput')
    const songList = document.getElementById('songList')

    function normalize(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '') }

    function renderSongs() {
      const q = normalize(songInput.value)
      const filtered = !q ? allSongs : allSongs.filter(s =>
        normalize(s.title).includes(q) || normalize(s.author).includes(q)
      )
      if (filtered.length === 0) {
        songList.innerHTML = '<div class="empty-state">' +
          (allSongs.length === 0 ? 'No hay canciones cargadas todavía.' : 'No hay coincidencias.') +
          '</div>'
        return
      }
      songList.innerHTML = filtered.slice(0, 80).map(s =>
        '<div class="song-item" onclick="projectSong(' + s.id + ')">'
        + '<span class="song-title">' + escapeHtml(s.title) + '</span>'
        + (s.author ? '<span class="song-meta">' + escapeHtml(s.author) + '</span>' : '')
        + '</div>'
      ).join('')
    }
    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c])
    }
    function projectSong(id) {
      socket.emit('remote:song', { id })
      if (navigator.vibrate) navigator.vibrate(12)
    }
    songInput.addEventListener('input', renderSongs)
    socket.on('songs:list', (songs) => { allSongs = songs || []; renderSongs() })

    // Estado inicial vacío
    renderSongs()
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
