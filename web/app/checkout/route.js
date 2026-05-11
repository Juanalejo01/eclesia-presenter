// /checkout?plan=pro_monthly|pro_yearly|lifetime
// Crea una sesión de Stripe Checkout y redirige.
// Requiere usuario autenticado (si no, lo manda a /login).
import { NextResponse } from 'next/server'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { getStripe, getPlan } from '../../lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const planId = searchParams.get('plan')

  const plan = getPlan(planId)
  if (!plan || !plan.priceId) {
    return NextResponse.redirect(`${origin}/pricing?error=plan_no_valido`)
  }

  // 1. Usuario autenticado
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}&plan=${planId}`)
  }

  // 2. Obtener (o crear) el Stripe Customer asociado al perfil
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, name, email')
    .eq('id', user.id)
    .maybeSingle()

  const stripe = getStripe()
  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.name || undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  // 3. Crear la Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/cuenta?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelado`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    automatic_tax: { enabled: false },
    metadata: {
      supabase_user_id: user.id,
      plan_id: planId,
    },
    subscription_data: plan.mode === 'subscription'
      ? { metadata: { supabase_user_id: user.id, plan_id: planId } }
      : undefined,
  })

  return NextResponse.redirect(session.url, { status: 303 })
}
