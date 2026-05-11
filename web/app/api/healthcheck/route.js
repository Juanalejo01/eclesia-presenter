// Endpoint de diagnóstico — devuelve el estado de las env vars
// SIN exponer sus valores completos. Solo prefijos y longitudes.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function describe(value) {
  if (!value) return { present: false }
  return {
    present: true,
    length: value.length,
    starts_with: value.slice(0, 14),
    ends_with: value.slice(-6),
    has_whitespace: /\s/.test(value),
    has_quotes: /["']/.test(value),
    has_newline: /\n|\r/.test(value),
  }
}

function isValidUrl(s) {
  if (!s) return false
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch { return false }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE

  // Intentar inicializar Supabase y hacer una petición trivial
  let supabaseTest = { ok: false, error: null }
  try {
    if (url && anon && isValidUrl(url)) {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(url, anon, { auth: { persistSession: false } })
      const { error } = await client.from('profiles').select('count', { count: 'exact', head: true })
      // Sin sesión RLS bloqueará el SELECT — eso es OK, significa que el server responde.
      // Solo "permission denied" es señal de que la conexión está bien.
      if (!error || error.message?.includes('permission') || error.code === 'PGRST301') {
        supabaseTest.ok = true
      } else {
        supabaseTest.error = error.message
      }
    }
  } catch (e) {
    supabaseTest.error = e?.message || String(e)
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env_vars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        ...describe(url),
        is_valid_url: isValidUrl(url),
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: describe(anon),
      SUPABASE_SERVICE_ROLE: describe(service),
    },
    supabase_connection: supabaseTest,
    diagnostics: {
      url_format_ok: isValidUrl(url),
      url_has_problems:
        !url ? 'falta la variable' :
        !url.startsWith('https://') ? 'no empieza con https://' :
        /\s/.test(url) ? 'tiene espacios' :
        /["']/.test(url) ? 'tiene comillas dentro del valor' :
        url.endsWith('/') ? 'tiene slash al final (no rompe pero mejor sin él)' :
        null,
      anon_format:
        !anon ? 'falta' :
        anon.startsWith('sb_publishable_') ? 'nuevo formato (sb_publishable_) — compatible' :
        anon.startsWith('eyJhbGc') ? 'formato JWT legacy — compatible' :
        'formato no reconocido',
      service_format:
        !service ? 'falta' :
        service.startsWith('sb_secret_') ? 'nuevo formato (sb_secret_) — compatible' :
        service.startsWith('eyJhbGc') ? 'formato JWT legacy — compatible' :
        'formato no reconocido',
    },
  })
}
