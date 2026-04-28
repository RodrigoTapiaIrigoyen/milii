'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacidadPage() {
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
            <Shield className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-dark-900">Política de Privacidad</h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-elevated p-8 prose prose-dark max-w-none">
          <p className="text-sm text-dark-600 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-dark-700">
              En PlacerLux, nos comprometemos a proteger su privacidad y datos personales. Esta Política de 
              Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">1. Información que Recopilamos</h2>
            
            <div className="space-y-4 text-dark-700">
              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">1.1 Información que Usted Proporciona</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de registro:</strong> Nombre, email, contraseña</li>
                  <li><strong>Datos del perfil:</strong> Nombre artístico, edad, género, descripción, ubicación</li>
                  <li><strong>Información de contacto:</strong> WhatsApp, Telegram</li>
                  <li><strong>Fotografías:</strong> Imágenes que usted sube a su perfil</li>
                  <li><strong>Información de pago:</strong> Datos procesados a través de MercadoPago</li>
                  <li><strong>Documentos de verificación:</strong> Identificación oficial (si opta por verificarse)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">1.2 Información Recopilada Automáticamente</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de uso:</strong> Páginas visitadas, clics, tiempo de navegación</li>
                  <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
                  <li><strong>Dirección IP:</strong> Para seguridad y análisis geográfico</li>
                  <li><strong>Cookies:</strong> Para mantener sesión y mejorar la experiencia</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">2. Cómo Usamos su Información</h2>
            <p className="text-dark-700 mb-4">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Crear y gestionar su cuenta de usuario</li>
              <li>Procesar pagos y suscripciones</li>
              <li>Verificar identidades y prevenir fraudes</li>
              <li>Mostrar su perfil a otros usuarios</li>
              <li>Enviar notificaciones importantes sobre su cuenta</li>
              <li>Responder a sus consultas y solicitudes de soporte</li>
              <li>Analizar el uso de la plataforma para mejoras</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">3. Compartir Información</h2>
            
            <div className="space-y-4 text-dark-700">
              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">3.1 Información Pública</h3>
                <p>
                  La información de su perfil (nombre, fotos, descripción, ubicación, servicios, precios) es visible 
                  para todos los usuarios de la plataforma. <strong>No compartimos su email, contraseña o datos de pago.</strong>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">3.2 Proveedores de Servicios</h3>
                <p className="mb-2">Compartimos información con terceros que nos ayudan a operar la plataforma:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>MercadoPago:</strong> Procesamiento de pagos</li>
                  <li><strong>MongoDB Atlas:</strong> Almacenamiento de base de datos</li>
                  <li><strong>Servicios de hosting:</strong> Alojamiento de la plataforma</li>
                  <li><strong>Servicios de almacenamiento:</strong> Para imágenes y archivos</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">3.3 Requerimientos Legales</h3>
                <p>
                  Podemos divulgar su información si es requerido por ley, orden judicial, o para proteger nuestros 
                  derechos legales.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">3.4 Venta o Transferencia del Negocio</h3>
                <p>
                  En caso de fusión, adquisición o venta de activos, su información podría ser transferida. 
                  Le notificaremos de cualquier cambio.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">4. Seguridad de los Datos</h2>
            <p className="text-dark-700 mb-4">
              Implementamos medidas de seguridad técnicas y organizacionales para proteger su información:
            </p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2">
              <li>Encriptación de contraseñas con bcrypt</li>
              <li>Conexiones HTTPS seguras</li>
              <li>Autenticación con JWT y cookies HTTP-only</li>
              <li>Monitoreo de actividades sospechosas</li>
              <li>Acceso restringido a datos sensibles</li>
              <li>Copias de seguridad regulares</li>
            </ul>
            <p className="text-dark-700 mt-4">
              <strong>Nota:</strong> Ningún sistema es 100% seguro. Hacemos nuestro mejor esfuerzo, pero no podemos 
              garantizar la seguridad absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">5. Sus Derechos</h2>
            <p className="text-dark-700 mb-4">Usted tiene derecho a:</p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2">
              <li><strong>Acceder:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
              <li><strong>Eliminar:</strong> Solicitar la eliminación de su cuenta y datos</li>
              <li><strong>Oponerse:</strong> Rechazar ciertos usos de su información</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Revocar consentimiento:</strong> En cualquier momento</li>
            </ul>
            <p className="text-dark-700 mt-4">
              Para ejercer estos derechos, puede:
            </p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2">
              <li>Acceder a su configuración de cuenta</li>
              <li>Contactarnos a privacy@placerlux.lat</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">6. Retención de Datos</h2>
            <p className="text-dark-700 mb-4">
              Mantenemos su información personal mientras su cuenta esté activa o según sea necesario para:
            </p>
            <ul className="list-disc pl-6 text-dark-700 space-y-2">
              <li>Proporcionar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Resolver disputas</li>
              <li>Hacer cumplir nuestros acuerdos</li>
            </ul>
            <p className="text-dark-700 mt-4">
              Cuando elimine su cuenta, eliminaremos o anonimizaremos su información personal dentro de 30 días, 
              excepto cuando la ley requiera retención más prolongada.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">7. Cookies y Tecnologías Similares</h2>
            <div className="space-y-4 text-dark-700">
              <p>Utilizamos cookies y tecnologías similares para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                <li><strong>Cookies de preferencias:</strong> Recordar sus configuraciones</li>
                <li><strong>Cookies analíticas:</strong> Entender cómo se usa el sitio</li>
              </ul>
              <p>Puede controlar las cookies a través de la configuración de su navegador.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">8. Menores de Edad</h2>
            <p className="text-dark-700">
              Nuestros servicios están destinados únicamente a personas mayores de 18 años. No recopilamos 
              intencionalmente información de menores. Si descubrimos que hemos recopilado datos de un menor, 
              los eliminaremos inmediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">9. Transferencias Internacionales</h2>
            <p className="text-dark-700">
              Sus datos pueden ser transferidos y procesados en servidores ubicados fuera de México. Nos aseguramos 
              de que se mantengan medidas de protección adecuadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">10. Cambios a esta Política</h2>
            <p className="text-dark-700">
              Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos de cambios significativos 
              por email o mediante un aviso prominente en la plataforma. La fecha de "Última actualización" indica 
              cuándo se modificó por última vez.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">11. Contacto</h2>
            <p className="text-dark-700 mb-4">
              Para preguntas sobre esta Política de Privacidad o nuestras prácticas de datos, contáctenos:
            </p>
            <ul className="list-none text-dark-700 space-y-2">
              <li><strong>Email:</strong> privacy@placerlux.lat</li>
              <li><strong>Dirección:</strong> [Tu dirección]</li>
              <li><strong>Oficial de Protección de Datos:</strong> dpo@placerlux.lat</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-900 font-medium">
              🔒 Su privacidad es importante para nosotros. Nos comprometemos a manejar su información de manera 
              responsable y transparente, cumpliendo con todas las leyes aplicables de protección de datos.
            </p>
          </div>
        </div>

        {/* Enlaces relacionados */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/legal/terminos" className="text-brand-600 hover:text-brand-700 font-medium">
            Términos y Condiciones
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
