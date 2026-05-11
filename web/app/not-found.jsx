import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-32 text-center max-w-xl">
      <div className="font-display text-9xl text-copper-300/50 mb-4">404</div>
      <h1 className="font-display text-4xl text-ink-1 mb-3">Página no encontrada</h1>
      <p className="text-ink-3 mb-8">
        La página que buscas no existe o se ha movido.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 h-12 rounded-lg
                   bg-gradient-to-b from-copper-200 to-copper-300
                   text-[#1a0e08] font-semibold hover:from-copper-100 hover:to-copper-200 transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
