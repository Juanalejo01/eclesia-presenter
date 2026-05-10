import { useEffect, useState } from 'react'
import App from './App.jsx'
import ProjectionView from './pages/ProjectionView.jsx'
import StageDisplay from './pages/StageDisplay.jsx'

function getRoute() {
  return (window.location.hash || '#/').split('?')[0]
}

function getMode() {
  const params = new URLSearchParams((window.location.hash || '').split('?')[1] || '')
  return params.get('mode')
}

export default function Router() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  if (route.startsWith('#/projection')) {
    // Modo 'stage' (presentador) usa una vista distinta a 'background'/'overlay'
    if (getMode() === 'stage') return <StageDisplay />
    return <ProjectionView />
  }
  return <App />
}
