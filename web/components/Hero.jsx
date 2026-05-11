import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-300/30 to-transparent" />

      <div className="container relative mx-auto px-6 max-w-6xl">
        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                          border border-copper-300/30 bg-copper-300/5
                          text-xs font-mono uppercase tracking-widest text-copper-200">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-200 animate-pulse" />
            v0.2 · Beta abierta
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center font-display font-medium
                       text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                       leading-[0.95] tracking-tight mb-6 font-display">
          La proyección de tu<br/>
          iglesia, <em className="italic text-copper-200">profesional</em>
        </h1>

        {/* Subtitle */}
        <p className="text-center max-w-2xl mx-auto text-lg md:text-xl text-ink-2 leading-relaxed mb-10">
          Biblia, canciones, videos y avisos en una sola app.
          Sin servidores, sin latencia, capturable directamente por OBS.
          Hecho para iglesias hispanohablantes.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/download"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg
                       bg-gradient-to-b from-copper-200 to-copper-300
                       text-[#1a0e08] font-semibold
                       shadow-copper-glow hover:from-copper-100 hover:to-copper-200
                       transition-all"
          >
            Descargar gratis para Windows
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg
                       border border-copper-300/30 bg-bg-2/50 backdrop-blur
                       text-ink-1 font-medium
                       hover:bg-bg-3 hover:border-copper-300/50 transition-all"
          >
            Ver planes Pro
          </Link>
        </div>

        {/* Mockup placeholder */}
        <div className="relative max-w-5xl mx-auto">
          <div className="aspect-video rounded-2xl overflow-hidden
                          border border-copper-300/20
                          bg-gradient-to-br from-bg-2 via-bg-1 to-bg-0
                          shadow-2xl shadow-black/50
                          relative">
            {/* Frame top bar */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-bg-1/80 border-b border-copper-300/10
                            flex items-center px-4 gap-2">
              <span className="w-3 h-3 rounded-full bg-ink-4/40" />
              <span className="w-3 h-3 rounded-full bg-ink-4/40" />
              <span className="w-3 h-3 rounded-full bg-ink-4/40" />
              <span className="ml-4 text-xs font-mono text-ink-3">
                EclesiaPresenter · Salmos 23:1
              </span>
            </div>

            {/* Fake projection content */}
            <div className="absolute inset-0 pt-10 flex items-center justify-center px-12">
              <div className="text-center max-w-3xl">
                <p className="font-display text-3xl md:text-5xl lg:text-6xl leading-tight text-ink-1 mb-6">
                  &ldquo;Jehová es mi pastor;<br/>nada me faltará.&rdquo;
                </p>
                <p className="font-mono text-xs md:text-sm tracking-[0.2em] text-copper-200 uppercase">
                  Salmos 23 : 1
                </p>
              </div>
            </div>

            {/* Live tally */}
            <div className="absolute top-12 right-4 flex items-center gap-2
                            px-3 py-1.5 rounded
                            bg-red-500/90 text-white text-[10px] font-mono font-bold uppercase tracking-widest
                            shadow-lg shadow-red-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ON AIR
            </div>
          </div>

          {/* Glow under */}
          <div className="absolute -bottom-10 left-1/4 right-1/4 h-32
                          bg-copper-300/20 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: '10', label: 'Biblias incluidas' },
            { value: '3', label: 'Salidas OBS' },
            { value: '8', label: 'Paneles' },
            { value: '3', label: 'Idiomas' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl md:text-5xl text-copper-100 mb-1">{s.value}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-ink-3">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
