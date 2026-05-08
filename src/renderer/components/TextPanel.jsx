import { useState } from 'react'
import { addItem as addToSchedule } from '../services/scheduleService.js'
import {
  IconArrowRight, IconPlus, IconBell, IconType,
} from './Icons.jsx'

/**
 * Panel "Texto" — alertas y texto rápido para proyectar.
 * Plantillas comunes (receso, ofrenda, oración, bienvenida) + entrada libre.
 * El usuario puede ajustar el énfasis (info / aviso / urgente) que cambia el color.
 */

const TEMPLATES = [
  { id: 'bienvenida', label: 'Bienvenida',     text: '¡Bienvenidos!',                   sub: '' },
  { id: 'oracion',    label: 'Oración',        text: 'Inclinemos la cabeza\nen oración', sub: '' },
  { id: 'ofrenda',    label: 'Ofrenda',        text: 'Tiempo de ofrenda',                sub: 'Malaquías 3:10' },
  { id: 'receso',     label: 'Receso',         text: 'Receso',                           sub: '15 minutos' },
  { id: 'pueden',     label: 'Pueden pasar',   text: 'Pueden pasar al frente',           sub: '' },
  { id: 'ministros',  label: 'Ministros',      text: 'Pasan los ministros',              sub: '' },
  { id: 'silencio',   label: 'Silencio',       text: 'Silencio, por favor',              sub: '' },
  { id: 'final',      label: 'Bendición',      text: 'Que Dios les bendiga',             sub: '' },
]

const EMPHASIS = [
  { id: 'normal',  label: 'Normal',  color: '#f4e6d7', bg: 'gradient' },
  { id: 'aviso',   label: 'Aviso',   color: '#fff5d6', bg: 'amber' },
  { id: 'urgente', label: 'Urgente', color: '#ffe6e6', bg: 'red' },
]

function backgroundFor(emphasisId) {
  if (emphasisId === 'aviso')   return 'linear-gradient(135deg, #5c4318 0%, #1a1410 100%)'
  if (emphasisId === 'urgente') return 'linear-gradient(135deg, #5c1818 0%, #1a0e0e 100%)'
  return 'linear-gradient(135deg, #14100d 0%, #2a2018 100%)'
}

export default function TextPanel({ onSendSlide }) {
  const [text, setText]           = useState('')
  const [reference, setReference] = useState('')
  const [emphasis, setEmphasis]   = useState('normal')

  const project = () => {
    if (!text.trim()) return
    onSendSlide({
      type: 'text',
      text: text.trim(),
      reference: reference.trim(),
      bgType: 'gradient',
      bgGradient: emphasis === 'aviso'   ? ['#5c4318', '#1a1410']
                : emphasis === 'urgente' ? ['#5c1818', '#1a0e0e']
                : ['#14100d', '#2a2018'],
      fontColor: EMPHASIS.find(e => e.id === emphasis)?.color || '#f4e6d7',
    })
  }

  const addToList = () => {
    if (!text.trim()) return
    addToSchedule({
      type: 'note',
      title: text.trim().split('\n')[0].slice(0, 60),
      text: text.trim(),
      reference: reference.trim(),
      meta: { emphasis },
    })
  }

  const applyTemplate = (tpl) => {
    setText(tpl.text)
    setReference(tpl.sub || '')
  }

  const lines = text.split('\n').length
  const chars = text.length

  return (
    <div className="workspace">
      <div className="ws-header">
        <div className="ws-title">
          <h1 className="ws-h1">Texto</h1>
          <span className="ws-sub">Alertas, avisos y texto rápido para proyección</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={addToList} disabled={!text.trim()}>
            <IconPlus size={14} /> Añadir a lista
          </button>
          <button className="btn btn-primary" onClick={project} disabled={!text.trim()}>
            <IconArrowRight size={14} /> Proyectar
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Énfasis (color/tono) */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-h" style={{ marginBottom: 10 }}>
              <h3>Tono del aviso</h3>
              <span className="sub">define color de fondo y texto</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {EMPHASIS.map(e => (
                <button key={e.id}
                  onClick={() => setEmphasis(e.id)}
                  className={'template-card' + (emphasis === e.id ? ' active' : '')}
                  style={{ position: 'relative', overflow: 'hidden' }}>
                  <span style={{
                    position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                    borderBottomLeftRadius: 'var(--r-xs)',
                    background:
                      e.id === 'aviso'   ? 'var(--preview)' :
                      e.id === 'urgente' ? 'var(--live)'    : 'var(--ready)',
                    boxShadow: '0 0 8px currentColor',
                  }} />
                  <span className="template-card-title">{e.label}</span>
                  <span className="template-card-meta">{e.color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plantillas comunes */}
          <div>
            <div className="section-h">
              <h3>Plantillas</h3>
              <span className="sub">{TEMPLATES.length} avisos comunes</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {TEMPLATES.map(tpl => (
                <button key={tpl.id} className="template-card"
                  onClick={() => applyTemplate(tpl)}>
                  <span className="template-card-title">{tpl.label}</span>
                  <span className="template-card-meta">
                    {tpl.text.split('\n').join(' · ').slice(0, 32)}
                    {tpl.text.length > 32 ? '…' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor de texto */}
          <div>
            <div className="section-h">
              <h3>Mensaje</h3>
              <span className="sub">{lines} líneas · {chars} caracteres</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Escribe el aviso aquí…"
                rows={4}
                className="field-input"
                style={{
                  border: 0, borderRadius: 0,
                  fontFamily: 'var(--font-display)', fontSize: 22,
                  padding: '20px 24px', lineHeight: 1.4, minHeight: 140,
                }} />
              <div style={{ borderTop: '1px solid var(--line-1)', padding: '10px 14px' }}>
                <input
                  className="field-input"
                  style={{ border: 0, padding: 0, height: 28, fontSize: 13 }}
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder='Referencia o subtítulo (opcional)' />
              </div>
            </div>
          </div>

          {/* Mini-preview del aviso */}
          <div>
            <div className="section-h">
              <h3>Vista previa</h3>
              <span className="sub">tono · {emphasis}</span>
            </div>
            <div style={{
              aspectRatio: '16 / 9',
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden', position: 'relative',
              background: backgroundFor(emphasis),
              boxShadow: 'var(--shadow-2)',
              border: '1px solid var(--line-1)',
              display: 'grid', placeItems: 'center', textAlign: 'center', padding: 40,
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 5vw, 56px)',
                  margin: 0, lineHeight: 1.2,
                  color: EMPHASIS.find(e => e.id === emphasis)?.color || '#f4e6d7',
                  whiteSpace: 'pre-line',
                  textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                }}>{text || <span style={{ color: 'var(--text-4)', fontStyle: 'italic' }}>(escribe arriba)</span>}</p>
                {reference && (
                  <p style={{
                    marginTop: 18, fontFamily: 'var(--font-mono)',
                    fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                  }}>{reference}</p>
                )}
              </div>
              {emphasis === 'urgente' && (
                <span className="tally live" style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="led" /> URGENTE
                </span>
              )}
              {emphasis === 'aviso' && (
                <span className="tally preview" style={{ position: 'absolute', top: 12, right: 12 }}>
                  <IconBell size={10} /> AVISO
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
