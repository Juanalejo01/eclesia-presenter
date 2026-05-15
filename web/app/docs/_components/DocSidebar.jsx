// Sidebar de navegación entre docs, agrupada por sección.
// Resalta el doc activo (passed as `currentSlug`).

import Link from 'next/link'
import { getDocsBySection } from '../_data/docs.js'

export default function DocSidebar({ currentSlug }) {
  const sections = getDocsBySection()

  return (
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-4">
      <nav className="space-y-7">
        <div>
          <Link
            href="/docs"
            className="font-mono text-[10px] uppercase tracking-widest text-copper-200 hover:text-copper-100 transition-colors flex items-center gap-1.5"
          >
            ← Volver al índice
          </Link>
        </div>

        {sections.map((s, i) => (
          <div key={i}>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mb-3">
              {s.title}
            </h4>
            <ul className="space-y-1">
              {s.items.map(doc => {
                const isActive = doc.slug === currentSlug
                return (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      className={
                        'block px-3 py-1.5 rounded-md text-sm transition-colors ' +
                        (isActive
                          ? 'bg-gradient-to-r from-copper-300/20 to-transparent text-copper-100 border-l-2 border-copper-300'
                          : 'text-ink-2 hover:text-copper-200 hover:bg-bg-2/50')
                      }
                    >
                      {doc.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
