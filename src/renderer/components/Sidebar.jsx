import {
  IconBible, IconMusic, IconList, IconProjector, IconLayers,
  IconImage, IconVideo, IconType, IconBroadcast,
} from './Icons.jsx'

const NAV = [
  { id: 'bible',       label: 'Biblia',      Icon: IconBible,     badge: 66, shortcut: '1' },
  { id: 'songs',       label: 'Canciones',   Icon: IconMusic,                shortcut: '2' },
  { id: 'schedule',    label: 'Lista',       Icon: IconList,                 shortcut: '3' },
  { id: 'image',       label: 'Imagen',      Icon: IconImage,                shortcut: '4' },
  { id: 'video',       label: 'Video',       Icon: IconVideo,                shortcut: '5' },
  { id: 'text',        label: 'Texto',       Icon: IconType,                 shortcut: '6' },
  { id: 'projection',  label: 'Proyección',  Icon: IconProjector,            shortcut: '7' },
  { id: 'transmision', label: 'Transmisión', Icon: IconBroadcast,            shortcut: '8' },
]

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      {NAV.map(({ id, label, Icon, badge, shortcut }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={`${label} · Ctrl+${shortcut}`}
          className={'nav-item' + (active === id ? ' active' : '')}
        >
          <span className="nav-icon-wrap">
            <Icon size={18} />
            {badge && <span className="nav-badge">{badge}</span>}
          </span>
          <span>{label}</span>
        </button>
      ))}
      <div className="sidebar-divider" />
      <div className="sidebar-bottom">
        <button className="nav-item" title="Capas">
          <span className="nav-icon-wrap"><IconLayers size={18} /></span>
        </button>
      </div>
    </aside>
  )
}
