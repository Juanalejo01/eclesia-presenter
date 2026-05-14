// POST /api/license/validate
//
// La app llama aquí al arrancar para verificar que la licencia sigue válida.
// Si la suscripción fue cancelada/expirada/revocada desde otra vía (web, Stripe),
// este endpoint devuelve ok=false y la app desktop debe bajar a Free.
//
// También actualiza el last_seen_at del device (heartbeat).
//
// Body JSON:
//   { license_key, device_id, app_version? }
//
// Respuesta:
//   { ok: true, plan, max_devices, expires_at, status }
//   o { ok: false, reason: 'license_no_existe' | 'license_inactiva' | 'expirada' | 'device_no_activado' }

import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { license_key, device_id, app_version } = body || {}

    if (!license_key || !device_id) {
      return NextResponse.json(
        { ok: false, reason: 'parametros_faltantes' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // 1. Buscar licencia
    const { data: license } = await admin
      .from('licenses')
      .select('id, plan, status, max_devices, current_period_end')
      .eq('license_key', license_key)
      .maybeSingle()

    if (!license) {
      return NextResponse.json(
        { ok: false, reason: 'license_no_existe' },
        { status: 404 }
      )
    }

    // 2. Status
    if (license.status !== 'active' && license.status !== 'trialing') {
      return NextResponse.json({
        ok: false,
        reason: 'license_inactiva',
        status: license.status,
      })
    }

    // 3. Expiración (Lifetime = null)
    if (license.current_period_end) {
      if (new Date(license.current_period_end) < new Date()) {
        return NextResponse.json({
          ok: false,
          reason: 'expirada',
          expires_at: license.current_period_end,
        })
      }
    }

    // 4. Verificar que ESTE device está activado para ESTA licencia
    const { data: activation } = await admin
      .from('activations')
      .select('id')
      .eq('license_id', license.id)
      .eq('device_id', device_id)
      .maybeSingle()

    if (!activation) {
      return NextResponse.json({ ok: false, reason: 'device_no_activado' })
    }

    // 5. Heartbeat: actualizar last_seen
    await admin
      .from('activations')
      .update({
        last_seen_at: new Date().toISOString(),
        app_version: app_version || undefined,
      })
      .eq('id', activation.id)

    return NextResponse.json({
      ok: true,
      plan: license.plan,
      max_devices: license.max_devices,
      expires_at: license.current_period_end,
      status: license.status,
    })
  } catch (e) {
    console.error('[api/license/validate] uncaught:', e)
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 })
  }
}
