import Link from 'next/link'

export const metadata = {
  title: 'Documentación — EclesiaPresenter',
}

const SECTIONS = [
  {
    title: 'Primeros pasos',
    items: [
      { href: '/docs/instalacion', label: 'Instalación y primer arranque' },
      { href: '/docs/atajos', label: 'Atajos de teclado' },
      { href: '/docs/biblia', label: 'Cómo usar el panel Biblia' },
      { href: '/docs/canciones', label: 'Crear y editar canciones' },
    ],
  },
  {
    title: 'Proyección y streaming',
    items: [
      { href: '/docs/obs', label: 'Captura OBS con lower-third' },
      { href: '/docs/dos-pantallas', label: 'Configurar 2 monitores' },
      { href: '/docs/stage-display', label: 'Stage Display para el músico' },
      { href: '/docs/transiciones', label: 'Transiciones entre slides' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: '/docs/temas', label: 'Personalizar el tema visual' },
      { href: '/docs/idiomas', label: 'Cambiar idioma de la app' },
      { href: '/docs/almacenamiento', label: 'Carpetas y rutas de archivos' },
      { href: '/docs/biblias-custom', label: 'Importar biblias propias' },
    ],
  },
  {
    title: 'Cuenta y pagos',
    items: [
      { href: '/docs/cuenta', label: 'Gestionar tu cuenta' },
      { href: '/docs/licencias', label: 'Activar / mover licencias entre PCs' },
      { href: '/docs/facturacion', label: 'Facturación y pagos' },
      { href: '/docs/backups', label: 'Hacer backup de canciones' },
    ],
  },
]

export default function DocsPage() {
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
          Guías paso a paso · vídeo-tutoriales · troubleshooting.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-xl border border-copper-300/10 bg-bg-2 p-6">
            <h2 className="font-display text-2xl text-ink-1 mb-4">{s.title}</h2>
            <ul className="space-y-2 text-sm">
              {s.items.map((item, j) => (
                <li key={j}>
                  <Link
                    href={item.href}
                    className="text-ink-2 hover:text-copper-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center rounded-2xl border border-copper-300/10 bg-bg-2 p-10">
        <h3 className="font-display text-2xl text-ink-1 mb-3">
          ¿No encuentras lo que buscas?
        </h3>
        <p className="text-ink-2 mb-6">
          Escríbenos directamente y te ayudamos.
        </p>
        <a
          href="mailto:hola@eclesiapresenter.com"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg
                     bg-gradient-to-b from-copper-200 to-copper-300
                     text-[#1a0e08] font-semibold hover:from-copper-100 hover:to-copper-200 transition-all"
        >
          Contactar soporte
        </a>
      </div>
    </div>
  )
}
