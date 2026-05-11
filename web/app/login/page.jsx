import Link from 'next/link'

export const metadata = {
  title: 'Iniciar sesión — EclesiaPresenter',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-ink-1 mb-2">Iniciar sesión</h1>
        <p className="text-ink-3 text-sm">
          Te enviamos un enlace mágico al correo. Sin contraseñas.
        </p>
      </div>

      <form className="rounded-2xl border border-copper-300/20 bg-bg-2 p-8 space-y-5">
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
          Enviar enlace mágico
        </button>

        <div className="text-center text-xs text-ink-3">
          <span className="px-3 py-1 rounded-full bg-copper-300/10 border border-copper-300/20 inline-block">
            ⏳ Autenticación llegando pronto
          </span>
        </div>

        <p className="text-xs text-ink-3 text-center pt-2">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="text-copper-200 hover:text-copper-100">
            Crear cuenta
          </Link>
        </p>
      </form>

      <p className="text-center text-xs text-ink-4 mt-6">
        Al iniciar sesión aceptas nuestros{' '}
        <Link href="/legal/terminos" className="text-ink-3 hover:text-copper-200">términos</Link>
        {' '}y{' '}
        <Link href="/legal/privacidad" className="text-ink-3 hover:text-copper-200">privacidad</Link>.
      </p>
    </div>
  )
}
