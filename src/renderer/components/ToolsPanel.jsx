// Panel "Herramientas" — utilidades complementarias para el servicio:
//   1. Countdown / Cuenta atrás (ej: "El servicio empieza en 1:26:43")
//   2. Cronómetro para dinámicas
//   3. Verso aleatorio para devocionales / dinámicas
//   4. Ruleta de nombres
//
// Cada widget puede proyectar su resultado al live. Comparten el mismo
// SlideRenderer del proyector así que respetan el tema visual configurado.

import { useEffect, useRef, useState } from 'react'
import { selectSlide } from '../services/slideStore.js'
import { getAllVersions, getActiveVersion, getBooks, getChapter } from '../services/bibleService.js'
import { IconHourglass, IconTimer, IconDice, IconWheel } from './Icons.jsx'

const WIDGETS = [
  { id: 'countdown', label: 'Cuenta atrás',  Icon: IconHourglass },
  { id: 'stopwatch', label: 'Cronómetro',    Icon: IconTimer },
  { id: 'verse',     label: 'Verso al azar', Icon: IconDice },
  { id: 'wheel',     label: 'Ruleta',        Icon: IconWheel },
]

export default function ToolsPanel() {
  const [active, setActive] = useState('countdown')

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Herramientas</h1>
          <span className="ws-sub">Cuenta atrás · cronómetro · sorteos · verso aleatorio</span>
        </div>
      </div>

      <div className="ws-body">
        {/* Tabs de widgets */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${WIDGETS.length}, 1fr)`,
          gap: 8, marginBottom: 22,
        }}>
          {WIDGETS.map(w => (
            <button key={w.id} onClick={() => setActive(w.id)}
              className={'btn ' + (active === w.id ? 'btn-primary' : '')}
              style={{ height: 56, display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
              <w.Icon size={20} />
              <span style={{ fontSize: 11 }}>{w.label}</span>
            </button>
          ))}
        </div>

        {/* Widget activo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {active === 'countdown' && <CountdownWidget />}
          {active === 'stopwatch' && <StopwatchWidget />}
          {active === 'verse'     && <VerseRandomWidget />}
          {active === 'wheel'     && <WheelWidget />}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 1. COUNTDOWN
// ============================================================
function CountdownWidget() {
  const [mode, setMode] = useState('duration')  // 'duration' | 'target'
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(15)
  const [seconds, setSeconds] = useState(0)
  const [targetDate, setTargetDate] = useState('')
  const [message, setMessage] = useState('El servicio inicia en')
  const [endMessage, setEndMessage] = useState('¡Empezamos!')
  const [running, setRunning] = useState(false)
  const [endsAt, setEndsAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [autoProject, setAutoProject] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])

  // Cuando cambia el tiempo restante, si está en autoProject, mandar al live
  useEffect(() => {
    if (!running || !endsAt || !autoProject) return
    const remaining = Math.max(0, endsAt - now)
    const text = remaining > 0 ? formatCountdown(remaining) : endMessage
    selectSlide({
      type: 'countdown',
      text,
      reference: message,
      bgType: undefined, // hereda del tema actual
    })
  }, [now, running, endsAt, autoProject, message, endMessage])

  const start = () => {
    let end
    if (mode === 'duration') {
      const ms = (hours * 3600 + minutes * 60 + seconds) * 1000
      if (ms <= 0) return
      end = Date.now() + ms
    } else {
      if (!targetDate) return
      end = new Date(targetDate).getTime()
      if (end <= Date.now()) return
    }
    setEndsAt(end)
    setRunning(true)
  }

  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setEndsAt(null); setNow(Date.now()) }

  const remaining = endsAt ? Math.max(0, endsAt - now) : (hours * 3600 + minutes * 60 + seconds) * 1000

  return (
    <>
      <div className="card" style={{ padding: 20 }}>
        <div className="section-h" style={{ marginBottom: 14 }}>
          <h3>Configuración</h3>
          <span className="sub">Modo · {mode === 'duration' ? 'duración' : 'hora destino'}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button className={'btn ' + (mode === 'duration' ? 'btn-primary' : '')}
            onClick={() => setMode('duration')}>Duración</button>
          <button className={'btn ' + (mode === 'target' ? 'btn-primary' : '')}
            onClick={() => setMode('target')}>Hora destino</button>
        </div>

        {mode === 'duration' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            <NumberField label="Horas"    value={hours}    onChange={setHours} min={0} max={23} />
            <NumberField label="Minutos"  value={minutes}  onChange={setMinutes} min={0} max={59} />
            <NumberField label="Segundos" value={seconds}  onChange={setSeconds} min={0} max={59} />
          </div>
        )}

        {mode === 'target' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <span className="label">Hora destino</span>
            <input type="datetime-local" className="field-input"
              value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        )}

        <div className="field" style={{ marginBottom: 8 }}>
          <span className="label">Mensaje principal</span>
          <input className="field-input" value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="El servicio inicia en" />
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <span className="label">Mensaje al terminar</span>
          <input className="field-input" value={endMessage}
            onChange={e => setEndMessage(e.target.value)}
            placeholder="¡Empezamos!" />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
          <input type="checkbox" checked={autoProject} onChange={e => setAutoProject(e.target.checked)} />
          Proyectar al live automáticamente (actualiza cada segundo)
        </label>
      </div>

      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
          letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
          {running ? message : 'Vista previa'}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 64,
          color: 'var(--copper-100)', lineHeight: 1, letterSpacing: '0.04em' }}>
          {remaining > 0 ? formatCountdown(remaining) : endMessage}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!running && <button className="btn btn-primary" onClick={start} style={{ flex: 1 }}>▶ Empezar</button>}
        {running  && <button className="btn" onClick={pause} style={{ flex: 1 }}>❚❚ Pausar</button>}
        <button className="btn btn-ghost" onClick={reset}>↻ Reset</button>
        <button className="btn" onClick={() => selectSlide({
          type: 'countdown',
          text: remaining > 0 ? formatCountdown(remaining) : endMessage,
          reference: message,
        })}>Proyectar ahora</button>
      </div>
    </>
  )
}

function formatCountdown(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = n => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// ============================================================
// 2. STOPWATCH
// ============================================================
function StopwatchWidget() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)  // ms acumulados
  const [startedAt, setStartedAt] = useState(null)
  const [laps, setLaps] = useState([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 50)
    return () => clearInterval(id)
  }, [running])

  const current = running && startedAt ? elapsed + (now - startedAt) : elapsed

  const start = () => { setStartedAt(Date.now()); setRunning(true) }
  const stop  = () => { setElapsed(current); setRunning(false); setStartedAt(null) }
  const reset = () => { setRunning(false); setStartedAt(null); setElapsed(0); setLaps([]) }
  const lap   = () => setLaps([{ time: current, n: laps.length + 1 }, ...laps])

  return (
    <>
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64,
          color: 'var(--copper-100)', lineHeight: 1, letterSpacing: '0.04em', fontWeight: 600 }}>
          {formatStopwatch(current)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!running && <button className="btn btn-primary" onClick={start} style={{ flex: 1 }}>▶ Iniciar</button>}
        {running  && <button className="btn" onClick={stop} style={{ flex: 1 }}>❚❚ Detener</button>}
        <button className="btn" onClick={lap} disabled={!running}>⚐ Vuelta</button>
        <button className="btn btn-ghost" onClick={reset}>↻ Reset</button>
        <button className="btn" onClick={() => selectSlide({
          type: 'stopwatch', text: formatStopwatch(current), reference: 'Cronómetro',
        })}>Proyectar</button>
      </div>

      {laps.length > 0 && (
        <div className="card" style={{ padding: 16, maxHeight: 280, overflowY: 'auto' }}>
          <div className="section-h" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 13 }}>Vueltas</h3>
            <span className="sub">{laps.length}</span>
          </div>
          {laps.map(lap => (
            <div key={lap.n} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 0',
              borderBottom: '1px solid var(--line-1)', fontSize: 13, fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ color: 'var(--text-3)' }}>#{lap.n}</span>
              <span style={{ color: 'var(--text-1)' }}>{formatStopwatch(lap.time)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function formatStopwatch(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const cs = Math.floor((ms % 1000) / 10)
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}.${pad(cs)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`
}

// ============================================================
// 3. VERSO ALEATORIO
// ============================================================
const VERSE_SCOPES = [
  { id: 'all',         label: 'Toda la Biblia',         range: null },
  { id: 'nt',          label: 'Nuevo Testamento',       range: [39, 65] },
  { id: 'ot',          label: 'Antiguo Testamento',     range: [0, 38] },
  { id: 'psalms',      label: 'Solo Salmos',            books: ['Salmos'] },
  { id: 'proverbs',    label: 'Solo Proverbios',        books: ['Proverbios'] },
  { id: 'gospels',     label: 'Solo Evangelios',        books: ['Mateo', 'Marcos', 'Lucas', 'Juan'] },
]

function VerseRandomWidget() {
  const [scope, setScope] = useState('all')
  const [versionId, setVersionId] = useState(getActiveVersion()?.id || 'rvr1960')
  const [versions] = useState(getAllVersions().filter(v => v.type === 'local' || v.type === 'imported'))
  const [books, setBooks] = useState([])
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBooks(versionId).then(setBooks).catch(() => {})
  }, [versionId])

  const draw = async () => {
    if (books.length === 0) return
    setLoading(true)
    try {
      const scopeData = VERSE_SCOPES.find(s => s.id === scope)
      let candidates = books
      if (scopeData?.range) {
        candidates = books.slice(scopeData.range[0], scopeData.range[1] + 1)
      } else if (scopeData?.books) {
        candidates = books.filter(b => scopeData.books.includes(b.name))
      }
      if (candidates.length === 0) { setLoading(false); return }

      const book = candidates[Math.floor(Math.random() * candidates.length)]
      const chapter = await getChapter(book.index, 1, versionId)
      const totalChapters = book.chapters || 1
      const randomChapter = Math.floor(Math.random() * Math.min(totalChapters, 50)) + 1
      let chapterData
      try {
        chapterData = await getChapter(book.index, randomChapter, versionId)
      } catch {
        chapterData = chapter
      }
      const verses = chapterData.verses
      const v = verses[Math.floor(Math.random() * verses.length)]
      const result = {
        text: v.text,
        reference: `${chapterData.bookName} ${chapterData.chapterNum}:${v.verseNum}`,
        type: 'bible',
      }
      setCurrent(result)
      setHistory(h => [result, ...h].slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 20 }}>
        <div className="section-h" style={{ marginBottom: 14 }}>
          <h3>Configuración</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div className="field">
            <span className="label">Versión</span>
            <select className="field-input" value={versionId} onChange={e => setVersionId(e.target.value)}>
              {versions.map(v => <option key={v.id} value={v.id}>{v.short} — {v.name}</option>)}
            </select>
          </div>
          <div className="field">
            <span className="label">Buscar en</span>
            <select className="field-input" value={scope} onChange={e => setScope(e.target.value)}>
              {VERSE_SCOPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 28, minHeight: 180 }}>
        {!current ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontStyle: 'italic' }}>
            Click en "Sortear" para obtener un versículo al azar.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--copper-200)',
              letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              {current.reference}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.5,
              color: 'var(--text-1)', margin: 0 }}>
              {current.text}
            </p>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={draw} disabled={loading} style={{ flex: 1 }}>
          🎲 {loading ? 'Sorteando...' : current ? 'Otro versículo' : 'Sortear'}
        </button>
        <button className="btn" disabled={!current}
          onClick={() => current && selectSlide(current)}>
          Proyectar al live
        </button>
      </div>

      {history.length > 1 && (
        <div className="card" style={{ padding: 14 }}>
          <div className="section-h" style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 13 }}>Últimos sorteados</h3>
          </div>
          {history.slice(1).map((v, i) => (
            <button key={i} onClick={() => setCurrent(v)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 6, marginBottom: 4,
                background: 'transparent', border: 0, cursor: 'pointer',
                color: 'var(--text-2)', fontSize: 12,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: 'var(--copper-200)', fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.1em', marginRight: 8 }}>{v.reference}</span>
              {v.text.slice(0, 80)}{v.text.length > 80 && '...'}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ============================================================
// 4. RULETA
// ============================================================
function WheelWidget() {
  const [namesText, setNamesText] = useState('Juan\nMaría\nPedro\nAna\nLucas')
  const [winner, setWinner] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [removeWinners, setRemoveWinners] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const intervalRef = useRef(null)

  const names = namesText.split('\n').map(n => n.trim()).filter(Boolean)

  const spin = () => {
    if (names.length === 0 || spinning) return
    setSpinning(true)
    setWinner(null)
    setHighlightIdx(0)

    // Animación: ir resaltando uno a uno, cada vez más lento
    let speed = 60
    let totalIters = 30 + Math.floor(Math.random() * 20)
    let count = 0
    const final = Math.floor(Math.random() * names.length)

    const tick = () => {
      setHighlightIdx(i => (i + 1) % names.length)
      count++
      if (count > totalIters * 0.7) speed += 20
      if (count > totalIters * 0.9) speed += 30

      if (count >= totalIters && (count - totalIters) >= ((final - (count % names.length) + names.length) % names.length)) {
        clearInterval(intervalRef.current)
        const finalName = names[final]
        setHighlightIdx(final)
        setWinner(finalName)
        setSpinning(false)
        if (removeWinners) {
          setNamesText(names.filter((_, i) => i !== final).join('\n'))
        }
        return
      }
      intervalRef.current = setTimeout(tick, speed)
    }
    intervalRef.current = setTimeout(tick, speed)
  }

  useEffect(() => () => clearTimeout(intervalRef.current), [])

  return (
    <>
      <div className="card" style={{ padding: 20 }}>
        <div className="section-h" style={{ marginBottom: 14 }}>
          <h3>Participantes</h3>
          <span className="sub">{names.length} {names.length === 1 ? 'nombre' : 'nombres'}</span>
        </div>
        <textarea className="field-input"
          rows={6}
          value={namesText}
          onChange={e => setNamesText(e.target.value)}
          placeholder="Un nombre por línea..."
          style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }}
          disabled={spinning} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
          fontSize: 13, color: 'var(--text-2)' }}>
          <input type="checkbox" checked={removeWinners} onChange={e => setRemoveWinners(e.target.checked)} />
          Quitar al ganador de la lista al terminar (sorteo sin repetir)
        </label>
      </div>

      {/* Lista visual de candidatos con el highlight */}
      <div className="card" style={{ padding: 18, minHeight: 180 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {names.map((n, i) => {
            const isHighlight = highlightIdx === i
            const isWinner = winner === n && !spinning
            return (
              <div key={i}
                style={{
                  padding: '14px 18px', borderRadius: 10, textAlign: 'center',
                  fontSize: isWinner ? 22 : 16,
                  fontWeight: isHighlight || isWinner ? 700 : 500,
                  fontFamily: isWinner ? 'var(--font-display)' : 'inherit',
                  background: isWinner
                    ? 'linear-gradient(180deg, var(--copper-200), var(--copper-300))'
                    : isHighlight
                      ? 'linear-gradient(180deg, rgba(168,95,51,0.32), rgba(128,64,18,0.18))'
                      : 'var(--bg-2)',
                  color: isWinner ? '#1a0e08' : isHighlight ? 'var(--copper-100)' : 'var(--text-2)',
                  border: '1px solid ' + (isWinner ? 'var(--copper-200)' : isHighlight ? 'rgba(232,181,145,0.4)' : 'var(--line-1)'),
                  transition: 'all 0.1s ease',
                  boxShadow: isWinner ? 'var(--shadow-glow-copper)' : 'none',
                }}>
                {n}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={spin} disabled={names.length < 2 || spinning} style={{ flex: 1 }}>
          {spinning ? 'Girando...' : '🎡 Girar ruleta'}
        </button>
        <button className="btn" disabled={!winner || spinning}
          onClick={() => winner && selectSlide({
            type: 'wheel',
            text: winner,
            reference: '¡Ganador!',
          })}>
          Proyectar ganador
        </button>
      </div>
    </>
  )
}

// ============================================================
// HELPERS
// ============================================================
function NumberField({ label, value, onChange, min = 0, max = 99 }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="number" min={min} max={max} value={value}
        onChange={e => {
          let v = parseInt(e.target.value || '0', 10)
          if (isNaN(v)) v = 0
          v = Math.max(min, Math.min(max, v))
          onChange(v)
        }}
        className="field-input"
        style={{ fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: 18 }} />
    </div>
  )
}
