import Link from 'next/link'

export const metadata = {
  title: 'Contacto — EclesiaPresenter',
  description: 'Habla con nosotros sobre planes para iglesia grande, soporte, alianzas o cualquier duda.',
}

const REASONS = [
  {
    key: 'iglesia-grande',
    title: 'Plan Iglesia Grande',
    desc: 'Más de 5 PCs simultáneos, multi-sede, formación a operadores, branding propio.',
    sla: 'Respuesta en < 24h hábiles',
  },
  {
    key: 'soporte',
    title: 'Soporte técnico',
    desc: 'Algo no funciona y necesitas ayuda urgente.',
    sla: 'Respuesta en < 24h',
  },
  {
    key: 'partner',
    title: 'Alianza / Partner',
    desc: 'Eres integrador, consultor o vendedor que quiere ofrecer EclesiaPresenter a sus clientes.',
    sla: 'Respuesta en < 48h',
  },
  {
    key: 'feedback',
    title: 'Feedback / Sugerencia',
    desc: 'Idea de mejora, bug report, o cosa que te gustaría ver añadida.',
    sla: 'Leemos todo',
  },
]

export default function ContactoPage({ searchParams }) {
  const focus = REASONS.find(r => r.key === searchParams?.asunto)

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center mb-12">
        <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
          Contacto directo
        </div>
        <h1 className="font-display text-5xl text-ink-1 mb-4">
          Hablemos
        </h1>
        <p className="text-ink-2 text-lg max-w-2xl mx-auto">
          Escríbenos directamente — leemos todos los emails personalmente.
          Sin tickets, sin formularios largos.
        </p>
      </div>

      {/* Email principal */}
      <div className={
        'rounded-2xl border-2 p-8 mb-10 text-center transition-all ' +
        (focus
          ? 'border-copper-300/50 bg-gradient-to-br from-copper-300/15 to-bg-2 shadow-copper-glow'
          : 'border-copper-300/25 bg-bg-2')
      }>
        {focus && (
          <div className="text-[10px] font-mono uppercase tracking-widest text-copper-200 mb-3">
            Asunto · {focus.title}
          </div>
        )}
        <h2 className="font-display text-3xl text-ink-1 mb-2">
          hola@eclesiapresenter.com
        </h2>
        <p className="text-ink-3 text-sm mb-6">
          {focus ? focus.sla : 'Respondemos en menos de 24h hábiles'}
        </p>
        <a
          href={`mailto:hola@eclesiapresenter.com${
            focus
              ? `?subject=${encodeURIComponent('[' + focus.title + '] ')}`
              : ''
          }`}
          className="inline-flex items-center justify-center h-12 px-8 rounded-lg
                     bg-gradient-to-b from-copper-200 to-copper-300
                     text-[#1a0e08] font-semibold text-base
                     hover:from-copper-100 hover:to-copper-200 transition-all"
        >
          Abrir cliente de correo →
        </a>
      </div>

      {/* Razones por las que escribir */}
      <div className="mb-12">
        <h3 className="font-display text-2xl text-ink-1 mb-6 text-center">
          ¿Sobre qué quieres escribirnos?
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {REASONS.map(r => (
            <Link
              key={r.key}
              href={`/contacto?asunto=${r.key}`}
              className={
                'rounded-xl border p-5 transition-all hover:translate-y-[-1px] block ' +
                (focus?.key === r.key
                  ? 'border-copper-300/40 bg-copper-300/[0.06]'
                  : 'border-copper-300/15 bg-bg-2 hover:border-copper-300/30')
              }>
              <h4 className="font-display text-lg text-ink-1 mb-1">{r.title}</h4>
              <p className="text-sm text-ink-2 leading-relaxed mb-2">{r.desc}</p>
              <p className="text-xs font-mono text-copper-200 uppercase tracking-widest">
                {r.sla}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Plantillas sugeridas según el asunto */}
      {focus?.key === 'iglesia-grande' && (
        <div className="rounded-xl border border-copper-300/15 bg-bg-2 p-6 mb-10">
          <h3 className="font-display text-lg text-ink-1 mb-3">
            Datos útiles para que te respondamos rápido
          </h3>
          <p className="text-sm text-ink-2 mb-4">
            Si quieres acelerar el presupuesto, incluye en el correo:
          </p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>· Nombre de la iglesia / organización y ciudad</li>
            <li>· Número aproximado de PCs / campus / templos donde se usará</li>
            <li>· ¿Necesitas formación inicial al equipo de operadores?</li>
            <li>· ¿Tienes integración con algún software existente (CCLI, ProPresenter, etc.)?</li>
            <li>· Plazo deseado para empezar a usarlo</li>
          </ul>
        </div>
      )}

      {focus?.key === 'soporte' && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-6 mb-10">
          <h3 className="font-display text-lg text-ink-1 mb-3 flex items-center gap-2">
            <span className="text-amber-300">⚠</span> Antes de escribirnos
          </h3>
          <p className="text-sm text-ink-2 mb-4">
            Quizás encuentres la solución en segundos:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/instalacion" className="text-sm text-copper-200 hover:text-copper-100">
              → Guía de instalación
            </Link>
            <Link href="/docs/licencias" className="text-sm text-copper-200 hover:text-copper-100">
              → Activar licencias
            </Link>
            <Link href="/docs/obs" className="text-sm text-copper-200 hover:text-copper-100">
              → Captura OBS
            </Link>
            <Link href="/docs" className="text-sm text-copper-200 hover:text-copper-100">
              → Toda la documentación
            </Link>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-ink-3 mt-8">
        Estamos en Madrid, España · Horario UTC+1 / UTC+2
      </div>
    </div>
  )
}
