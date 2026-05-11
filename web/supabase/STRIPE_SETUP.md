# Setup de Stripe (paso a paso)

Tiempo estimado: **15 minutos**.

## 1. Crea cuenta + activa Test Mode

1. Ve a https://stripe.com → **Sign in / Sign up**
2. Una vez dentro, arriba a la derecha asegúrate de ver **"TEST MODE"** en naranja.
3. Todo lo que crees aquí es de prueba — no se cobra dinero real.
4. Cuando todo funcione, podrás cambiar a Live Mode con 1 click.

## 2. Crear los 3 productos

**Dashboard → Products → + Add Product** (3 veces):

### Producto 1 — Pro Mensual
- **Name**: `EclesiaPresenter Pro Mensual`
- **Description**: `Suscripción mensual con todas las funciones Pro`
- **Pricing**:
  - Tipo: **Recurring**
  - Precio: **9.00 EUR**
  - Billing period: **Monthly**
- Click **Save product**

### Producto 2 — Pro Anual
- **Name**: `EclesiaPresenter Pro Anual`
- **Description**: `Suscripción anual con todas las funciones Pro (ahorras 27%)`
- **Pricing**:
  - Tipo: **Recurring**
  - Precio: **79.00 EUR**
  - Billing period: **Yearly**

### Producto 3 — Lifetime
- **Name**: `EclesiaPresenter Lifetime`
- **Description**: `Pago único — acceso de por vida a Pro`
- **Pricing**:
  - Tipo: **One-time**
  - Precio: **249.00 EUR**

## 3. Copia los Price IDs

Después de crear cada producto, en su página de detalle verás el **Price ID**
debajo del precio (tipo `price_1Q7XYZabc123...`). **Anota los 3.**

## 4. Copia la Secret Key

**Dashboard → Developers → API keys → Secret key** (de modo TEST).
Empieza con `sk_test_...`. Anótala.

## 5. Configura el webhook

1. **Dashboard → Developers → Webhooks → + Add endpoint**
2. **Endpoint URL**:
   ```
   https://eclesia-presenter.vercel.app/api/webhooks/stripe
   ```
3. **Events to send** → selecciona estos 4:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. En la página del webhook recién creado, busca **Signing secret** y haz click en **Reveal**.
   Empieza con `whsec_...`. Anótala.

## 6. Añade las variables a Vercel

Ve a https://vercel.com/juanangeloti771-7216s-projects/eclesia-presenter/settings/environment-variables
y añade estas 5 variables (todas con Production + Preview + Development marcadas):

| Variable | Valor | Sensitive |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` de Stripe | 🔒 ON |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del webhook | 🔒 ON |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` | `price_...` del Producto 1 | OFF |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` | `price_...` del Producto 2 | OFF |
| `NEXT_PUBLIC_STRIPE_PRICE_LIFETIME` | `price_...` del Producto 3 | OFF |

## 7. Redeploy

**Vercel → Deployments → último → ⋯ → Redeploy** (desmarca "Use existing Build Cache").

## 8. Probar el flujo

1. Abre https://eclesia-presenter.vercel.app/pricing
2. Click en "Suscribirse anual" (cualquier plan)
3. Te lleva a `/checkout?plan=pro_yearly`
4. Si no estás logueado, te manda a `/login` y vuelve después al checkout
5. Se abre **Stripe Checkout** (página de Stripe con tu tarjeta)
6. Usa una tarjeta de test: **4242 4242 4242 4242**, cualquier fecha futura, cualquier CVC, cualquier código postal
7. Completa el pago
8. Stripe te redirige a `/cuenta?checkout=success`
9. En `/cuenta` verás tu plan actualizado y tu **license key** (tipo `EP-XXXX-XXXX-XXXX-XXXX`)

## 9. Ver el evento del webhook (debug)

Si algo no funciona, **Stripe Dashboard → Developers → Webhooks → tu endpoint → Events**.
Verás cada evento que se envió con su status (200=OK, 4xx/5xx=error).

Para forzar reintentos: click en un evento → **"Send a test event"**.

## Tarjetas de prueba útiles

| Tarjeta | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0025 0000 3155` | Requiere autenticación 3DS |
| `4000 0000 0000 0341` | Tarjeta válida, pero el primer pago falla |

Más en https://stripe.com/docs/testing
