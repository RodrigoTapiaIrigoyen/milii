'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // General
  {
    category: 'General',
    question: '¿Qué es LuxProfile MX?',
    answer: 'LuxProfile MX es una plataforma que conecta profesionales de servicios (masajes, acompañamiento a eventos, wellness) con clientes potenciales. Ofrecemos un espacio seguro y verificado para que profesionales puedan anunciarse y ser contactados por personas interesadas en sus servicios.',
  },
  {
    category: 'General',
    question: '¿Es legal utilizar esta plataforma?',
    answer: 'Sí, completamente legal. LuxProfile MX es una plataforma de servicios profesionales legítimos como masajes terapéuticos, acompañamiento a eventos sociales y corporativos, y otros servicios de wellness. No permitimos contenido ilegal ni actividades que violen las leyes mexicanas.',
  },
  {
    category: 'General',
    question: '¿Quién puede usar LuxProfile MX?',
    answer: 'Cualquier persona mayor de 18 años puede crear una cuenta. Los profesionales pueden crear perfiles para ofrecer sus servicios, mientras que los clientes pueden explorar perfiles y contactar directamente a los profesionales.',
  },

  // Registro y Cuenta
  {
    category: 'Registro y Cuenta',
    question: '¿Cómo creo una cuenta?',
    answer: 'Haz clic en "Registrarse" en la página principal, proporciona tu email y crea una contraseña segura. Recibirás un email de confirmación para activar tu cuenta. Una vez activada, podrás crear tu perfil profesional.',
  },
  {
    category: 'Registro y Cuenta',
    question: '¿Olvidé mi contraseña, qué hago?',
    answer: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu email y te enviaremos un link para crear una nueva contraseña. El link expira en 1 hora por seguridad.',
  },
  {
    category: 'Registro y Cuenta',
    question: '¿Cómo cambio mi email o contraseña?',
    answer: 'Ve a Dashboard > Configuración. Ahí podrás cambiar tu email o contraseña. Para mayor seguridad, necesitarás ingresar tu contraseña actual para confirmar cualquier cambio.',
  },
  {
    category: 'Registro y Cuenta',
    question: '¿Cómo elimino mi cuenta?',
    answer: 'Ve a Dashboard > Configuración > Zona de Peligro. Deberás escribir "ELIMINAR" e ingresar tu contraseña para confirmar. Esta acción es permanente y eliminará todos tus datos, fotos y suscripciones.',
  },

  // Perfiles
  {
    category: 'Perfiles',
    question: '¿Cómo creo mi perfil profesional?',
    answer: 'Una vez registrado, ve a Dashboard > Mi Perfil > Crear Perfil. Completa la información: nombre artístico, edad, descripción, servicios que ofreces, precios, ubicación y sube fotos. Luego publica tu perfil para que sea visible.',
  },
  {
    category: 'Perfiles',
    question: '¿Cuántas fotos puedo subir?',
    answer: 'Puedes subir hasta 10 fotos en tu perfil. Cada foto debe pesar máximo 5MB y estar en formato JPG, PNG o WEBP. Recomendamos fotos de buena calidad y profesionales.',
  },
  {
    category: 'Perfiles',
    question: '¿Qué información es pública en mi perfil?',
    answer: 'Tu nombre artístico, edad, género, descripción, servicios, precios, ubicación (estado y ciudad), fotos y estadísticas son públicas. Tu email, contraseña y datos personales NO son visibles para otros usuarios.',
  },
  {
    category: 'Perfiles',
    question: '¿Qué significa "perfil verificado"?',
    answer: 'Los perfiles verificados han completado nuestro proceso de verificación de identidad enviando documentos oficiales. Esto da mayor confianza a los clientes. Obtener la verificación aumenta tu visibilidad y credibilidad.',
  },

  // Planes y Pagos
  {
    category: 'Planes y Pagos',
    question: '¿Cuáles son los planes disponibles?',
    answer: 'Ofrecemos 3 planes: FREE (gratis 7 días de prueba con funciones limitadas), PREMIUM ($99 MXN/mes con perfil destacado y mayor visibilidad), y VIP ($199 MXN/mes con máxima visibilidad y soporte prioritario).',
  },
  {
    category: 'Planes y Pagos',
    question: '¿Cómo funciona la prueba gratuita?',
    answer: 'Al crear tu cuenta, obtienes 7 días gratis del plan FREE para probar la plataforma. Puedes publicar tu perfil y recibir contactos. Después de 7 días, necesitarás suscribirte a un plan de pago para seguir visible.',
  },
  {
    category: 'Planes y Pagos',
    question: '¿Cómo realizo el pago de mi suscripción?',
    answer: 'Ve a Dashboard > Planes y selecciona el plan que deseas. Serás redirigido a MercadoPago para completar el pago de forma segura. Aceptamos tarjetas de crédito/débito, transferencias y otros métodos.',
  },
  {
    category: 'Planes y Pagos',
    question: '¿Las suscripciones se renuevan automáticamente?',
    answer: 'Sí, las suscripciones se renuevan automáticamente cada mes. Puedes cancelar en cualquier momento desde Dashboard > Planes > Gestionar Suscripción. Al cancelar, tu plan seguirá activo hasta el final del período pagado.',
  },
  {
    category: 'Planes y Pagos',
    question: '¿Puedo obtener un reembolso?',
    answer: 'Generalmente los pagos no son reembolsables, excepto en casos especiales evaluados individualmente. Si tienes algún problema con tu pago, contáctanos a soporte@luxprofile.mx.',
  },

  // Búsqueda y Contacto
  {
    category: 'Búsqueda y Contacto',
    question: '¿Cómo busco perfiles?',
    answer: 'Ve a la página "Explorar Perfiles". Puedes usar la barra de búsqueda para buscar por nombre o descripción, y aplicar filtros por ubicación, servicios, género, precio y verificación. La búsqueda es rápida y precisa.',
  },
  {
    category: 'Búsqueda y Contacto',
    question: '¿Cómo contacto a un profesional?',
    answer: 'Cada perfil muestra el número de WhatsApp del profesional. Haz clic en el botón de WhatsApp para iniciar una conversación directamente. El contacto es directo entre tú y el profesional.',
  },
  {
    category: 'Búsqueda y Contacto',
    question: '¿Puedo guardar perfiles como favoritos?',
    answer: 'Sí, haz clic en el ícono de corazón en cualquier perfil para guardarlo en tus favoritos. Puedes ver tus favoritos en Dashboard > Favoritos. (Nota: Esta función se implementará pronto)',
  },

  // Seguridad y Privacidad
  {
    category: 'Seguridad y Privacidad',
    question: '¿Es segura la plataforma?',
    answer: 'Sí, utilizamos encriptación SSL para todas las conexiones, almacenamos contraseñas con hash seguro (bcrypt), y implementamos múltiples medidas de seguridad. Sin embargo, siempre usa sentido común al interactuar con otros usuarios.',
  },
  {
    category: 'Seguridad y Privacidad',
    question: '¿Qué hago si encuentro contenido inapropiado?',
    answer: 'Reporta inmediatamente cualquier perfil con contenido sospechoso, ilegal o que viole nuestros términos. Nuestro equipo revisará y tomará acción en 24-48 horas. (Función de reportes próximamente)',
  },
  {
    category: 'Seguridad y Privacidad',
    question: '¿Venden mi información personal?',
    answer: 'NO. Nunca vendemos ni compartimos tu información personal con terceros para marketing. Solo compartimos datos necesarios con proveedores de servicios (como procesadores de pago) bajo estrictos acuerdos de confidencialidad.',
  },

  // Soporte
  {
    category: 'Soporte',
    question: '¿Cómo contacto a soporte?',
    answer: 'Puedes contactarnos por email a soporte@luxprofile.mx o a través del formulario de contacto. Los usuarios VIP tienen acceso a soporte prioritario con respuesta en menos de 24 horas.',
  },
  {
    category: 'Soporte',
    question: '¿Tienen app móvil?',
    answer: 'Actualmente LuxProfile MX es una web app responsive que funciona perfectamente en cualquier dispositivo móvil. En futuras actualizaciones consideraremos lanzar apps nativas para iOS y Android.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFaqs = selectedCategory === 'Todos' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

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
            <HelpCircle className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-dark-900">Preguntas Frecuentes</h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <div className="card-elevated p-6 mb-8 text-center">
          <p className="text-dark-700">
            Encuentra respuestas rápidas a las preguntas más comunes sobre LuxProfile MX. 
            Si no encuentras lo que buscas, no dudes en <Link href="mailto:soporte@luxprofile.mx" className="text-brand-600 hover:text-brand-700 font-medium">contactarnos</Link>.
          </p>
        </div>

        {/* Filtro por categoría */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  selectedCategory === category
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-dark-700 border border-dark-200 hover:border-brand-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="card-elevated overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-dark-50 transition"
              >
                <div className="flex-1 pr-4">
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-dark-900 mt-1">
                    {faq.question}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-dark-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 pt-2 border-t border-dark-100 animate-fade-in">
                  <p className="text-dark-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contacto */}
        <div className="mt-12 card-elevated p-8 text-center">
          <HelpCircle className="w-12 h-12 text-brand-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-dark-900 mb-2">
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-dark-700 mb-6">
            Nuestro equipo de soporte está aquí para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:soporte@luxprofile.mx"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Enviar Email
            </a>
            <Link
              href="/dashboard/configuracion"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Ver Ayuda en Dashboard
            </Link>
          </div>
        </div>

        {/* Enlaces relacionados */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/legal/terminos" className="text-brand-600 hover:text-brand-700 font-medium">
            Términos y Condiciones
          </Link>
          <span className="text-dark-400">•</span>
          <Link href="/legal/privacidad" className="text-brand-600 hover:text-brand-700 font-medium">
            Política de Privacidad
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
