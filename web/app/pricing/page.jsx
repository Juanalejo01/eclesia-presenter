import Link from 'next/link'

export const metadata = {
  title: 'Precios — EclesiaPresenter',
  description: 'Planes Free y Pro. Pago seguro vía Stripe. Cancela cuando quieras.',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0€',
    period: 'siempre',
    description: 'Perfecto para empezar y para iglesias pequeñas.',
    features: [
      '3 biblias (RVR 1960, NVI, RVR 1909)',
      'Hasta 5 canciones',
      'Proyección a pantalla completa',
      'Lista del día básica',
      'Tema visual claro/oscuro',
      'Marca de agua sutil',
    ],
    cta: 'Descargar gratis',
    href: '/download',
    accent: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Mensual',
    price: '9€',
    period: '/mes',
    description: 'Para iglesias activas. Cancela cuando quieras.',
    features: [
      '10 biblias modernas (RVR 1960, NVI, NTV, DHH…)',
      'Canciones ilimitadas con SQLite',
      'Lower-third para OBS Studio',
      'Stage Display (pantalla del músico)',
      'Drag & drop de imágenes/videos',
      'Sin marca de agua',
      'Backup automático en la nube',
      'Soporte por email',
      'Updates incluidos',
    ],
    cta: 'Empezar prueba',
    href: '/login?plan=pro_monthly',
    accent: false,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Anual',
    price: '79€',
    period: '/año',
    discount: 'Ahorra 29€ (~27%)',
    description: 'El más popular. Equivale a 6.5€/mes.',
    features: [
      'Todo lo de Pro Mensual',
      'Ahorro de 29€ vs pagar mensual',
      '3 PCs simultáneos',
      'Acceso a betas tempranas',
      'Soporte prioritario',
      'Descuento para CCLI/integradores',
    ],
    cta: 'Empezar prueba',
    href: '/login?plan=pro_yearly',
    accent: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '249€',
    period: 'una vez',
    description: 'Pago único. Tuyo para siempre.',
    features: [
      'Todo lo de Pro Anual',
      'Sin cuotas recurrentes nunca',
      'Updates de por vida',
      'Hasta 3 PCs simultáneos',
      'Migración fácil entre equipos',
      'Soporte prioritario de por vida',
    ],
    cta: 'Comprar Lifetime',
    href: '/login?plan=lifetime',
    accent: false,
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-7xl">
      <div className="text-center mb-16">
        <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
          Precios honestos
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-ink-1 mb-4">
          Elige el plan <em className="italic text-copper-200">que mejor te quede</em>
        </h1>
        <p className="max-w-2xl mx-auto text-ink-2 text-lg">
          Empieza gratis. Actualiza cuando tu iglesia crezca. Sin sorpresas en la factura.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={'relative rounded-2xl p-7 flex flex-col transition-all hover:translate-y-[-2px] ' +
              (plan.accent
                ? 'border-2 border-copper-300/50 bg-gradient-to-br from-copper-300/10 to-bg-2 shadow-copper-glow'
                : 'border border-copper-300/15 bg-bg-2')}>

            {plan.accent && (
              <span className="absolute -top-3 left-7 px-3 py-1 rounded-full
                              bg-gradient-to-b from-copper-200 to-copper-300
                              text-[#1a0e08] text-[10px] font-mono uppercase tracking-widest font-bold">
                Más popular
              </span>
            )}

            <div className="mb-6">
              <div className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl text-ink-1">{plan.price}</span>
                <span className="text-ink-3 text-sm">{plan.period}</span>
              </div>
              {plan.discount && (
                <p className="text-xs text-copper-200 mt-1">{plan.discount}</p>
              )}
              <p className="text-xs text-ink-3 mt-3 leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-2 text-sm text-ink-2 flex-1 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-1 flex-shrink-0">
                    <path d="M3 8.5 L6.5 12 L13 4.5"
                      stroke={plan.accent ? '#db9f75' : '#8a7866'}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={'inline-flex items-center justify-center h-11 rounded-lg text-sm font-semibold transition-all ' +
                (plan.accent
                  ? 'bg-gradient-to-b from-copper-200 to-copper-300 text-[#1a0e08] hover:from-copper-100 hover:to-copper-200'
                  : 'border border-copper-300/20 bg-bg-3 text-ink-1 hover:bg-bg-4')}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center text-ink-1 mb-12">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          <FaqItem q="¿Puedo cancelar cuando quiera?">
            Sí. Puedes cancelar desde tu panel de cuenta en un click. Mantienes acceso hasta el final
            del periodo pagado y luego pasas a Free automáticamente.
          </FaqItem>
          <FaqItem q="¿Qué pasa con mis canciones si cancelo?">
            Tus canciones nunca desaparecen. Exporta tu biblioteca a JSON en cualquier momento desde
            Ajustes → Canciones. Si superas el límite de Free, las canciones quedan visibles pero solo
            puedes proyectar las 5 primeras hasta que vuelvas a Pro.
          </FaqItem>
          <FaqItem q="¿Cuántos PCs puedo usar?">
            <b>Free</b>: 1 PC. <b>Pro Mensual</b>: 1 PC. <b>Pro Anual y Lifetime</b>: hasta 3 PCs
            simultáneos. Puedes desactivar uno y activar otro desde tu panel cuando cambies de equipo.
          </FaqItem>
          <FaqItem q="¿Aceptan PayPal?">
            Procesamos pagos vía Stripe que acepta tarjetas, Apple Pay, Google Pay, SEPA (transferencia
            europea) y otros métodos. PayPal está en evaluación.
          </FaqItem>
          <FaqItem q="¿Garantía de devolución?">
            30 días. Si la app no es lo que esperabas, te devolvemos el dinero sin preguntas.
          </FaqItem>
          <FaqItem q="¿Hay descuentos para iglesias pequeñas / misiones?">
            Sí. Escríbenos a <a href="mailto:hola@eclesiapresenter.com" className="text-copper-200 hover:text-copper-100">hola@eclesiapresenter.com</a>
            {' '}con tu caso y vemos qué podemos hacer.
          </FaqItem>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, children }) {
  return (
    <details className="group rounded-xl border border-copper-300/10 bg-bg-2/50 overflow-hidden">
      <summary className="cursor-pointer p-5 flex items-center justify-between
                          text-ink-1 font-medium hover:bg-bg-3/30 transition-colors">
        {q}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
          className="text-copper-200 transition-transform group-open:rotate-180">
          <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-5 pb-5 text-sm text-ink-2 leading-relaxed">{children}</div>
    </details>
  )
}
