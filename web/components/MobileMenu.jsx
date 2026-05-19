'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Menú hamburguesa para móviles. Se renderiza solo bajo md (768px).
// Sticky overlay con tab order accesible y cerrado al navegar.
export default function MobileMenu({ user }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar al cambiar de ruta
  useEffect(() => { setOpen(false) }, [pathname])

  // Bloquear scroll del body cuando está abierto + escape para cerrar
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const links = [
    { href: '/#features',  label: 'Funciones' },
    { href: '/pricing',    label: 'Precios' },
    { href: '/docs',       label: 'Documentación' },
    { href: '/download',   label: 'Descargar' },
    { href: '/contacto',   label: 'Contacto' },
  ]

  return (
    <>
      {/* Botón trigger — visible debajo de lg (móvil, tablets y laptops 770-1023) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md
                   text-ink-1 hover:bg-bg-2 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {/* Overlay + panel — fixed full-screen, oculto a partir de lg */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-bg-0/85 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm
                            bg-bg-1 border-l border-copper-300/15
                            flex flex-col overflow-hidden">
            <header className="flex items-center justify-between h-16 px-5 border-b border-copper-300/10">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-3">
                Menú
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="w-9 h-9 rounded-md text-ink-2 hover:bg-bg-2 hover:text-ink-1 grid place-items-center transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <nav className="flex-1 overflow-y-auto py-2">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-6 py-4 text-lg text-ink-1 hover:bg-bg-2
                             hover:text-copper-200 transition-colors
                             border-b border-copper-300/5"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-copper-300/10 space-y-3">
              {user ? (
                <Link
                  href="/cuenta"
                  className="flex items-center gap-3 px-4 h-12 rounded-lg
                             border border-copper-300/30 bg-bg-2
                             text-ink-1 font-medium"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-copper-200 to-copper-400 grid place-items-center text-xs font-bold text-[#1a0e08]">
                    {(user.email || '?')[0].toUpperCase()}
                  </span>
                  Mi cuenta
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 h-12 leading-[3rem] rounded-lg
                             border border-copper-300/30 bg-bg-2 text-ink-1 text-sm font-medium"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                href="/download"
                className="block w-full text-center px-4 h-12 leading-[3rem] rounded-lg
                           bg-gradient-to-b from-copper-200 to-copper-300
                           text-[#1a0e08] font-semibold shadow-copper-glow"
              >
                Descargar gratis
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
