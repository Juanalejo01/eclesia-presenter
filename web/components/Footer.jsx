import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-copper-300/10 bg-bg-1/50 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo size={24} />
              <span className="font-semibold">
                Eclesia<span className="text-ink-3 font-normal">Presenter</span>
              </span>
            </div>
            <p className="text-sm text-ink-3 leading-relaxed">
              Software profesional para presentaciones en iglesias hispanohablantes.
              Open source · sin red · sin latencia.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-4">Producto</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-ink-2 hover:text-copper-200">Funciones</Link></li>
              <li><Link href="/pricing" className="text-ink-2 hover:text-copper-200">Precios</Link></li>
              <li><Link href="/download" className="text-ink-2 hover:text-copper-200">Descargar</Link></li>
              <li><Link href="/changelog" className="text-ink-2 hover:text-copper-200">Changelog</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="text-ink-2 hover:text-copper-200">Documentación</Link></li>
              <li><Link href="/docs/obs" className="text-ink-2 hover:text-copper-200">Guía OBS</Link></li>
              <li>
                <a href="https://github.com/Juanalejo01/eclesia-presenter" target="_blank" rel="noreferrer"
                  className="text-ink-2 hover:text-copper-200">
                  GitHub
                </a>
              </li>
              <li><Link href="/contacto" className="text-ink-2 hover:text-copper-200">Contacto</Link></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-ink-3 mb-4">Cuenta</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-ink-2 hover:text-copper-200">Iniciar sesión</Link></li>
              <li><Link href="/register" className="text-ink-2 hover:text-copper-200">Crear cuenta</Link></li>
              <li><Link href="/legal/privacidad" className="text-ink-2 hover:text-copper-200">Privacidad</Link></li>
              <li><Link href="/legal/terminos" className="text-ink-2 hover:text-copper-200">Términos</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-copper-300/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-ink-3">
          <p>© {new Date().getFullYear()} EclesiaPresenter · Hecho con cariño para la iglesia.</p>
          <p className="font-mono">v 0.2.0</p>
        </div>
      </div>
    </footer>
  )
}
