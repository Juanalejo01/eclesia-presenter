# Crear el cupón TESTING en Stripe (3 min)

El checkout ya tiene `allow_promotion_codes: true` activado, así que solo
necesitas crear el cupón en Stripe Dashboard y se aplicará automáticamente
cuando los usuarios lo pongan en la página de pago.

## 1. Crear el cupón base

1. Ve a https://dashboard.stripe.com/test/coupons (asegúrate **TEST MODE** o **LIVE**
   según donde quieras lanzarlo).
2. **+ New** (arriba a la derecha).
3. **Type**: Percentage discount
4. **Percent off**: `30`
5. **Duration**: **Repeating** → **Number of months**: `2`
   - Esto significa que durante los primeros 2 meses de la suscripción se
     aplica el 30%, y después vuelve al precio normal.
   - Para Lifetime (one-time payment) no tiene sentido → no lo apliques ahí.
6. **ID**: `TESTING` (en mayúsculas, identifica internamente al cupón)
7. **Redeem by**: opcional, deja una fecha límite (ej. 31 dec 2026) para que el
   cupón expire automáticamente.
8. **Max redemptions**: `50` (los primeros 50 usuarios)
9. **Apply to specific products**: marca solo los productos **Pro Mensual** y
   **Pro Anual** (NO el Lifetime).
10. **Save coupon**.

## 2. Crear un Promotion Code visible para el usuario

Stripe diferencia entre **Coupon** (objeto interno) y **Promotion Code** (lo
que el usuario escribe en el checkout). Tienes que crear el Promotion Code
asociado al Coupon que acabas de crear:

1. Mismo dashboard → pestaña **Promotion codes** (al lado de Coupons).
2. **+ New**.
3. **Coupon**: selecciona `TESTING` (el que creaste arriba).
4. **Code** (lo que escribe el usuario): `TESTING`
5. **Max redemptions**: 50 (mismo número).
6. **Restrictions**:
   - Marca "First-time order only" si quieres que cada email lo use solo una vez.
   - "Minimum order" déjalo vacío.
7. **Save**.

## 3. Verificar que funciona

1. Ve a https://eclesia-presenter.vercel.app/checkout?plan=pro_monthly
2. Te lleva a Stripe Checkout.
3. Verás un link "Add promotion code" (o un campo desplegable).
4. Escribe `TESTING` → click Apply.
5. Debería ajustar el precio mostrando "30% off for 2 months".

## 4. Monitorización del cupón

- Dashboard → Coupons → click en `TESTING` → ves cuántos lo han usado.
- Cuando llegues a 50 usos, Stripe lo deshabilita automáticamente.
- Puedes ampliar a 100 si funciona bien.

## 5. Pedir el testimonio

Cuando un usuario use el cupón, envíale un email automático (vía Resend cuando lo
implementemos) tipo:

> Hola [nombre],
>
> Gracias por activar el cupón TESTING. Como parte del programa beta, nos encantaría
> recibir un testimonio breve (3-4 frases) sobre tu experiencia con EclesiaPresenter
> en las próximas 4 semanas.
>
> Si decides escribirlo, contesta a este email con:
> - Tu nombre + iglesia
> - 3-4 frases sobre lo que más te gusta
> - Una foto opcional para acompañar
>
> Aparecerás en nuestra landing (con tu permiso) ayudando a otras iglesias a decidirse.

Esto generará testimonios sociales auténticos para tu landing.
