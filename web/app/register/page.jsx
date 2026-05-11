import Link from 'next/link'

export const metadata = {
  title: 'Crear cuenta — EclesiaPresenter',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-ink-1 mb-2">Crear cuenta</h1>
        <p className="text-ink-3 text-sm">
          Gratis para siempre. Sin tarjeta. Actualiza a Pro cuando lo necesites.
        </p>
      </div>

      <form className="rounded-2xl border border-copper-300/20 bg-bg-2 p-8 space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">
            Nombre
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            className="w-full h-12 px-4 rounded-lg bg-bg-1 border border-copper-300/15
                       text-ink-1 placeholder-text-4 outline-none
                       focus:border-copper-300/50 focus:ring-2 focus:ring-copper-300/15"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">
            Iglesia / Organización (opcional)
          </label>
          <input
            type="text"
            placeholder="Iglesia Central de..."
            className="w-full h-12 px-4 rounded-lg bg-bg-1 border border-copper-300/15
                       text-ink-1 placeholder-text-4 outline-none
                       focus:border-copper-300/50 focus:ring-2 focus:ring-copper-300/15"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="tu@iglesia.com"
            required
            className="w-full h-12 px-4 rounded-lg bg-bg-1 border border-copper-300/15
                       text-ink-1 placeholder-text-4 outline-none
                       focus:border-copper-300/50 focus:ring-2 focus:ring-copper-300/15"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full h-12 rounded-lg
                     bg-gradient-to-b from-copper-200 to-copper-300
                     text-[#1a0e08] font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-copper-100 hover:to-copper-200 transition-all"
        >
          Crear cuenta gratis
        </button>

        <div className="text-center text-xs text-ink-3">
          <span className="px-3 py-1 rounded-full bg-copper-300/10 border border-copper-300/20 inline-block">
            ⏳ Registro abriendo pronto
          </span>
        </div>

        <p className="text-xs text-ink-3 text-center pt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-copper-200 hover:text-copper-100">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
