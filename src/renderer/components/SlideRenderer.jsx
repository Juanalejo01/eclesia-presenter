import SlideTransition from './SlideTransition.jsx'

/**
 * Renderizador unificado de un slide con tema aplicado.
 *
 * El SLIDE puede traer overrides (bgType, bgImage, bgVideo, bgGradient,
 * bgColor, fontColor) que tienen prioridad sobre el tema global. Esto permite
 * que paneles como Imagen / Video / Texto fuercen su propio fondo sin alterar
 * la configuración global del tema.
 *
 * Usa container queries (cqw) para escalar tipografías proporcionalmente
 * al ancho real del contenedor, asumiendo target 1920×1080.
 */
export default function SlideRenderer({ slide, theme, isBlackout = false }) {
  // Mezcla: el slide puede sobreescribir aspectos visuales del tema global.
  const eff = mergeThemeWithSlide(theme, slide)

  const showVideo = eff.bgType === 'video' && eff.bgVideo
  const bg =
      isBlackout ? '#000000'
    : eff.bgType === 'gradient' ? `linear-gradient(135deg, ${eff.bgGradient[0]}, ${eff.bgGradient[1]})`
    : eff.bgType === 'transparent' ? 'repeating-conic-gradient(#1a1410 0 25%, #2a1f17 0 50%) 50% / 14px 14px'
    : eff.bgType === 'image' && eff.bgImage ? `url("${eff.bgImage}") center/cover`
    : eff.bgType === 'video' ? '#000'
    : eff.bgColor

  const align = eff.textAlign === 'top' ? 'flex-start'
              : eff.textAlign === 'bottom' ? 'flex-end' : 'center'

  const fontSize   = `${(eff.fontSize / 1920) * 100}cqw`
  const refSize    = `${((eff.fontSize / 4) / 1920) * 100}cqw`
  const paddingPct = `${(40 / 1920) * 100}cqw`

  const renderContent = (s) => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: align, justifyContent: 'center',
      padding: paddingPct, boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '100%' }}>
        {s.text && (
          <p style={{
            color: eff.fontColor,
            fontSize,
            fontFamily: eff.fontFamily || 'var(--font-display)',
            fontWeight: eff.fontWeight ?? 500,
            textShadow: eff.textShadow ? '0 4px 20px rgba(0,0,0,0.6)' : 'none',
            lineHeight: 1.25, margin: 0, letterSpacing: '0.005em',
            whiteSpace: 'pre-line',
          }}>{s.text}</p>
        )}
        {s.reference && eff.referenceVisible !== false && (
          <p style={{
            marginTop: s.text ? refSize : 0, marginBottom: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: refSize,
            color: eff.fontColor, opacity: 0.7,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            textShadow: eff.textShadow ? '0 2px 6px rgba(0,0,0,0.6)' : 'none',
          }}>{s.reference}</p>
        )}
      </div>
    </div>
  )

  const isBlank = !slide || slide.type === 'blank' || slide.type === 'blackout'

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: bg,
      overflow: 'hidden',
      containerType: 'size',
    }}>
      {showVideo && !isBlackout && (
        <video src={eff.bgVideo}
          autoPlay
          loop={slide?.videoLoop !== false}
          muted={slide?.videoMuted !== false}
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {!isBlank && <SlideTransition slide={slide} theme={eff} render={renderContent} />}
      {isBlackout && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          color: 'var(--text-4)', fontFamily: 'var(--font-mono)', fontSize: 10,
        }}>
          ⬛ BLACKOUT
        </div>
      )}
    </div>
  )
}

/**
 * Combina el tema global con los overrides que pueda traer el slide.
 * Solo las propiedades visuales presentes en el slide reemplazan al tema.
 */
function mergeThemeWithSlide(theme, slide) {
  if (!slide) return theme
  const out = { ...theme }
  const keys = ['bgType', 'bgColor', 'bgGradient', 'bgImage', 'bgVideo',
                'fontColor', 'fontFamily', 'fontSize', 'fontWeight',
                'textAlign', 'textShadow', 'referenceVisible']
  for (const k of keys) {
    if (slide[k] !== undefined) out[k] = slide[k]
  }
  return out
}
