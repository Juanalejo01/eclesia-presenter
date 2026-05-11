'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/cuenta'
  const plan = searchParams.get('plan')  // si viene de /pricing con un plan elegido

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError(null)

    const supabase = createClient()
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${plan ? `&plan=${plan}` : ''}`

    // Timeout defensivo de 15s para no dejar al user esperando indefinidamente.
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('La petición a Supabase tardó más de 15 segundos. Verifica tu conexión y que los Redirect URLs estén configurados en Supabase → Auth → URL Configuration.')), 15000)
    )

    try {
      const result = await Promise.race([
        supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: callbackUrl,
            shouldCreateUser: true,  // crea cuenta si no existe (magic link = login + signup)
          },
        }),
        timeoutPromise,
      ])

      setLoading(false)
      if (result.error) {
        console.error('[login] Supabase error:', result.error)
        setError(result.error.message || JSON.stringify(result.error))
      } else {
        setSent(true)
      }
    } catch (e) {
      setLoading(false)
      console.error('[login] Exception:', e)
      setError(e?.message || String(e))
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-copper-300/30 bg-copper-300/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-copper-300/20 grid place-items-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l2-2h14l2 2"
              stroke="#db9f75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-ink-1 mb-2">Revisa tu correo</h2>
        <p className="text-ink-2 text-sm mb-4 leading-relaxed">
          Te enviamos un enlace de acceso a <b className="text-copper-200">{email}</b>.
          Haz click en él para entrar (el enlace caduca en 1 hora).
        </p>
        <p className="text-xs text-ink-3">
          ¿No lo ves? Revisa la carpeta de spam o{' '}
          <button onClick={() => { setSent(false); setEmail('') }}
            className="text-copper-200 hover:text-copper-100 underline underline-offset-2">
            prueba otro correo
          </button>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-copper-300/20 bg-bg-2 p-8 space-y-5">
      {plan && (
        <div className="text-xs text-copper-200 bg-copper-300/10 border border-copper-300/20 px-3 py-2 rounded-md">
          Plan seleccionado: <b className="capitalize">{plan.replace('_', ' ')}</b>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-ink-3 mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@iglesia.com"
          required
          autoFocus
          className="w-full h-12 px-4 rounded-lg bg-bg-1 border border-copper-300/15
                     text-ink-1 placeholder-ink-4 outline-none
                     focus:border-copper-300/50 focus:ring-2 focus:ring-copper-300/15"
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full h-12 rounded-lg
                   bg-gradient-to-b from-copper-200 to-copper-300
                   text-[#1a0e08] font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:from-copper-100 hover:to-copper-200 transition-all"
      >
        {loading ? 'Enviando…' : 'Enviar enlace mágico'}
      </button>

      <p className="text-xs text-ink-3 text-center pt-2">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/register" className="text-copper-200 hover:text-copper-100 underline underline-offset-2">
          Crear cuenta
        </Link>
        <br/>
        El enlace mágico también crea tu cuenta automáticamente.
      </p>
    </form>
  )
}
