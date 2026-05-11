import Link from 'next/link'

export const metadata = {
  title: 'Descargar — EclesiaPresenter',
  description: 'Descarga EclesiaPresenter para Windows. Instalador o versión portable.',
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
          Para Windows 10 y 11 · 64 bits. Gratis, sin registro.
        </p>
      </div>

      {/* Two download options */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {/* INSTALLER — recommended */}
        <div className="relative rounded-2xl border-2 border-copper-300/40
                        bg-gradient-to-br from-copper-300/10 to-bg-2
                        shadow-copper-glow p-7 flex flex-col">
          <span className="absolute -top-3 left-7 px-3 py-1 rounded-full
                          bg-gradient-to-b from-copper-200 to-copper-300
                          text-[#1a0e08] text-[10px] font-mono uppercase tracking-widest font-bold">
            Recomendado
          </span>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bg-3 to-bg-1
                            border border-copper-300/30 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3 L11 14 M6 10 L11 14 L16 10 M4 18 L18 18"
                  stroke="#db9f75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-ink-1">Instalador</h2>
          </div>

          <ul className="space-y-1.5 text-sm text-ink-2 mb-6 flex-1">
            <li>✓ Crea acceso directo en el escritorio</li>
            <li>✓ Aparece en el Menú Inicio</li>
            <li>✓ Updates automáticos (futuro)</li>
            <li>✓ Aparece en {'"Programas instalados"'}</li>
          </ul>

          <Link
            href="/download/installer"
            className="inline-flex items-center justify-center gap-2 h-12 rounded-lg
                       bg-gradient-to-b from-copper-200 to-copper-300
                       text-[#1a0e08] font-semibold text-base
                       hover:from-copper-100 hover:to-copper-200 transition-all">
            Descargar instalador
          </Link>
          <p className="text-xs text-ink-3 text-center mt-2 font-mono">
            setup.exe · ~81 MB
          </p>
        </div>

        {/* PORTABLE */}
        <div className="rounded-2xl border border-copper-300/15 bg-bg-2 p-7 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bg-3 to-bg-1
                            border border-copper-300/30 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 7 L11 3 L18 7 L18 15 L11 19 L4 15 Z M4 7 L11 11 L18 7 M11 11 L11 19"
                  stroke="#8a7866" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-ink-1">Portable</h2>
          </div>

          <ul className="space-y-1.5 text-sm text-ink-2 mb-6 flex-1">
            <li>✓ Sin instalación — doble click y arranca</li>
            <li>✓ Llévalo en un USB</li>
            <li>✓ No requiere permisos de admin</li>
            <li>✓ Ideal para PCs corporativos</li>
          </ul>

          <Link
            href="/download/portable"
            className="inline-flex items-center justify-center gap-2 h-12 rounded-lg
                       border border-copper-300/30 bg-bg-3 text-ink-1 font-semibold text-base
                       hover:bg-bg-4 transition-all">
            Descargar portable
          </Link>
          <p className="text-xs text-ink-3 text-center mt-2 font-mono">
            portable.exe · ~81 MB
          </p>
        </div>
      </div>

      {/* SmartScreen + Smart App Control */}
      <div className="rounded-xl border border-copper-300/20 bg-bg-2 p-7 mb-8">
        <h3 className="font-display text-2xl text-ink-1 mb-4 flex items-center gap-2">
          <span className="text-copper-200 text-3xl leading-none">⚠</span>
          Si Windows bloquea la instalación
        </h3>
        <p className="text-sm text-ink-2 leading-relaxed mb-5">
          EclesiaPresenter es una app nueva y todavía no tiene certificado de firma comercial.
          Windows muestra dos avisos posibles. Es totalmente seguro — el código es público en
          {' '}<a href="https://github.com/Juanalejo01/eclesia-presenter" target="_blank" rel="noreferrer"
            className="text-copper-200 hover:text-copper-100 underline">GitHub</a>.
        </p>

        <div className="space-y-5">
          {/* Case 1: SmartScreen */}
          <div className="rounded-lg bg-bg-3/40 p-5 border border-copper-300/10">
            <h4 className="font-semibold text-ink-1 mb-2">
              Caso 1 · Windows SmartScreen ({'"Windows protegió tu equipo"'})
            </h4>
            <ol className="text-sm text-ink-2 space-y-1 list-decimal list-inside ml-1">
              <li>Click en {'"'}<strong className="text-ink-1">Más información</strong>{'"'}</li>
              <li>Click en {'"'}<strong className="text-ink-1">Ejecutar de todas formas</strong>{'"'}</li>
            </ol>
          </div>

          {/* Case 2: Smart App Control (Windows 11) */}
          <div className="rounded-lg bg-bg-3/40 p-5 border border-copper-300/10">
            <h4 className="font-semibold text-ink-1 mb-2">
              Caso 2 · Control inteligente de aplicaciones (Windows 11)
            </h4>
            <p className="text-sm text-ink-2 mb-2">
              Si tienes activado el {'"Control inteligente de aplicaciones"'} (Smart App Control),
              Windows no permitirá ejecutar el .exe ni con {'"Ejecutar de todas formas"'}. Opciones:
            </p>
            <ol className="text-sm text-ink-2 space-y-1 list-decimal list-inside ml-1">
              <li>
                Abre <strong className="text-ink-1">Configuración → Privacidad y seguridad
                → Seguridad de Windows → Control de aplicaciones y navegador → Control
                inteligente de aplicaciones</strong>
              </li>
              <li>
                Cámbialo a <strong className="text-ink-1">{'"Desactivado"'}</strong>{' '}
                <span className="text-ink-3">(o {'"Evaluación"'} si quieres una opción intermedia)</span>
              </li>
              <li>Vuelve a abrir el .exe — ya te dejará</li>
            </ol>
            <p className="text-xs text-ink-3 mt-3 italic">
              Nota: Smart App Control solo se puede reactivar reinstalando Windows. La mayoría
              de PCs lo tienen ya desactivado por defecto.
            </p>
          </div>
        </div>
      </div>

      {/* System requirements */}
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
              · <span className="text-ink-3">Versión anterior:</span>{' '}
              <a href="https://github.com/Juanalejo01/eclesia-presenter/releases" target="_blank" rel="noreferrer"
                className="text-copper-200 hover:text-copper-100">
                ver historial
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-ink-3 mb-2">¿Tienes problemas con la descarga o instalación?</p>
        <Link href="/docs" className="text-sm text-copper-200 hover:text-copper-100">
          Ver guía de instalación →
        </Link>
      </div>
    </div>
  )
}
