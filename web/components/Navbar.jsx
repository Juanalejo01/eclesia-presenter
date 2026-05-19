import Link from 'next/link'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import { createClient } from '../lib/supabase/server'

export default async function Navbar() {
  // Defensivo: si Supabase no está configurado, mostramos navbar sin sesión.
  let user = null
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient()
      const res = await supabase.auth.getUser()
      user = res.data?.user || null
    }
  } catch (e) {
    console.error('[Navbar] getUser error:', e?.message)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-0/70 border-b border-copper-300/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <Logo size={28} />
          <span className="font-semibold tracking-tight whitespace-nowrap">
            Eclesia<span className="text-ink-3 font-normal">Presenter</span>
          </span>
          {/* La pill v0.2 solo se muestra a partir de lg (1024+) para no apretar
              el navbar en tablets/laptops pequeñas */}
          <span className="hidden lg:inline text-[10px] font-mono text-ink-3 uppercase tracking-wider px-2 py-0.5 border border-copper-300/20 rounded whitespace-nowrap">
            v 0.2
          </span>
        </Link>

        {/* Nav horizontal: solo a partir de lg (1024+).
            Debajo de eso → menú hamburguesa */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          <Link href="/#features" className="text-ink-2 hover:text-ink-1 transition-colors">
            Funciones
          </Link>
          <Link href="/pricing" className="text-ink-2 hover:text-ink-1 transition-colors">
            Precios
          </Link>
          <Link href="/docs" className="text-ink-2 hover:text-ink-1 transition-colors">
            Documentación
          </Link>
          <Link href="/download" className="text-ink-2 hover:text-ink-1 transition-colors">
            Descargar
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Mi cuenta visible siempre que esté logueado.
              < lg → solo avatar circular
              >= lg → avatar + "Mi cuenta" */}
          {user && (
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 px-2 lg:px-4 h-9 rounded-lg
                         border border-copper-300/30 bg-bg-2 hover:bg-bg-3
                         text-sm font-medium text-ink-1 transition-all whitespace-nowrap"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-copper-200 to-copper-400 grid place-items-center text-[10px] font-bold text-[#1a0e08] shrink-0">
                {(user.email || '?')[0].toUpperCase()}
              </span>
              <span className="hidden lg:inline">Mi cuenta</span>
            </Link>
          )}

          {/* CTAs desktop: solo a partir de lg */}
          {!user && (
            <>
              <Link href="/login" className="hidden lg:inline text-sm text-ink-2 hover:text-ink-1 transition-colors whitespace-nowrap">
                Iniciar sesión
              </Link>
              <Link
                href="/download"
                className="hidden lg:inline-flex items-center gap-2 px-4 h-9 rounded-lg
                           bg-gradient-to-b from-copper-200 to-copper-300
                           text-[#1a0e08] text-sm font-semibold whitespace-nowrap
                           shadow-copper-glow hover:from-copper-100 hover:to-copper-200
                           transition-all"
              >
                Descargar gratis
              </Link>
            </>
          )}

          {/* Hamburguesa: visible debajo de lg (es decir 0-1023px). */}
          <MobileMenu user={user ? { email: user.email } : null} />
        </div>
      </div>
    </header>
  )
}
