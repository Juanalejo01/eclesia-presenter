import Link from 'next/link'

export default function CTA() {
  return (
    <section className="relative py-24 border-t border-copper-300/10">
      <div className="container mx-auto px-6">
        <div className="relative max-w-4xl mx-auto p-12 md:p-16 rounded-3xl
                        bg-gradient-to-br from-copper-300/15 via-bg-2 to-bg-1
                        border border-copper-300/30
                        overflow-hidden">

          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-copper-300/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-copper-300/10 blur-3xl rounded-full" />

          <div className="relative text-center">
            <h2 className="font-display text-4xl md:text-6xl text-ink-1 mb-6 leading-tight">
              Empieza a proyectar<br/>
              <em className="italic text-copper-200">esta semana</em>
            </h2>
            <p className="max-w-xl mx-auto text-ink-2 mb-10 text-lg">
              Descarga gratis y prueba todas las funciones Pro durante 30 días.
              Sin tarjeta, sin compromisos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/download"
                className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-lg
                           bg-gradient-to-b from-copper-200 to-copper-300
                           text-[#1a0e08] font-semibold text-lg
                           shadow-copper-glow hover:from-copper-100 hover:to-copper-200
                           transition-all"
              >
                Descargar para Windows
              </Link>
              <a
                href="https://github.com/Juanalejo01/eclesia-presenter"
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-lg
                           border border-copper-300/30 bg-bg-2/50 backdrop-blur
                           text-ink-1 font-medium
                           hover:bg-bg-3 hover:border-copper-300/50 transition-all"
              >
                Ver código en GitHub
              </a>
            </div>

            <p className="mt-6 text-xs text-ink-3 font-mono uppercase tracking-widest">
              Windows 10/11 · 84 MB · Sin instalación
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
