import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Crown,
  DollarSign,
  Eye,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Publica tu perfil — Llega a miles de clientes en México',
  description:
    'Crea tu perfil en LuxProfile MX y empieza a recibir clientes hoy. Gratis los primeros 7 días. Sin comisiones. Tu privacidad protegida. CDMX, Guadalajara, Monterrey y todo México.',
};

const STEPS = [
  {
    number: '01',
    title: 'Crea tu cuenta gratis',
    description:
      'Regístrate con tu correo en menos de 2 minutos. No necesitas tarjeta de crédito para empezar.',
  },
  {
    number: '02',
    title: 'Arma tu perfil',
    description:
      'Sube tus fotos, describe tus servicios y pon tu precio. Tú controlas exactamente qué información es visible.',
  },
  {
    number: '03',
    title: 'Aprobación rápida',
    description:
      'Nuestro equipo revisa tu perfil en menos de 24 horas para garantizar que solo hay perfiles reales en la plataforma.',
  },
  {
    number: '04',
    title: 'Clientes te contactan',
    description:
      'Apareces en búsquedas de Google y en nuestra plataforma. Los clientes te escriben directo a WhatsApp o Telegram.',
  },
];

const BENEFITS = [
  {
    icon: DollarSign,
    title: '0% de comisión',
    description:
      'Cobras el 100% de tus servicios. Nosotros ganamos con la suscripción, no tomando parte de tu trabajo.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: Lock,
    title: 'Tu privacidad primero',
    description:
      'Tú decides qué mostrar. Puedes usar nombre artístico y controlar qué fotos subes. Nadie ve tu email ni datos personales.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Aparece en Google',
    description:
      'Tu perfil tiene URL propia y está optimizado para buscadores. Clientes te encuentran en Google sin que hagas nada extra.',
    color: 'bg-brand-500/10 text-brand-500',
  },
  {
    icon: ShieldCheck,
    title: 'Plataforma segura',
    description:
      'Verificamos a todos los usuarios. Puedes reportar clientes problemáticos y tenemos soporte dedicado.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Smartphone,
    title: 'Estadísticas reales',
    description:
      'Ve cuántas personas vieron tu perfil, cuántos te contactaron por WhatsApp y cuál es tu tasa de conversión semanal.',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: Clock,
    title: 'Sin permanencia',
    description:
      'Cancela cuando quieras, sin penalizaciones. Puedes pausar tu perfil si te tomas vacaciones y reactivarlo al volver.',
    color: 'bg-pink-500/10 text-pink-500',
  },
];

const FAQS = [
  {
    q: '¿Mis datos personales son visibles para los clientes?',
    a: 'No. Los clientes ven únicamente lo que tú publicas: tu nombre artístico, fotos, servicios y precio. Tu correo, apellidos y datos reales nunca son visibles.',
  },
  {
    q: '¿Puedo cancelar mi suscripción en cualquier momento?',
    a: 'Sí, sin penalización ni burocracia. Cancelas desde tu dashboard y tu suscripción se mantiene activa hasta el final del período pagado.',
  },
  {
    q: '¿Cobran comisión por cada servicio?',
    a: 'Nunca. Solo pagas tu plan mensual. Todo lo que ganas con tus clientes es 100% tuyo.',
  },
  {
    q: '¿Cuánto tarda en aparecer mi perfil?',
    a: 'Revisamos los perfiles en menos de 24 horas. Una vez aprobado, aparece inmediatamente en la plataforma y en Google en pocos días.',
  },
  {
    q: '¿Los clientes me contactan dentro de la plataforma o por WhatsApp?',
    a: 'Directo a tu WhatsApp o Telegram — tú decides cuál mostrar. Sin intermediarios, sin mensajes que "quizás lleguen".',
  },
  {
    q: '¿Puedo usar un nombre artístico?',
    a: 'Sí, el nombre que aparece en tu perfil lo decides tú. Nunca pedimos que uses tu nombre real públicamente.',
  },
  {
    q: '¿Qué pasa si un cliente me falta al respeto?',
    a: 'Puedes reportarlo desde la plataforma. Revisamos cada reporte y bloqueamos a usuarios que incumplan las reglas de conducta.',
  },
  {
    q: '¿Puedo tener más de un perfil?',
    a: 'Por el momento solo se permite un perfil por cuenta, pero puedes actualizarlo y editarlo en cualquier momento desde tu dashboard.',
  },
  {
    q: '¿Necesito verificarme para publicar?',
    a: 'La verificación de identidad es opcional, pero recomendada. Los perfiles verificados generan más confianza en los clientes y aparecen con un badge especial.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Valentina M.',
    city: 'CDMX',
    plan: 'Premium',
    stars: 5,
    text: 'En las primeras dos semanas ya tenía clientes contactándome. Lo que más me gustó es que yo controlo todo: mis fotos, mi precio, mi disponibilidad. Sin intermediarios.',
  },
  {
    name: 'Sofía R.',
    city: 'Guadalajara',
    plan: 'VIP',
    stars: 5,
    text: 'Probé otras plataformas que te cobran comisión por cada cita. Aquí pago una vez al mes y el resto es mío. La diferencia en ingresos es enorme.',
  },
  {
    name: 'Camila T.',
    city: 'Monterrey',
    plan: 'Premium',
    stars: 5,
    text: 'Lo que más me importaba era la privacidad. Uso nombre artístico, mis datos no aparecen y los clientes me escriben a un número de WhatsApp que yo decidí poner. Perfecto.',
  },
];

const CITIES = [
  'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
  'León', 'Cancún', 'Mérida', 'Querétaro', 'San Luis Potosí',
  'Aguascalientes', 'Hermosillo', 'Chihuahua', 'Culiacán', 'Veracruz',
  'Acapulco', 'Morelia', 'Toluca', 'Saltillo', 'Mexicali',
];

export default function PublicarPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-40 border-b border-dark-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold text-dark-900">
            Lux<span className="text-brand-600">Profile MX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-dark-600 hover:text-dark-900 transition sm:block">
              Ya tengo cuenta
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:from-brand-400 hover:to-brand-500 transition-all hover:scale-105"
            >
              Crear perfil gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-6 py-20 md:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma para profesionales independientes
          </p>

          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Más clientes.{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Más ingresos.
            </span>
            <br />
            100% tuyo.
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-xl text-gray-300 leading-relaxed">
            Publica tu perfil en LuxProfile MX y llega a miles de clientes que buscan profesionales en tu ciudad — sin comisiones, con tu privacidad protegida.
          </p>

          {/* Métricas rápidas */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-center">
            {[
              { value: '$0', label: 'para empezar' },
              { value: '0%', label: 'de comisión' },
              { value: '5 min', label: 'para publicar' },
              { value: '24/7', label: 'visibilidad' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="font-display text-3xl font-bold text-white">{value}</span>
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-brand-500/40 hover:from-brand-400 hover:to-brand-500 transition-all hover:scale-105"
            >
              Publicar mi perfil gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-10 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              ¿Cómo funciona?
              <ChevronDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA ─── */}
      <section id="como-funciona" className="bg-dark-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Proceso</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-dark-900">
              De cero a clientes en 4 pasos
            </h2>
            <p className="mt-3 text-lg text-dark-600">Sin complicaciones, sin burocracia.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl bg-white p-7 shadow-sm border border-dark-100 hover:shadow-md transition-shadow"
              >
                <p className="font-display text-5xl font-bold text-brand-100">{step.number}</p>
                <h3 className="mt-3 font-display text-lg font-bold text-dark-900">{step.title}</h3>
                <p className="mt-2 text-sm text-dark-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFICIOS ─── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">¿Por qué LuxProfile?</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-dark-900">
              Diseñado pensando en ti
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-3xl border border-dark-100 p-7 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex rounded-2xl p-3 ${b.color}`}>
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-dark-900">{b.title}</h3>
                <p className="mt-2 text-sm text-dark-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARATIVA ─── */}
      <section className="bg-dark-900 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Comparativa</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">
              ¿Por qué no publicar en redes sociales o clasificados?
            </h2>
            <p className="mt-3 text-lg text-gray-400">
              No todas las opciones protegen tu privacidad ni te dan visibilidad real.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-left text-gray-400 font-medium">Característica</th>
                  <th className="pb-4 text-center">
                    <span className="inline-block rounded-xl bg-brand-500/20 px-4 py-1.5 font-bold text-brand-300">
                      LuxProfile MX
                    </span>
                  </th>
                  <th className="pb-4 text-center text-gray-500 font-medium">Redes sociales</th>
                  <th className="pb-4 text-center text-gray-500 font-medium">Clasificados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Perfil indexado en Google', true, false, 'parcial'],
                  ['0% comisión por servicio', true, true, 'parcial'],
                  ['Privacidad de datos reales', true, false, false],
                  ['Estadísticas de visitas y contactos', true, false, false],
                  ['Soporte ante clientes problemáticos', true, false, false],
                  ['Perfil activo 24/7 sin publicar stories', true, false, false],
                  ['Aprobación y moderación de perfiles', true, false, false],
                  ['Sin riesgo de baneo de cuenta', true, false, true],
                ].map(([feature, lux, social, clasif]) => (
                  <tr key={String(feature)} className="group">
                    <td className="py-4 text-gray-300 font-medium group-hover:text-white transition">{feature}</td>
                    <td className="py-4 text-center">
                      {lux === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-400" />
                      ) : lux === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      ) : (
                        <span className="text-yellow-400 text-xs font-semibold">Parcial</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {social === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-400" />
                      ) : social === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500 opacity-60" />
                      ) : (
                        <span className="text-yellow-400 text-xs font-semibold">Parcial</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {clasif === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-400" />
                      ) : clasif === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500 opacity-60" />
                      ) : (
                        <span className="text-yellow-400 text-xs font-semibold">Parcial</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 font-bold text-white shadow-xl hover:from-brand-400 hover:to-brand-500 transition-all hover:scale-105"
            >
              Empezar gratis ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PLANES ─── */}
      <section id="precios" className="bg-dark-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Precios</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-dark-900">
              Empieza gratis, crece cuando quieras
            </h2>
            <p className="mt-3 text-lg text-dark-600">
              Sin contratos. Sin permanencia. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-3xl bg-white p-8 border border-dark-200 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-dark-900">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-dark-900">$0</span>
              </div>
              <p className="mt-1 text-sm text-dark-500">7 días de prueba</p>
              <ul className="mt-8 space-y-3">
                {['Perfil básico', 'Hasta 3 fotos', 'Contacto directo por WhatsApp', 'Estadísticas básicas'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dark-700">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center rounded-2xl border-2 border-dark-200 px-6 py-3.5 font-semibold text-dark-900 hover:border-brand-400 hover:text-brand-600 transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Premium — destacado */}
            <div className="relative rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-8 shadow-2xl shadow-brand-500/30">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1 text-xs font-bold text-brand-600 shadow">
                MÁS POPULAR
              </div>
              <h3 className="font-display text-2xl font-bold text-white">Premium</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-white">$99</span>
                <span className="text-brand-200">/mes</span>
              </div>
              <p className="mt-1 text-sm text-brand-200">30 días de visibilidad máxima</p>
              <ul className="mt-8 space-y-3">
                {[
                  'Todo lo del plan Free',
                  'Hasta 10 fotos',
                  'Sin marca de agua',
                  'Apareces primero en búsquedas',
                  'Badge verificada',
                  'Estadísticas 30 días',
                  'Soporte prioritario',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <Check className="h-4 w-4 shrink-0 text-white" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3.5 font-bold text-brand-600 hover:bg-brand-50 transition-colors shadow-lg"
              >
                Elegir Premium
              </Link>
            </div>

            {/* VIP */}
            <div className="rounded-3xl bg-dark-900 p-8 border border-dark-700 shadow-sm">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <h3 className="font-display text-2xl font-bold text-white">VIP</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-white">$199</span>
                <span className="text-gray-400">/mes</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">Máxima visibilidad garantizada</p>
              <ul className="mt-8 space-y-3">
                {[
                  'Todo lo de Premium',
                  'Fotos ilimitadas',
                  'Badge VIP dorado',
                  'Top 3 garantizado siempre',
                  'Estadísticas 90 días',
                  'Verificación inmediata',
                  'Soporte exclusivo 24/7',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-200">
                    <Zap className="h-4 w-4 shrink-0 text-yellow-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-3.5 font-bold text-dark-900 hover:from-yellow-300 hover:to-yellow-400 transition-colors shadow-lg"
              >
                Elegir VIP
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: ShieldCheck, label: 'Pagos seguros con MercadoPago' },
              { icon: Lock, label: 'Datos cifrados y protegidos' },
              { icon: BadgeCheck, label: 'Sin comisiones por servicio' },
              { icon: Users, label: 'Soporte real en español' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center text-sm font-medium text-dark-700 border border-dark-100"
              >
                <Icon className="h-6 w-6 text-brand-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Testimonios</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-dark-900">
              Lo que dicen las profesionales
            </h2>
            <p className="mt-3 text-lg text-dark-600">
              Reales. Sin scripts. Sin promesas exageradas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl border border-dark-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Estrellas */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-700 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-dark-100">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-900 text-sm">{t.name}</p>
                    <p className="text-xs text-dark-500">{t.city} · Plan {t.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CIUDADES ─── */}
      <section className="bg-dark-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Cobertura nacional</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-dark-900">
              Disponible en toda la República Mexicana
            </h2>
            <p className="mt-3 text-dark-600">
              Publica desde cualquier ciudad y llega a clientes locales que buscan perfiles cerca de ellos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-dark-700 hover:border-brand-400 hover:text-brand-700 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                {city}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 border border-brand-200">
              + tu ciudad
            </span>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-dark-900">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-dark-100 bg-white p-6 hover:border-brand-200 transition-colors"
              >
                <h3 className="font-semibold text-dark-900">{faq.q}</h3>
                <p className="mt-2 text-dark-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
            ¿Lista para empezar?
          </h2>
          <p className="mt-5 text-xl text-brand-100">
            Crea tu perfil gratis hoy. No necesitas tarjeta de crédito para los primeros 7 días.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-brand-600 shadow-xl hover:bg-brand-50 transition-all hover:scale-105"
            >
              Publicar mi perfil gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/perfiles"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Ver la plataforma
            </Link>
          </div>
          <p className="mt-6 text-sm text-brand-200">
            ¿Tienes dudas?{' '}
            <a href="mailto:soporte@luxprofile.mx" className="underline hover:text-white transition">
              Escríbenos a soporte@luxprofile.mx
            </a>
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-dark-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="font-display text-lg font-bold text-dark-900">
            Lux<span className="text-brand-600">Profile MX</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-5 text-sm text-dark-500">
            <Link href="/legal/terminos" className="hover:text-brand-600 transition">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-brand-600 transition">Privacidad</Link>
            <Link href="/legal/faq" className="hover:text-brand-600 transition">FAQ</Link>
            <a href="mailto:soporte@luxprofile.mx" className="hover:text-brand-600 transition">Contacto</a>
          </div>
          <p className="text-xs text-dark-400">© {new Date().getFullYear()} LuxProfile MX</p>
        </div>
      </footer>
    </div>
  );
}
