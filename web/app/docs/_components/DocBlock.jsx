// Renderiza un bloque individual del contenido de un doc, según su tipo.
// Soporta: p, h2, h3, list, ol, code, kbd, note, tip, warn, table, link

import Link from 'next/link'

export default function DocBlock({ block }) {
  switch (block.type) {
    case 'p':
      return <p className="text-ink-2 leading-relaxed mb-4">{block.text}</p>

    case 'h2':
      return <h2 className="font-display text-3xl text-ink-1 mt-12 mb-4">{block.text}</h2>

    case 'h3':
      return <h3 className="font-display text-xl text-ink-1 mt-8 mb-3">{block.text}</h3>

    case 'list':
      return (
        <ul className="space-y-2 mb-4 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-ink-2 leading-relaxed">
              <span className="text-copper-200 mt-1.5 flex-shrink-0">·</span>
              <span>
                {Array.isArray(item) ? (
                  <>
                    <strong className="text-ink-1">{item[0]}:</strong>{' '}
                    <span>{item[1]}</span>
                  </>
                ) : item}
              </span>
            </li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol className="space-y-2 mb-4 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-ink-2 leading-relaxed">
              <span className="text-copper-200 font-mono text-sm font-bold mt-0.5 flex-shrink-0 min-w-[1.5rem]">
                {i + 1}.
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )

    case 'code':
      return (
        <pre className="bg-bg-2 border border-copper-300/15 rounded-lg p-4 mb-4 overflow-x-auto">
          <code className="font-mono text-sm text-copper-100">{block.text}</code>
        </pre>
      )

    case 'kbd':
      return (
        <div className="flex items-center gap-4 mb-2 py-2 border-b border-copper-300/10 last:border-0">
          <div className="flex items-center gap-1.5 flex-shrink-0 min-w-[140px]">
            {block.keys.map((k, i) => (
              <span key={i} className="inline-flex">
                {i > 0 && <span className="text-ink-3 mx-1 self-center">+</span>}
                <kbd className="font-mono text-xs px-2 py-1 rounded
                                bg-bg-3 text-copper-100
                                border border-copper-300/30
                                shadow-[0_2px_0_0_rgba(168,95,51,0.25)]">
                  {k}
                </kbd>
              </span>
            ))}
          </div>
          <span className="text-ink-2 text-sm">{block.desc}</span>
        </div>
      )

    case 'note':
      return (
        <div className="rounded-lg border border-blue-400/25 bg-blue-400/[0.06] p-4 mb-4 flex gap-3">
          <span className="text-blue-300 flex-shrink-0 text-lg leading-none mt-0.5">ⓘ</span>
          <p className="text-ink-2 text-sm leading-relaxed m-0">{block.text}</p>
        </div>
      )

    case 'tip':
      return (
        <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] p-4 mb-4 flex gap-3">
          <span className="text-emerald-300 flex-shrink-0 text-lg leading-none mt-0.5">✦</span>
          <p className="text-ink-2 text-sm leading-relaxed m-0">{block.text}</p>
        </div>
      )

    case 'warn':
      return (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-4 mb-4 flex gap-3">
          <span className="text-amber-300 flex-shrink-0 text-lg leading-none mt-0.5">⚠</span>
          <p className="text-ink-2 text-sm leading-relaxed m-0">{block.text}</p>
        </div>
      )

    case 'table':
      return (
        <div className="rounded-lg border border-copper-300/15 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-bg-2">
              <tr>
                {block.cols.map((col, i) => (
                  <th key={i} className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-copper-200 font-semibold border-b border-copper-300/15">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-copper-300/10 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className={'px-4 py-3 ' + (j === 0 ? 'text-ink-1 font-medium' : 'text-ink-2')}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'link':
      return (
        <div className="mb-4">
          <Link
            href={block.href}
            className="inline-flex items-center gap-2 text-copper-200 hover:text-copper-100 transition-colors text-sm font-medium"
            target={block.href.startsWith('http') ? '_blank' : undefined}
            rel={block.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {block.label}
          </Link>
        </div>
      )

    default:
      return null
  }
}
