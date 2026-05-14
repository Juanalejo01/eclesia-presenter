// POST /api/activate
//
// La app desktop llama aquí cuando el usuario pega su license_key en Ajustes.
//
// Body JSON:
//   {
//     license_key: "EP-XXXX-XXXX-XXXX-XXXX",
//     device_id:   "<hash estable del PC>",
//     device_name: "PC Iglesia",
//     os:          "Windows 11",
//     app_version: "0.2.0"
//   }
//
// Respuesta éxito:
//   { ok: true, plan, max_devices, expires_at, status }
//
// Respuesta error:
//   { ok: false, error: 'license_no_existe' | 'license_inactiva' | 'expirada' | 'limite_devices' }
//
// IMPORTANTE: este endpoint es público (sin auth) porque la app desktop no tiene
// sesión Supabase. La autenticación se basa en que el license_key es el secreto
// del usuario. Usamos service_role para escribir saltando RLS.

import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { license_key, device_id, device_name, os, app_version } = body || {}

    if (!license_key || !device_id) {
      return NextResponse.json(
        { ok: false, error: 'parametros_faltantes' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // 1. Buscar la licencia por key
    const { data: license, error: licErr } = await admin
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .maybeSingle()

    if (licErr) {
      console.error('[api/activate] supabase error:', licErr)
      return NextResponse.json({ ok: false, error: 'error_supabase' }, { status: 500 })
    }

    if (!license) {
      return NextResponse.json(
        { ok: false, error: 'license_no_existe' },
        { status: 404 }
      )
    }

    // 2. Validar status
    if (license.status !== 'active' && license.status !== 'trialing') {
      return NextResponse.json(
        { ok: false, error: 'license_inactiva', status: license.status },
        { status: 403 }
      )
    }

    // 3. Validar expiración (lifetime tiene current_period_end = null)
    if (license.current_period_end) {
      const expiresAt = new Date(license.current_period_end)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { ok: false, error: 'expirada', expires_at: license.current_period_end },
          { status: 403 }
        )
      }
    }

    // 4. Verificar si este device ya está activado para esta licencia
    const { data: existingActivation } = await admin
      .from('activations')
      .select('id')
      .eq('license_id', license.id)
      .eq('device_id', device_id)
      .maybeSingle()

    if (existingActivation) {
      // Re-activación del mismo PC: actualizar last_seen_at + metadata
      await admin
        .from('activations')
        .update({
          device_name: device_name || null,
          os: os || null,
          app_version: app_version || null,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existingActivation.id)

      return NextResponse.json({
        ok: true,
        plan: license.plan,
        max_devices: license.max_devices,
        expires_at: license.current_period_end,
        status: license.status,
        reactivated: true,
      })
    }

    // 5. Contar activaciones actuales y verificar límite
    const { count } = await admin
      .from('activations')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)

    if ((count || 0) >= license.max_devices) {
      return NextResponse.json(
        {
          ok: false,
          error: 'limite_devices',
          current_devices: count,
          max_devices: license.max_devices,
        },
        { status: 403 }
      )
    }

    // 6. Crear nueva activación
    const { error: insErr } = await admin.from('activations').insert({
      license_id: license.id,
      device_id,
      device_name: device_name || null,
      os: os || null,
      app_version: app_version || null,
    })

    if (insErr) {
      console.error('[api/activate] insert error:', insErr)
      return NextResponse.json({ ok: false, error: 'error_supabase' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      plan: license.plan,
      max_devices: license.max_devices,
      expires_at: license.current_period_end,
      status: license.status,
    })
  } catch (e) {
    console.error('[api/activate] uncaught:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
