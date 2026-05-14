// POST /api/deactivate
//
// Libera el slot de un dispositivo. La app llama aquí cuando el user le da
// a "Desactivar este PC" desde Ajustes. También se llama desde /cuenta cuando
// el user gestiona sus PCs desde la web.
//
// Body JSON:
//   { license_key, device_id }
//
// Respuesta:
//   { ok: true } o { ok: false, error }

import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { license_key, device_id } = body || {}

    if (!license_key || !device_id) {
      return NextResponse.json(
        { ok: false, error: 'parametros_faltantes' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: license } = await admin
      .from('licenses')
      .select('id')
      .eq('license_key', license_key)
      .maybeSingle()

    if (!license) {
      return NextResponse.json(
        { ok: false, error: 'license_no_existe' },
        { status: 404 }
      )
    }

    const { error: delErr } = await admin
      .from('activations')
      .delete()
      .eq('license_id', license.id)
      .eq('device_id', device_id)

    if (delErr) {
      console.error('[api/deactivate] delete error:', delErr)
      return NextResponse.json({ ok: false, error: 'error_supabase' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/deactivate] uncaught:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
