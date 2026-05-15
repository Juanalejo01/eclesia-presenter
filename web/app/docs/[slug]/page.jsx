import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DOCS, getDoc, getNextPrev } from '../_data/docs.js'
import DocBlock from '../_components/DocBlock.jsx'
import DocSidebar from '../_components/DocSidebar.jsx'

// Static generation — pre-renderiza una página por cada doc.
export async function generateStaticParams() {
  return DOCS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }) {
  const doc = getDoc(params.slug)
  if (!doc) return { title: 'No encontrado — EclesiaPresenter' }
  return {
    title: `${doc.title} — Docs EclesiaPresenter`,
    description: doc.summary,
  }
}

export default function DocPage({ params }) {
  const doc = getDoc(params.slug)
  if (!doc) notFound()

  const { prev, next } = getNextPrev(params.slug)

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar */}
        <DocSidebar currentSlug={params.slug} />

        {/* Content */}
        <main className="min-w-0 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-ink-3 mb-6 uppercase tracking-widest">
            <Link href="/docs" className="hover:text-copper-200 transition-colors">Docs</Link>
            <span>→</span>
            <span className="text-copper-200">{doc.section}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl text-ink-1 mb-3">
            {doc.title}
          </h1>
          {doc.summary && (
            <p className="text-ink-2 text-lg mb-2">{doc.summary}</p>
          )}
          <p className="text-xs font-mono text-ink-3 mb-12">
            Última actualización · {doc.lastUpdated}
          </p>

          {/* Content blocks */}
          <article>
            {doc.content.map((block, i) => (
              <DocBlock key={i} block={block} />
            ))}
          </article>

          {/* Prev / Next */}
          <div className="mt-20 pt-8 border-t border-copper-300/15 grid sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/docs/${prev.slug}`}
                className="group rounded-xl border border-copper-300/10 bg-bg-2 hover:bg-bg-3 transition-all p-5"
              >
                <div className="text-xs font-mono text-ink-3 mb-1 uppercase tracking-widest">
                  ← Anterior
                </div>
                <div className="text-ink-1 group-hover:text-copper-200 transition-colors font-medium">
                  {prev.title}
                </div>
              </Link>
            ) : <div />}

            {next && (
              <Link
                href={`/docs/${next.slug}`}
                className="group rounded-xl border border-copper-300/10 bg-bg-2 hover:bg-bg-3 transition-all p-5 sm:text-right"
              >
                <div className="text-xs font-mono text-ink-3 mb-1 uppercase tracking-widest">
                  Siguiente →
                </div>
                <div className="text-ink-1 group-hover:text-copper-200 transition-colors font-medium">
                  {next.title}
                </div>
              </Link>
            )}
          </div>

          {/* Footer — soporte */}
          <div className="mt-12 rounded-xl border border-copper-300/10 bg-bg-2/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-ink-2">
              ¿Esta guía te resolvió la duda?
            </div>
            <a
              href="mailto:hola@eclesiapresenter.com"
              className="text-sm text-copper-200 hover:text-copper-100 transition-colors font-medium"
            >
              Escribir a soporte →
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
