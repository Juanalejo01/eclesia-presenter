// Webhook de Stripe.
// Stripe envía eventos a este endpoint cuando ocurren cambios en pagos/suscripciones.
// IMPORTANTE: SOLO usa service_role para escribir en Supabase (salta RLS).
import { NextResponse } from 'next/server'
import { getStripe } from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
// Stripe requiere el raw body para verificar la firma. Next.js App Router lo da con .text()

const PLAN_MAX_DEVICES = {
  pro_monthly: 1,
  pro_yearly: 3,
  lifetime: 3,
  free: 1,
}

export async function POST(request) {
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'missing signature or webhook secret' }, { status: 400 })
  }

  const stripe = getStripe()
  const rawBody = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      // ----- Checkout completado (subscription O one-time) -----
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id
        const planId = session.metadata?.plan_id
        if (!userId || !planId) {
          console.warn('[stripe webhook] checkout.session.completed sin metadata')
          break
        }

        // Generar license key vía RPC (función SQL del schema)
        const { data: keyData } = await admin.rpc('generate_license_key')
        const licenseKey = keyData || `EP-${Date.now()}`

        // Lifetime: pago único, sin fecha de fin
        // Subscriptions: leemos el sub_id de la sesión
        const isLifetime = planId === 'lifetime'
        const subId = isLifetime ? null : session.subscription
        let currentPeriodEnd = null
        let stripePrice = null

        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null
          stripePrice = sub.items.data[0]?.price?.id || null
        } else if (session.line_items) {
          stripePrice = session.line_items.data?.[0]?.price?.id
        }

        // Insertar licencia (upsert por subscription_id si existe)
        const license = {
          user_id: userId,
          plan: planId,
          status: 'active',
          license_key: licenseKey,
          max_devices: PLAN_MAX_DEVICES[planId] || 1,
          stripe_subscription_id: subId,
          stripe_price_id: stripePrice,
          current_period_end: currentPeriodEnd,
        }

        // Si ya tenía una licencia activa del mismo tipo, la actualizamos
        const { data: existing } = await admin
          .from('licenses')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (existing) {
          await admin.from('licenses').update({
            ...license,
            updated_at: new Date().toISOString(),
          }).eq('id', existing.id)
        } else {
          await admin.from('licenses').insert(license)
        }

        // TODO: enviar email de bienvenida con la license_key (Resend)
        console.log(`[stripe webhook] license created/updated for user ${userId} plan ${planId}`)
        break
      }

      // ----- Subscription actualizada (cambio de plan, pago renovado) -----
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const status = mapStripeStatus(sub.status)
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

        await admin.from('licenses').update({
          status,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      // ----- Subscription cancelada -----
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await admin.from('licenses').update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      // ----- Pago fallido -----
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        if (invoice.subscription) {
          await admin.from('licenses').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }

      default:
        // Otros eventos: ignorar silenciosamente
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe webhook] handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function mapStripeStatus(stripeStatus) {
  switch (stripeStatus) {
    case 'active': return 'active'
    case 'trialing': return 'trialing'
    case 'past_due': return 'past_due'
    case 'canceled': return 'canceled'
    case 'unpaid': return 'past_due'
    case 'incomplete': return 'past_due'
    case 'incomplete_expired': return 'expired'
    default: return 'active'
  }
}
