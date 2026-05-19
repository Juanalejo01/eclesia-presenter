// Custom thin-stroke icon set for EclesiaPresenter
const Icon = ({ children, size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}>
    {children}
  </svg>
)

export const IconBible = (p) => <Icon {...p}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 0 3 3"/><path d="M12 8v6M9.5 11h5"/></Icon>
export const IconMusic = (p) => <Icon {...p}><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></Icon>
export const IconList = (p) => <Icon {...p}><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="0.8" fill="currentColor"/><circle cx="4" cy="12" r="0.8" fill="currentColor"/><circle cx="4" cy="18" r="0.8" fill="currentColor"/></Icon>
export const IconProjector = (p) => <Icon {...p}><rect x="2.5" y="7" width="19" height="11" rx="2"/><circle cx="9" cy="12.5" r="2.5"/><path d="M16 11h2.5M16 14h2.5"/><path d="M7 18v2M17 18v2"/></Icon>
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></Icon>
export const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="2.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>
export const IconExternal = (p) => <Icon {...p}><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></Icon>
export const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>
export const IconX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>
export const IconCheck = (p) => <Icon {...p}><path d="m5 12 4.5 4.5L19 7"/></Icon>
export const IconStar = (p) => <Icon {...p}><path d="m12 3 2.7 5.7 6.3.9-4.5 4.5 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.6l6.3-.9z"/></Icon>
export const IconStarFill = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" style={style}>
    <path d="m12 3 2.7 5.7 6.3.9-4.5 4.5 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.6l6.3-.9z"/>
  </svg>
)
export const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>
export const IconArrowDown = (p) => <Icon {...p}><path d="M12 5v14M5 13l7 7 7-7"/></Icon>
export const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 11l7-7 7 7"/></Icon>
export const IconRefresh = (p) => <Icon {...p}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></Icon>
export const IconEdit = (p) => <Icon {...p}><path d="M14 4l4.5-1.5L20 4l-1.5 1.5z"/><path d="M14 4 5.5 12.5 4 19l6.5-1.5L19 9"/></Icon>
export const IconTrash = (p) => <Icon {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></Icon>
export const IconMonitor = (p) => <Icon {...p}><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 21h6M12 17v4"/></Icon>
export const IconLayers = (p) => <Icon {...p}><path d="M12 2 2 7l10 5 10-5z"/><path d="M2 12 12 17 22 12"/><path d="M2 17 12 22 22 17"/></Icon>
export const IconChevDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>
export const IconPlay = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M7 5v14l12-7z"/></svg>
)
export const IconPause = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}><rect x="6" y="5" width="4" height="14" rx="0.5"/><rect x="14" y="5" width="4" height="14" rx="0.5"/></svg>
)
export const IconImage = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></Icon>
export const IconVideo = (p) => <Icon {...p}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/></Icon>
export const IconType = (p) => <Icon {...p}><path d="M4 7V5h16v2"/><path d="M9 19h6M12 5v14"/></Icon>
export const IconBroadcast = (p) => <Icon {...p}><circle cx="12" cy="12" r="2"/><path d="M16.5 7.5a6 6 0 0 1 0 9M7.5 16.5a6 6 0 0 1 0-9"/><path d="M19.5 4.5a10 10 0 0 1 0 15M4.5 19.5a10 10 0 0 1 0-15"/></Icon>
export const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>
export const IconUpload = (p) => <Icon {...p}><path d="M12 16V4M5 11l7-7 7 7"/><path d="M5 20h14"/></Icon>
export const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>
export const IconKey = (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m10.85 12.15 9.65-9.65"/><path d="m18 5 1.5 1.5"/><path d="m15 8 1.5 1.5"/></Icon>
export const IconTools = (p) => <Icon {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Icon>
export const IconHourglass = (p) => <Icon {...p}><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></Icon>
export const IconTimer = (p) => <Icon {...p}><circle cx="12" cy="14" r="8"/><path d="M5 2l-2 2M19 2l2 2M9 1h6M12 11v3l2 2"/></Icon>
export const IconDice = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></Icon>
export const IconWheel = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6"/></Icon>

// Brand monogram logo — copper-gradient stylized "E"
export const LogoMonogram = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <defs>
      <linearGradient id="lg-mono-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3a2718"/>
        <stop offset="100%" stopColor="#1a1410"/>
      </linearGradient>
      <linearGradient id="lg-mono-stroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5dec8"/>
        <stop offset="50%" stopColor="#db9f75"/>
        <stop offset="100%" stopColor="#804012"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="34" height="34" rx="9" fill="url(#lg-mono-bg)" stroke="url(#lg-mono-stroke)" strokeWidth="1"/>
    <g stroke="url(#lg-mono-stroke)" strokeWidth="1.6" strokeLinecap="round" fill="none">
      <path d="M11 9.5 V26.5"/>
      <path d="M11 9.5 H24"/>
      <path d="M11 18 H21"/>
      <path d="M11 26.5 H24"/>
    </g>
    <circle cx="26.5" cy="11" r="1.2" fill="#f5dec8" opacity="0.9"/>
  </svg>
)
