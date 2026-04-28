'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b border-dark-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-dark-600 hover:text-dark-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-dark-900">Términos y Condiciones</h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-elevated p-8 prose prose-dark max-w-none">
          <p className="text-sm text-dark-600 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">1. Aceptación de Términos</h2>
            <p className="text-dark-700 mb-4">
              Al acceder y utilizar LuxProfile MX ("la Plataforma"), usted acepta estar sujeto a estos Términos y 
              Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-dark-700 mb-4">
              LuxProfile MX es una plataforma digital que conecta profesionales de servicios con clientes potenciales. 
              Los servicios incluyen, pero no se limitan a:
            </p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2 mb-4">
              <li>Masajes terapéuticos y relajantes</li>
              <li>Acompañamiento a eventos sociales y corporativos</li>
              <li>Servicios de bienestar y cuidado personal</li>
              <li>Otros servicios profesionales legítimos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">3. Requisitos de Edad</h2>
            <p className="text-dark-700 mb-4">
              Debe tener al menos 18 años de edad para crear una cuenta y utilizar los servicios de la Plataforma. 
              Al registrarse, usted confirma que tiene la edad legal requerida.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">4. Registro y Cuenta de Usuario</h2>
            <p className="text-dark-700 mb-4">
              Para acceder a ciertas funcionalidades, debe crear una cuenta proporcionando información precisa y actualizada. 
              Usted es responsable de:
            </p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2 mb-4">
              <li>Mantener la confidencialidad de su contraseña</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
              <li>Proporcionar información veraz y actualizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">5. Perfiles y Contenido</h2>
            <div className="space-y-4 text-dark-700">
              <p><strong>5.1 Contenido Prohibido:</strong> No se permite publicar contenido que sea:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Ilegal, fraudulento o engañoso</li>
                <li>Explícitamente sexual o pornográfico</li>
                <li>Discriminatorio, ofensivo o que promueva violencia</li>
                <li>Que viole derechos de propiedad intelectual</li>
                <li>Que contenga virus o código malicioso</li>
              </ul>
              <p><strong>5.2 Verificación:</strong> Nos reservamos el derecho de verificar la autenticidad de los perfiles 
              y solicitar documentación de identidad.</p>
              <p><strong>5.3 Moderación:</strong> LuxProfile MX se reserva el derecho de revisar, rechazar o eliminar 
              cualquier contenido que viole estos términos.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">6. Planes y Pagos</h2>
            <div className="space-y-4 text-dark-700">
              <p><strong>6.1 Suscripciones:</strong> Ofrecemos diferentes planes de suscripción (Free, Premium, VIP) 
              con diferentes características y precios.</p>
              <p><strong>6.2 Facturación:</strong> Las suscripciones se renuevan automáticamente a menos que se cancelen 
              antes de la fecha de renovación.</p>
              <p><strong>6.3 Reembolsos:</strong> Los pagos realizados son generalmente no reembolsables, excepto en 
              casos específicos determinados por la Plataforma.</p>
              <p><strong>6.4 Cambios de Precio:</strong> Nos reservamos el derecho de modificar los precios con 
              notificación previa de 30 días.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">7. Uso Aceptable</h2>
            <p className="text-dark-700 mb-4">Al utilizar la Plataforma, usted se compromete a:</p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2 mb-4">
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              <li>No realizar actividades ilegales o inmorales</li>
              <li>Respetar los derechos de otros usuarios</li>
              <li>No intentar acceder sin autorización a sistemas o cuentas</li>
              <li>No usar la Plataforma para spam o fines comerciales no autorizados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">8. Responsabilidad y Limitaciones</h2>
            <div className="space-y-4 text-dark-700">
              <p><strong>8.1 Intermediación:</strong> LuxProfile MX actúa únicamente como intermediario entre 
              profesionales y clientes. No somos responsables de las interacciones o transacciones que ocurran 
              fuera de la Plataforma.</p>
              <p><strong>8.2 Verificación de Usuarios:</strong> Aunque implementamos medidas de verificación, no 
              garantizamos la identidad, calificaciones o intenciones de los usuarios.</p>
              <p><strong>8.3 Limitación de Responsabilidad:</strong> En la medida máxima permitida por la ley, 
              LuxProfile MX no será responsable de daños indirectos, incidentales o consecuentes.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">9. Propiedad Intelectual</h2>
            <p className="text-dark-700 mb-4">
              Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo diseño, código, logotipos 
              y contenido, pertenecen a LuxProfile MX. Los usuarios conservan los derechos sobre el contenido que publican.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">10. Suspensión y Terminación</h2>
            <p className="text-dark-700 mb-4">
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos, sin previo aviso 
              y sin reembolso. Los usuarios pueden cancelar su cuenta en cualquier momento desde la configuración.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">11. Modificaciones</h2>
            <p className="text-dark-700 mb-4">
              LuxProfile MX se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado de la 
              Plataforma constituye la aceptación de los términos modificados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-dark-700 mb-4">
              Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se resolverá 
              en los tribunales competentes de México.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">13. Contacto</h2>
            <p className="text-dark-700 mb-4">
              Para preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
            </p>
            <ul className="list-none text-dark-700 space-y-2">
              <li><strong>Email:</strong> legal@luxprofile.mx</li>
              <li><strong>Dirección:</strong> [Tu dirección]</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-brand-50 border border-brand-200 rounded-xl">
            <p className="text-sm text-brand-900 font-medium">
              Al utilizar LuxProfile MX, usted reconoce que ha leído, comprendido y acepta estar sujeto a 
              estos Términos y Condiciones, así como a nuestra Política de Privacidad.
            </p>
          </div>
        </div>

        {/* Enlaces relacionados */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/legal/privacidad" className="text-brand-600 hover:text-brand-700 font-medium">
            Política de Privacidad
          </Link>
          <span className="text-dark-400">•</span>
          <Link href="/legal/faq" className="text-brand-600 hover:text-brand-700 font-medium">
            Preguntas Frecuentes
          </Link>
          <span className="text-dark-400">•</span>
          <Link href="/" className="text-brand-600 hover:text-brand-700 font-medium">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
