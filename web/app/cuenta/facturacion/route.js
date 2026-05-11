// Redirige al Customer Portal de Stripe para que el usuario
// gestione su suscripción (cancelar, cambiar plan, ver facturas, actualizar tarjeta).
import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getStripe } from '../../../lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { origin } = new URL(request.url)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=/cuenta`)
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(`${origin}/cuenta?error=sin_cliente_stripe`)
  }

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/cuenta`,
  })

  return NextResponse.redirect(session.url, { status: 303 })
}
