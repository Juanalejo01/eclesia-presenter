const FEATURES = [
  {
    title: 'Biblia con 10 versiones',
    desc: 'RVR 1960, RVR 1909, NVI, NTV, DHH, LBLA, PDT, TLA, NBV, RV 2020. Búsqueda sin tildes. Importa la tuya en .xml o .xmm.',
    icon: '📖',
  },
  {
    title: 'Editor de canciones pro',
    desc: 'Plantillas de estructura (verso/coro/puente), auto-split por líneas, vista previa de cada slide. Bulk MAYÚSCULAS.',
    icon: '🎵',
  },
  {
    title: 'Lista del día reordenable',
    desc: 'Arrastra y suelta versículos, canciones, imágenes y videos. Navega con flechas durante el servicio.',
    icon: '📋',
  },
  {
    title: 'Lower-third para OBS',
    desc: 'Banda inferior transparente totalmente personalizable. 6 presets predefinidos. Capturable directamente por OBS Studio.',
    icon: '📡',
  },
  {
    title: 'Stage Display',
    desc: 'Pantalla aparte para el músico/predicador con slide actual, próximo, reloj y tiempo de servicio.',
    icon: '🎤',
  },
  {
    title: 'Búsqueda global Ctrl+B',
    desc: 'Encuentra cualquier versículo, canción, ajuste o panel desde un solo input. Detecta referencias como "Juan 3:16".',
    icon: '🔍',
  },
  {
    title: 'Multi-idioma',
    desc: 'Interfaz en Español, English y Português. Cambia al instante sin reiniciar.',
    icon: '🌎',
  },
  {
    title: 'Imagen y video',
    desc: 'Fondos en gradiente, imagen o video. Ajuste cubrir/contener/estirar con blur de relleno para verticales.',
    icon: '🖼',
  },
  {
    title: 'Drag & drop',
    desc: 'Arrastra archivos directamente al panel para añadirlos a tu biblioteca. Backup completo a JSON.',
    icon: '✨',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 border-t border-copper-300/10">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-copper-200 mb-3">
            Todo lo que necesitas
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink-1 mb-4 leading-tight">
            Diseñado por personas<br/>
            <em className="italic text-copper-200">que sirven en iglesia</em>
          </h2>
          <p className="max-w-2xl mx-auto text-ink-2 leading-relaxed">
            Cada panel resuelve un problema real: desde proyectar un versículo entre canciones
            hasta hacer captura transparente para tu transmisión en vivo.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-copper-300/10
                         bg-gradient-to-br from-bg-2 to-bg-1
                         hover:border-copper-300/30 transition-all
                         hover:translate-y-[-2px]"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-ink-1 mb-2 text-lg group-hover:text-copper-100 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-ink-3 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
