import Link from 'next/link'

export default function PricingTeaser() {
  return (
    <section className="relative py-24 border-t border-copper-300/10">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
            Precios honestos
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-ink-1 mb-4">
            Free para siempre · <em className="italic text-copper-200">Pro</em> cuando lo necesites
          </h2>
          <p className="max-w-2xl mx-auto text-ink-2">
            Empieza gratis. Cuando tu iglesia crezca, desbloquea biblias modernas, sin marca de agua y soporte directo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-copper-300/15 bg-bg-2 p-8 flex flex-col">
            <div className="mb-6">
              <div className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">Free</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl text-ink-1">0€</span>
                <span className="text-ink-3 text-sm">/ siempre</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-ink-2 flex-1 mb-6">
              <Bullet>1 biblia (RVR 1909)</Bullet>
              <Bullet>5 canciones máximo</Bullet>
              <Bullet>Proyección básica</Bullet>
              <Bullet>Marca de agua sutil</Bullet>
              <Bullet>Comunidad GitHub</Bullet>
            </ul>
            <Link
              href="/download"
              className="inline-flex items-center justify-center h-11 rounded-lg
                         border border-copper-300/20 bg-bg-3
                         text-ink-1 font-medium hover:bg-bg-4 transition-all"
            >
              Descargar gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-copper-300/40
                          bg-gradient-to-br from-copper-300/10 to-bg-2 p-8 flex flex-col
                          shadow-copper-glow">
            <span className="absolute -top-3 left-8 px-3 py-1 rounded-full
                            bg-gradient-to-b from-copper-200 to-copper-300
                            text-[#1a0e08] text-[10px] font-mono uppercase tracking-widest font-bold">
              Recomendado
            </span>
            <div className="mb-6">
              <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-2">Pro</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl text-ink-1">9€</span>
                <span className="text-ink-3 text-sm">/ mes</span>
              </div>
              <p className="text-xs text-copper-200 mt-1">o 79€/año (ahorra ~27%)</p>
            </div>
            <ul className="space-y-2 text-sm text-ink-2 flex-1 mb-6">
              <Bullet copper>10 biblias modernas (RVR60, NVI, NTV…)</Bullet>
              <Bullet copper>Canciones ilimitadas + SQLite</Bullet>
              <Bullet copper>Lower-third OBS personalizable</Bullet>
              <Bullet copper>Stage Display (modo presentador)</Bullet>
              <Bullet copper>Sin marca de agua</Bullet>
              <Bullet copper>Soporte por email</Bullet>
              <Bullet copper>Updates incluidos</Bullet>
            </ul>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center h-11 rounded-lg
                         bg-gradient-to-b from-copper-200 to-copper-300
                         text-[#1a0e08] font-semibold
                         hover:from-copper-100 hover:to-copper-200 transition-all"
            >
              Ver todos los planes
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-ink-3 mt-10">
          Pago seguro vía Stripe · Cancela cuando quieras · 30 días de garantía
        </p>
      </div>
    </section>
  )
}

function Bullet({ children, copper }) {
  return (
    <li className="flex items-start gap-2">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
        <path d="M3 8.5 L6.5 12 L13 4.5"
          stroke={copper ? '#db9f75' : '#8a7866'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  )
}
