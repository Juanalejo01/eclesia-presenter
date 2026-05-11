import Link from 'next/link'

export const metadata = {
  title: 'Descargar — EclesiaPresenter',
  description: 'Descarga EclesiaPresenter para Windows. Portable, sin instalación.',
}

export default function DownloadPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center mb-12">
        <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
          v 0.2.0 — Beta
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-ink-1 mb-4">
          Descarga <em className="italic text-copper-200">EclesiaPresenter</em>
        </h1>
        <p className="text-ink-2 text-lg max-w-2xl mx-auto">
          Versión portable: doble click y a usar. Sin instalación, sin registro.
        </p>
      </div>

      {/* Main download card */}
      <div className="rounded-2xl border-2 border-copper-300/40
                      bg-gradient-to-br from-copper-300/10 to-bg-2
                      shadow-copper-glow p-10 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-bg-3 to-bg-1
                          border border-copper-300/30 flex items-center justify-center
                          flex-shrink-0">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L24 32 M14 22 L24 32 L34 22 M10 38 L38 38"
                stroke="#db9f75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display text-3xl text-ink-1 mb-2">Windows 10 / 11 · x64</h2>
            <p className="text-ink-3 text-sm mb-1">EclesiaPresenter-0.2.0-portable.exe</p>
            <p className="text-ink-3 text-xs font-mono">~84 MB · SHA256 verificable</p>
          </div>

          <Link
            href="/download/latest"
            className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-lg
                       bg-gradient-to-b from-copper-200 to-copper-300
                       text-[#1a0e08] font-semibold text-base
                       hover:from-copper-100 hover:to-copper-200 transition-all
                       whitespace-nowrap"
          >
            Descargar ahora
          </Link>
        </div>
      </div>

      {/* SmartScreen warning */}
      <div className="rounded-xl border border-copper-300/20 bg-bg-2 p-6 mb-8">
        <h3 className="font-semibold text-ink-1 mb-3 flex items-center gap-2">
          <span className="text-copper-200">⚠</span> Aviso de Windows SmartScreen
        </h3>
        <p className="text-sm text-ink-2 leading-relaxed mb-3">
          Al ejecutar el .exe por primera vez, Windows puede mostrar un aviso de SmartScreen
          (porque la app es nueva y no tiene firma comercial todavía). Es seguro — el código
          es público en GitHub.
        </p>
        <p className="text-sm text-ink-2 leading-relaxed">
          <strong className="text-ink-1">Solución:</strong> click en
          {' "Más información"'} → {' "Ejecutar de todas formas"'}.
        </p>
      </div>

      {/* System requirements + alternatives */}
      <div className="grid md:grid-cols-2 gap-5 mb-12">
        <div className="rounded-xl border border-copper-300/10 bg-bg-2 p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink-3 mb-4">
            Requisitos
          </h3>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>· Windows 10 versión 1903+ o Windows 11</li>
            <li>· 4 GB RAM mínimo (8 GB recomendado)</li>
            <li>· 200 MB de disco libre</li>
            <li>· GPU con aceleración compatible para videos</li>
            <li>· Conexión a internet solo para api.bible (opcional)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-copper-300/10 bg-bg-2 p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink-3 mb-4">
            ¿Otros sistemas?
          </h3>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>· <span className="text-ink-3">macOS:</span> en roadmap (próximas versiones)</li>
            <li>· <span className="text-ink-3">Linux:</span> en roadmap (próximas versiones)</li>
            <li>
              · <span className="text-ink-3">Build manual:</span>{' '}
              <a href="https://github.com/Juanalejo01/eclesia-presenter#desarrollo" target="_blank" rel="noreferrer"
                className="text-copper-200 hover:text-copper-100">
                ver instrucciones
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-ink-3 mb-2">¿Tienes problemas con la descarga?</p>
        <Link href="/docs" className="text-sm text-copper-200 hover:text-copper-100">
          Ver guía de instalación →
        </Link>
      </div>
    </div>
  )
}
