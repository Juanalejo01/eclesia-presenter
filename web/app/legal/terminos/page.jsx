export const metadata = { title: 'Términos de uso — EclesiaPresenter' }

export default function Terms() {
  return (
    <article className="container mx-auto px-6 py-20 max-w-3xl prose-invert">
      <h1 className="font-display text-5xl text-ink-1 mb-2">Términos de uso</h1>
      <p className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-12">
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <div className="space-y-6 text-ink-2 leading-relaxed">
        <Section title="1. Aceptación">
          Al usar EclesiaPresenter aceptas estos términos. Si no estás de acuerdo,
          no instales ni utilices el software.
        </Section>

        <Section title="2. Licencia de uso">
          EclesiaPresenter es software propietario distribuido con licencia de uso
          (no de propiedad). El código fuente del cliente es público en GitHub bajo MIT
          a efectos de transparencia, pero la marca, dominio y servicios asociados
          (cuenta, licencias, soporte) pertenecen al desarrollador.
        </Section>

        <Section title="3. Plan Free">
          El plan Free es gratuito y de uso indefinido. Incluye una marca de agua
          sutil en la proyección. Limitado a las funciones descritas en /pricing.
        </Section>

        <Section title="4. Planes Pro">
          Las suscripciones se renuevan automáticamente al final de cada periodo.
          Puedes cancelar en cualquier momento desde tu panel de cuenta.
          La cancelación entra en vigor al final del periodo pagado.
        </Section>

        <Section title="5. Garantía y reembolsos">
          Ofrecemos garantía de devolución de 30 días desde el primer pago.
          Solicítalo desde tu cuenta o por email; sin preguntas.
        </Section>

        <Section title="6. Contenido del usuario">
          Las canciones, biblias importadas e imágenes que añadas son tuyas.
          No los compartimos, vendemos ni inspeccionamos. Todo se almacena
          localmente en tu PC. Si usas el backup en la nube (Pro), tus datos
          van cifrados.
        </Section>

        <Section title="7. Contenido bíblico bajo copyright">
          Algunas versiones bíblicas (RVR 1960, NVI, etc.) están bajo copyright de sus
          respectivos editores. Su inclusión es para uso devocional. El usuario es
          responsable de cumplir con las licencias correspondientes para uso comercial
          o redistribución.
        </Section>

        <Section title="8. Limitación de responsabilidad">
          EclesiaPresenter se proporciona &ldquo;tal cual&rdquo;. No nos hacemos responsables
          de pérdida de datos, fallos durante un servicio, ni daños indirectos.
          Recomendamos hacer backups regulares.
        </Section>

        <Section title="9. Cambios">
          Podemos actualizar estos términos. Te notificaremos cambios importantes
          por email al menos 30 días antes de que entren en vigor.
        </Section>

        <Section title="10. Contacto">
          <a href="mailto:hola@eclesiapresenter.com" className="text-copper-200 hover:text-copper-100">
            hola@eclesiapresenter.com
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
      <p>{children}</p>
    </section>
  )
}
