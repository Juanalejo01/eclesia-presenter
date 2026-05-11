export const metadata = { title: 'Política de privacidad — EclesiaPresenter' }

export default function Privacy() {
  return (
    <article className="container mx-auto px-6 py-20 max-w-3xl">
      <h1 className="font-display text-5xl text-ink-1 mb-2">Política de privacidad</h1>
      <p className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-12">
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <div className="space-y-6 text-ink-2 leading-relaxed">
        <Section title="¿Qué datos recogemos?">
          Solo lo mínimo necesario: <b>email</b> (para tu cuenta) y <b>datos de pago</b>
          (procesados directamente por Stripe — nunca tocamos tu tarjeta).
          Opcionalmente: nombre y nombre de tu iglesia/organización.
        </Section>

        <Section title="¿Qué NO recogemos?">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Tus canciones, versículos seleccionados o slides proyectados</li>
            <li>Las imágenes o videos que subas a la app</li>
            <li>Telemetría de uso individual</li>
            <li>Datos de tus asistentes a iglesia</li>
          </ul>
          Todo lo que ocurre dentro de la app se queda en tu PC.
        </Section>

        <Section title="Cookies y analytics">
          Usamos cookies estrictamente necesarias para la sesión.
          Para analytics agregadas usamos <b>Plausible</b> (sin cookies, sin tracking
          individual, cumple GDPR).
        </Section>

        <Section title="Pagos">
          Los pagos se procesan vía <b>Stripe</b>. Nosotros nunca vemos ni almacenamos
          datos de tu tarjeta. Stripe cumple con PCI DSS Nivel 1.
        </Section>

        <Section title="Email transaccional">
          Usamos <b>Resend</b> para mandar emails de cuenta (verificación, recibos,
          notificaciones de licencia). No los compartimos con terceros.
        </Section>

        <Section title="Tus derechos">
          Bajo GDPR y LOPD puedes pedirnos en cualquier momento:
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Acceso a tus datos</li>
            <li>Corrección o actualización</li>
            <li>Eliminación total de tu cuenta y datos</li>
            <li>Exportación en formato portable</li>
          </ul>
          Escribe a <a href="mailto:privacidad@eclesiapresenter.com" className="text-copper-200 hover:text-copper-100">privacidad@eclesiapresenter.com</a>.
        </Section>

        <Section title="Retención">
          Mientras tengas cuenta activa, mantenemos tus datos. Al cerrar la cuenta,
          eliminamos todo en 90 días (excepto registros fiscales que la ley nos
          obliga a guardar 5 años — solo email + facturas).
        </Section>

        <Section title="Contacto del DPO">
          <a href="mailto:privacidad@eclesiapresenter.com" className="text-copper-200 hover:text-copper-100">
            privacidad@eclesiapresenter.com
          </a>
        </Section>
      </div>
    </article>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink-1 mb-2">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
