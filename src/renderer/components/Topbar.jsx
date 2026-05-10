import { useEffect, useState } from 'react'
import Settings from './Settings.jsx'
import { LogoMonogram, IconSettings } from './Icons.jsx'
import { useT } from '../services/i18n.js'

export default function Topbar({ onSettingsChange }) {
  const t = useT()
  const [showSettings, setShowSettings] = useState(false)
  const [time, setTime] = useState(formatNow())
  const [projectorOn, setProjectorOn] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setTime(formatNow()), 1000)
    return () => clearInterval(id)
  }, [])

  // Abrir la ventana de proyección moderna (background = pantalla completa para el proyector físico).
  // Antes esto llamaba a window.electron.openPresenter() que cargaba la app entera de nuevo.
  const openPresenter = async () => {
    const proj = window.electron?.projection
    if (!proj) {
      alert('La proyección requiere la app nativa (npm run dev). En navegador no funciona.')
      return
    }
    try {
      const state = await proj.state()
      if (state.open.includes('background')) await proj.close('background')
      await proj.open({ mode: 'background' })
    } catch (e) {
      console.error('openPresenter failed:', e)
    }
  }

  return (
    <>
      <header className="header">
        <div className="brand">
          <div className="brand-mark"><LogoMonogram size={28} /></div>
          <div className="brand-name">Eclesia<em>Presenter</em></div>
          <span className="brand-version">v 0.2</span>
        </div>

        <div className="header-status">
          <span className="status-pill">
            <span className={'dot ' + (projectorOn ? '' : 'off')} />
            {projectorOn ? t('topbar.connected') : t('topbar.disconnected')}
          </span>
          <span className="timecode">{time}</span>
          <span style={{ flex: 1 }} />
        </div>

        <div className="header-actions">
          <button className="btn" onClick={() => setShowSettings(true)} title={t('topbar.settings')}>
            <IconSettings size={14} /> {t('topbar.settings')}
          </button>
          <button className="btn btn-primary" onClick={openPresenter}>
            {t('topbar.openProjector')}
          </button>
        </div>
      </header>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} onUpdate={onSettingsChange} />
      )}
    </>
  )
}

function formatNow() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
