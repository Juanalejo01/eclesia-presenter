import { useEffect, useState } from 'react'
import { LogoMonogram } from './Icons.jsx'

/**
 * Pantalla de arranque animada (1.6 segundos total).
 *
 * Timeline:
 *   0.0s  Logo grande + nombre, ya visibles (entrada con zoom-in)
 *   0.0s→0.6s   Zoom-in del logo (de 0.85 a 1.0) + slide-up del nombre
 *   0.6s→1.0s   Hold
 *   1.0s→1.5s   Fade-out + slide-up adicional + zoom-out del logo (a 1.1)
 *   1.6s  Componente se desmonta
 *
 * Si la build es lenta, el componente sigue mostrándose mientras App.jsx
 * carga en segundo plano, así no se ve "una pantalla en blanco".
 */
export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('in')  // 'in' | 'hold' | 'out' | 'done'

  useEffect(() => {
    const tHold   = setTimeout(() => setPhase('hold'),    600)
    const tOut    = setTimeout(() => setPhase('out'),    1000)
    const tDone   = setTimeout(() => setPhase('done'),   1600)
    const tNotify = setTimeout(() => onFinish?.(),       1600)
    return () => { clearTimeout(tHold); clearTimeout(tOut); clearTimeout(tDone); clearTimeout(tNotify) }
  }, [onFinish])

  if (phase === 'done') return null

  return (
    <div className={'splash splash-' + phase}>
      <div className="splash-bg" />
      <div className="splash-content">
        <div className="splash-logo">
          <LogoMonogram size={120} />
        </div>
        <div className="splash-name">
          Eclesia<em>Presenter</em>
        </div>
        <div className="splash-tagline">
          presentación con propósito
        </div>
      </div>
      <SplashStyles />
    </div>
  )
}

// CSS inline para que no dependa de cargar el bundle (aparece instantáneo).
function SplashStyles() {
  return (
    <style>{`
      .splash {
        position: fixed; inset: 0; z-index: 9999;
        display: grid; place-items: center;
        background: radial-gradient(ellipse at center, #1c1614 0%, #0c0a09 70%);
        animation: splash-bg-fade 0.3s ease-out;
        user-select: none; -webkit-user-select: none;
      }
      .splash-bg {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse 60% 40% at center, rgba(168,95,51,0.18), transparent 60%);
        opacity: 0; animation: splash-glow 1.4s ease-out forwards;
      }
      .splash-content {
        position: relative; z-index: 2;
        display: flex; flex-direction: column; align-items: center; gap: 18px;
      }
      .splash-logo {
        animation: splash-logo-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        transform: scale(0.4); opacity: 0;
      }
      .splash-name {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: clamp(32px, 4vw, 48px);
        color: #f5ebe0;
        letter-spacing: 0.01em;
        font-weight: 500;
        transform: translateY(20px); opacity: 0;
        animation: splash-text-in 0.6s 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .splash-name em {
        color: #db9f75;
        font-style: italic;
      }
      .splash-tagline {
        font-family: 'Geist Mono', 'Courier New', monospace;
        font-size: 11px;
        color: #8a7866;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        opacity: 0;
        animation: splash-text-in 0.6s 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* Salida: fade + slide-up + zoom-out */
      .splash-out { animation: splash-out 0.6s cubic-bezier(0.4, 0, 0.6, 1) forwards; }

      @keyframes splash-bg-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes splash-glow {
        from { opacity: 0; transform: scale(0.7); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes splash-logo-in {
        0%   { transform: scale(0.4) translateY(-8px); opacity: 0; filter: blur(8px); }
        70%  { transform: scale(1.08) translateY(0);   opacity: 1; filter: blur(0); }
        100% { transform: scale(1) translateY(0);      opacity: 1; filter: blur(0); }
      }
      @keyframes splash-text-in {
        from { transform: translateY(20px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes splash-out {
        0%   { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(1.12) translateY(-20px); }
      }
    `}</style>
  )
}
