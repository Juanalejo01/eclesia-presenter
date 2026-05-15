import Link from 'next/link'
import { getDocsBySection, DOCS } from './_data/docs.js'

export const metadata = {
  title: 'Documentación — EclesiaPresenter',
  description: 'Guías paso a paso, vídeo-tutoriales y troubleshooting para EclesiaPresenter.',
}

export default function DocsPage() {
  const sections = getDocsBySection()

  return (
    <div className="container mx-auto px-6 py-20 max-w-5xl">
      <div className="text-center mb-16">
        <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
          Documentación
        </div>
        <h1 className="font-display text-5xl text-ink-1 mb-4">
          Aprende a usar <em className="italic text-copper-200">EclesiaPresenter</em>
        </h1>
        <p className="text-ink-2 text-lg">
          Guías paso a paso · {DOCS.length} artículos · cobertura completa de la app.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {sections.map((s, i) => (
          <div key={i} className="rounded-xl border border-copper-300/10 bg-bg-2 p-6">
            <h2 className="font-display text-2xl text-ink-1 mb-1">{s.title}</h2>
            <p className="text-xs font-mono text-ink-3 mb-5 uppercase tracking-widest">
              {s.items.length} artículo{s.items.length === 1 ? '' : 's'}
            </p>
            <ul className="space-y-3 text-sm">
              {s.items.map(doc => (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    className="block group"
                  >
                    <div className="text-ink-1 group-hover:text-copper-200 transition-colors font-medium">
                      {doc.title}
                    </div>
                    {doc.summary && (
                      <div className="text-xs text-ink-3 mt-0.5">{doc.summary}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Quick start callout */}
      <div className="mt-12 rounded-2xl border-2 border-copper-300/30
                      bg-gradient-to-br from-copper-300/10 to-bg-2 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-2">
              ¿Es tu primera vez?
            </div>
            <h3 className="font-display text-2xl text-ink-1 mb-2">
              Empieza por la <Link href="/docs/instalacion" className="text-copper-200 hover:text-copper-100">guía de instalación</Link>
            </h3>
            <p className="text-ink-2 text-sm">
              Te lleva paso a paso desde la descarga hasta el primer proyector funcionando — en unos 5 minutos.
            </p>
          </div>
          <Link
            href="/docs/instalacion"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg
                       bg-gradient-to-b from-copper-200 to-copper-300
                       text-[#1a0e08] font-semibold hover:from-copper-100 hover:to-copper-200 transition-all
                       whitespace-nowrap"
          >
            Empezar →
          </Link>
        </div>
      </div>

      {/* Contact support */}
      <div className="mt-8 text-center rounded-xl border border-copper-300/10 bg-bg-2 p-8">
        <h3 className="font-display text-xl text-ink-1 mb-2">
          ¿No encuentras lo que buscas?
        </h3>
        <p className="text-ink-2 mb-5 text-sm">
          Escríbenos directamente y te ayudamos en menos de 24h.
        </p>
        <a
          href="mailto:hola@eclesiapresenter.com"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg
                     border border-copper-300/30 bg-bg-3 text-ink-1 text-sm font-medium
                     hover:bg-bg-4 hover:text-copper-100 transition-all"
        >
          hola@eclesiapresenter.com
        </a>
      </div>
    </div>
  )
}
