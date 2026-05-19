import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import BiblePanel from './components/BiblePanel.jsx'
import SongsPanel from './components/SongsPanel.jsx'
import SchedulePanel from './components/SchedulePanel.jsx'
import ProjectionPanel from './components/ProjectionPanel.jsx'
import ImagePanel from './components/ImagePanel.jsx'
import VideoPanel from './components/VideoPanel.jsx'
import TextPanel from './components/TextPanel.jsx'
import ToolsPanel from './components/ToolsPanel.jsx'
import TransmisionPanel from './components/TransmisionPanel.jsx'
import SlidePreview from './components/SlidePreview.jsx'
import Topbar from './components/Topbar.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import Settings from './components/Settings.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import { useGlobalShortcuts, subscribe, emit } from './hooks/useShortcuts.js'
import { selectSlide, setLive, useSlideStore } from './services/slideStore.js'
import { syncFromMain } from './services/themeStore.js'
import { refreshImportedVersions } from './services/bibleService.js'

const PANELS = {
  bible:       BiblePanel,
  songs:       SongsPanel,
  schedule:    SchedulePanel,
  image:       ImagePanel,
  video:       VideoPanel,
  text:        TextPanel,
  tools:       ToolsPanel,
  projection:  ProjectionPanel,
  transmision: TransmisionPanel,
}

const BLANK_SLIDE    = { type: 'blank', text: '', reference: '' }
const BLACKOUT_SLIDE = { type: 'blackout', text: '', reference: '' }

export default function App() {
  const [activePanel, setActivePanel] = useState('bible')
  const [settingsRev, setSettingsRev] = useState(0)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const { live } = useSlideStore()

  useEffect(() => {
    syncFromMain()
    refreshImportedVersions()  // carga las biblias importadas para que aparezcan en el selector
  }, [])

  // Eventos globales emitidos desde shortcuts
  useEffect(() => {
    const offSettings = subscribe('settings:open', () => setSettingsOpen(true))
    const offFullscreen = subscribe('projection:toggle-fullscreen', async () => {
      if (!window.electron?.projection) return
      const state = await window.electron.projection.state()
      if (state.open.includes('background')) {
        await window.electron.projection.close('background')
      } else {
        await window.electron.projection.open({ mode: 'background' })
      }
    })

    // Eventos del control remoto móvil → traducir a acciones de la app
    const offRemote = window.electron?.server?.onRemoteEvent?.((name, payload) => {
      switch (name) {
        case 'next':  emit('navigate:next'); break
        case 'prev':  emit('navigate:prev'); break
        case 'blank': setLive(BLANK_SLIDE); break
        case 'black': setLive(BLACKOUT_SLIDE); break
        case 'clear': setLive(null); break

        case 'bible-ref':
          // Búsqueda libre desde móvil (ej. "salmos 22:1").
          // Cambiamos al panel Biblia y emitimos un evento que BiblePanel escucha.
          setActivePanel('bible')
          // Pequeño delay para que el panel esté montado antes de buscar
          setTimeout(() => emit('bible:remote-search', payload), 80)
          break

        case 'song':
          // El móvil pidió proyectar una canción por id.
          // Cambiamos al panel canciones y emitimos al SongsPanel.
          setActivePanel('songs')
          setTimeout(() => emit('songs:remote-project', payload), 80)
          break
      }
    })

    return () => { offSettings(); offFullscreen(); offRemote?.() }
  }, [])

  useGlobalShortcuts({
    onPanelChange: setActivePanel,
    onBlank: (kind) => setLive(kind === 'blackout' ? BLACKOUT_SLIDE : BLANK_SLIDE),
    onClearSlide: () => setLive(null),
    onOpenPalette: () => setPaletteOpen(true),
  })

  const Panel = PANELS[activePanel] || BiblePanel

  return (
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      <div className="vignette" />
      <div className="app-shell">
        <Topbar
          onSettingsChange={() => setSettingsRev(r => r + 1)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className="main-grid">
          <Sidebar active={activePanel} onChange={setActivePanel} />
          <Panel key={settingsRev} onSendSlide={selectSlide} slide={live} />
          <SlidePreview />
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPanelChange={setActivePanel}
      />
      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          onUpdate={() => setSettingsRev(r => r + 1)}
        />
      )}
    </>
  )
}
