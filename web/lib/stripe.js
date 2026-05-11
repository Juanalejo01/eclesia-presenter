// Cliente Stripe — solo server-side (nunca exponer en cliente)
import Stripe from 'stripe'

let _stripe = null

export function getStripe() {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada')
  _stripe = new Stripe(key, {
    apiVersion: '2024-10-28.acacia',
    typescript: false,
  })
  return _stripe
}

/**
 * Mapeo plan_id → Stripe Price ID + metadata del plan.
 * Las variables NEXT_PUBLIC_STRIPE_PRICE_* las pone el usuario en Vercel
 * con los IDs de sus productos en Stripe.
 */
export const PLANS = {
  pro_monthly: {
    name: 'Pro Mensual',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    mode: 'subscription',
    maxDevices: 1,
  },
  pro_yearly: {
    name: 'Pro Anual',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    mode: 'subscription',
    maxDevices: 3,
  },
  lifetime: {
    name: 'Lifetime',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,
    mode: 'payment',
    maxDevices: 3,
  },
}

export function getPlan(planId) {
  return PLANS[planId] || null
}
