import SlideTransition from './SlideTransition.jsx'

/**
 * Renderizador estilo "lower-third" para la ventana overlay capturable por OBS.
 *
 * - Ventana 1920×1080 con fondo TRANSPARENTE
 * - El texto vive solo en la banda inferior (últimos ~300px)
 * - OBS captura la ventana completa pero como es transparente, solo se ve la banda
 * - Permite sobreponerla a una cámara o video de la transmisión
 *
 * Características visuales:
 * - Banda con gradiente sutil + barra cobre a la izquierda (estilo broadcast)
 * - Texto en serif para versículos/canciones, mono para la referencia
 * - Sombra fuerte para que sea legible sobre cualquier fondo
 */
export default function LowerThirdRenderer({ slide, theme }) {
  // Override del slide tiene prioridad (igual que en SlideRenderer)
  const fontColor = (slide?.fontColor) || theme?.fontColor || '#ffffff'
  const fontFamily = (slide?.fontFamily) || theme?.fontFamily || '"Cormorant Garamond", serif'
  const showReference = theme?.referenceVisible !== false

  const isBlank = !slide || slide.type === 'blank' || slide.type === 'blackout'

  const renderContent = (s) => (
    <div style={{
      position: 'absolute',
      left: 80,
      right: 80,
      bottom: 90,
      padding: '32px 48px 32px 56px',
      background: 'linear-gradient(180deg, rgba(20, 16, 13, 0.0) 0%, rgba(20, 16, 13, 0.85) 60%, rgba(20, 16, 13, 0.95) 100%)',
      borderLeft: '6px solid #c8794a',  // copper-300
      borderRadius: '4px 12px 12px 4px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(232, 181, 145, 0.15)',
      backdropFilter: 'blur(2px)',
    }}>
      <p style={{
        margin: 0,
        color: fontColor,
        fontFamily,
        fontSize: '54px',
        fontWeight: 500,
        lineHeight: 1.2,
        letterSpacing: '0.005em',
        textShadow: '0 4px 20px rgba(0, 0, 0, 0.85), 0 2px 6px rgba(0, 0, 0, 0.95)',
        whiteSpace: 'pre-line',
        // máximo 3 líneas; si excede, recortar con ellipsis (debería usarse auto-split)
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{s.text}</p>

      {s.reference && showReference && (
        <p style={{
          margin: '14px 0 0',
          fontFamily: '"Geist Mono", "SF Mono", monospace',
          fontSize: '18px',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#db9f75',  // copper-200
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
        }}>{s.reference}</p>
      )}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'transparent',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {!isBlank && <SlideTransition slide={slide} theme={theme} render={renderContent} />}
    </div>
  )
}
