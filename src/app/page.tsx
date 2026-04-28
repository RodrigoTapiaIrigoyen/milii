import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  BadgeCheck,
  Sparkles,
  MapPin,
  DollarSign,
  ShieldCheck,
  Users,
  Star,
  Heart,
  Check,
  Crown,
  Zap,
  LayoutDashboard,
  TrendingUp,
  Lock,
  Clock,
  Smartphone,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { verifyToken } from '@/lib/auth';
import LogoutButton from '@/components/shared/LogoutButton';

// Obtener perfiles destacados directamente de la DB (sin HTTP round-trip)
async function getFeaturedProfiles() {
  try {
    await connectDB();
    const profiles = await Profile.find({
      isPublished: true,
      'verification.isVerified': true,
      'status.isActive': true,
    })
      .select('name age whatsapp location photos pricing services description stats')
      .sort({ 'stats.views': -1, createdAt: -1 })
      .limit(6)
      .lean();
    return profiles || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

export default async function Home() {
  const profiles = await getFeaturedProfiles();

  // Detectar sesión desde la cookie HTTP-only
  const cookieStore = cookies();
  const token = cookieStore.get('luxprofile-token')?.value;
  let isLoggedIn = false;
  let userRole: string | null = null;
  if (token) {
    const payload = await verifyToken(token) as any;
    if (payload?.userId) {
      isLoggedIn = true;
      userRole = payload.role || 'user';
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-dark-700/15 blur-3xl animate-float-slow" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <nav className="flex items-center justify-between py-6 animate-fade-in">
          <div className="font-display text-2xl font-bold tracking-tight text-dark-900">
            Lux<span className="text-brand-600">Profile MX</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/perfiles" className="text-dark-700 hover:text-brand-600 font-medium transition">
              Explorar
            </Link>
            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Link href="/admin" className="text-dark-700 hover:text-brand-600 font-medium transition hidden sm:inline">
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Mi Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary px-4 py-2 text-sm">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero compacto y directo */}
        <section className="pt-12 pb-10 text-center animate-rise-in">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-700 glass-panel">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            Perfiles verificados
          </p>
          <h1 className="mt-5 mx-auto max-w-4xl font-display text-5xl font-semibold leading-tight text-dark-900 md:text-6xl lg:text-7xl">
            Descubre profesionales
            <span className="gradient-brand bg-clip-text text-transparent"> disponibles ahora</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-dark-700">
            Masajes, acompañamiento a eventos y servicios personalizados con precios transparentes
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="#perfiles" className="btn-primary gap-2 px-8 py-3">
              Ver perfiles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={isLoggedIn ? '/dashboard' : '/register'} className="btn-secondary px-8 py-3">
              {isLoggedIn ? 'Ir a mi Dashboard' : 'Publicar mi perfil'}
            </Link>
          </div>
        </section>

        {/* ===== SECCIÓN PRINCIPAL: PERFILES DESTACADOS ===== */}
        {profiles.length > 0 && (
          <section id="perfiles" className="mt-16 animate-rise-in [animation-delay:150ms]">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl font-semibold text-dark-900 md:text-4xl">
                  Perfiles disponibles ahora
                </h2>
                <p className="mt-2 text-dark-600">Profesionales verificadas con servicios reales</p>
              </div>
              <Link 
                href="/perfiles" 
                className="hidden md:flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile: any) => (
                <Link 
                  key={profile._id} 
                  href={`/perfiles/${profile._id}`}
                  className="card group overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  {/* Imagen principal */}
                  <div className="relative h-80 w-full overflow-hidden bg-dark-100">
                    {profile.photos && profile.photos.length > 0 ? (
                      <Image
                        src={profile.photos[0]}
                        alt={profile.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                        <Users className="h-20 w-20 text-brand-400" />
                      </div>
                    )}
                    
                    {/* Badge verificado */}
                    {profile.isVerified && (
                      <div className="absolute right-3 top-3 rounded-full bg-green-500 p-2 shadow-lg">
                        <BadgeCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Información */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-dark-900 group-hover:text-brand-600 transition">
                          {profile.name}
                        </h3>
                        {profile.age && (
                          <p className="text-sm text-dark-600 mt-0.5">{profile.age} años</p>
                        )}
                      </div>
                      {profile.stats?.views > 0 && (
                        <div className="flex items-center gap-1.5 glass-panel px-2.5 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium text-dark-700">{profile.stats.views}</span>
                        </div>
                      )}
                    </div>

                    {/* Ubicación */}
                    {profile.location && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-dark-600">
                        <MapPin className="h-4 w-4 text-brand-600 flex-shrink-0" />
                        <span className="truncate">
                          {profile.location.city}, {profile.location.state}
                        </span>
                      </div>
                    )}

                    {/* Servicios */}
                    {profile.services && profile.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile.services.slice(0, 3).map((service: string, idx: number) => (
                          <span 
                            key={idx}
                            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                          >
                            {service}
                          </span>
                        ))}
                        {profile.services.length > 3 && (
                          <span className="rounded-full bg-dark-100 px-3 py-1 text-xs font-medium text-dark-600">
                            +{profile.services.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    {/* Precio */}
                    {profile.pricing && (
                      <div className="mt-4 flex items-center justify-between border-t border-dark-100 pt-4">
                        <span className="text-sm text-dark-600">Desde</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-5 w-5 text-brand-600" />
                          <span className="font-display text-2xl font-semibold text-dark-900">
                            {profile.pricing.hourlyRate || profile.pricing.serviceRate}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-dark-100">
                      <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700 flex items-center gap-2 transition">
                        Ver perfil completo
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Botón ver más (móvil) */}
            <div className="mt-8 text-center md:hidden">
              <Link href="/perfiles" className="btn-primary gap-2">
                Ver todos los perfiles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ===== SECCIÓN: ¿ERES PROFESIONAL? ===== */}
        <section className="mt-24 animate-rise-in [animation-delay:220ms]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-8 py-14 md:px-14 md:py-16">
            {/* Decoración de fondo */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
              {/* Columna izquierda: texto */}
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Para profesionales
                </p>
                <h2 className="mt-5 font-display text-4xl font-bold text-white leading-tight md:text-5xl">
                  Publica tu perfil y{' '}
                  <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                    recibe clientes hoy
                  </span>
                </h2>
                <p className="mt-5 text-lg text-gray-300 leading-relaxed">
                  Miles de clientes buscan profesionales en tu ciudad. Crea tu perfil en 5 minutos, <strong className="text-white">empieza gratis</strong> y cobra el 100% de tus servicios — sin comisiones.
                </p>

                {/* Puntos clave */}
                <ul className="mt-8 space-y-4">
                  {[
                    { icon: Clock, text: 'Perfil publicado en menos de 5 minutos' },
                    { icon: TrendingUp, text: 'Aparece en búsquedas de Google de tu ciudad' },
                    { icon: Lock, text: 'Tu privacidad protegida — tú controlas qué se muestra' },
                    { icon: Smartphone, text: 'Clientes te contactan directo por WhatsApp o Telegram' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-brand-500/20 p-2">
                        <Icon className="h-5 w-5 text-brand-400" />
                      </div>
                      <span className="text-gray-200 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href="/publicar"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 font-bold text-white shadow-xl shadow-brand-500/30 hover:from-brand-400 hover:to-brand-500 transition-all hover:scale-105"
                  >
                    Publicar mi perfil gratis
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/publicar#precios"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    Ver planes y precios
                  </Link>
                </div>
              </div>

              {/* Columna derecha: métricas / prueba social */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '100%', label: 'De tus ingresos, sin comisión', color: 'from-green-500/20 to-green-600/10', text: 'text-green-400' },
                  { value: '$0', label: 'Para empezar, gratis 7 días', color: 'from-brand-500/20 to-brand-600/10', text: 'text-brand-400' },
                  { value: '5 min', label: 'Para tener tu perfil activo', color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400' },
                  { value: '24/7', label: 'Clientes te ven toda la semana', color: 'from-yellow-500/20 to-yellow-600/10', text: 'text-yellow-400' },
                ].map(({ value, label, color, text }) => (
                  <div
                    key={label}
                    className={`rounded-2xl bg-gradient-to-br ${color} border border-white/10 p-6 backdrop-blur-sm`}
                  >
                    <p className={`font-display text-4xl font-bold ${text}`}>{value}</p>
                    <p className="mt-2 text-sm text-gray-300 leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN DE PLANES Y PRECIOS ===== */}
        <section className="mt-24 animate-rise-in [animation-delay:280ms]">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dark-500">¿Eres profesional?</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-dark-900 md:text-4xl">
              Planes para publicar tu perfil
            </h2>
            <p className="mt-3 text-dark-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades y empieza a recibir clientes hoy
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Plan Free */}
            <div className="card p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                  <Sparkles className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-dark-900">Free</h3>
                  <p className="text-sm text-dark-600">Prueba sin costo</p>
                </div>
              </div>

              <div className="mt-6 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-dark-900">$0</span>
                </div>
                <p className="text-sm text-dark-500 mt-1">7 días de prueba</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Perfil básico',
                  'Hasta 3 fotos',
                  'Duración 7 días',
                  'Soporte por email',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-dark-700">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-secondary w-full justify-center">
                Comenzar gratis
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="card p-6 border-2 border-brand-400 relative hover:shadow-2xl transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">
                Más popular
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-dark-900">Premium</h3>
                  <p className="text-sm text-brand-600 font-medium">Recomendado</p>
                </div>
              </div>

              <div className="mt-6 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-dark-900">$99</span>
                  <span className="text-dark-600">/mes</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Perfil destacado',
                  'Hasta 10 fotos',
                  'Sin marca de agua',
                  'Verificación rápida',
                  'Estadísticas 30 días',
                  'Soporte prioritario',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-dark-700">
                    <Check className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-primary w-full justify-center">
                Elegir Premium
              </Link>
            </div>

            {/* Plan VIP */}
            <div className="card p-6 bg-gradient-to-br from-dark-900 to-dark-800 text-white hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">VIP</h3>
                  <p className="text-sm text-yellow-400 font-medium">Máxima visibilidad</p>
                </div>
              </div>

              <div className="mt-6 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold">$199</span>
                  <span className="text-gray-400">/mes</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Todo lo de Premium',
                  'Fotos ilimitadas',
                  'Badge VIP dorado',
                  'Siempre en top 3',
                  'Estadísticas 90 días',
                  'Soporte exclusivo',
                  'Verificación inmediata',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-100">
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark-900 font-semibold px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Elegir VIP
              </Link>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-12 glass-panel rounded-3xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <ShieldCheck className="h-10 w-10 text-brand-600 mx-auto mb-3" />
                <h4 className="font-semibold text-dark-900 mb-2">Pagos seguros</h4>
                <p className="text-sm text-dark-600">
                  Procesamos tus pagos de forma segura con encriptación bancaria
                </p>
              </div>
              <div>
                <BadgeCheck className="h-10 w-10 text-brand-600 mx-auto mb-3" />
                <h4 className="font-semibold text-dark-900 mb-2">Verificación incluida</h4>
                <p className="text-sm text-dark-600">
                  Verificamos tu identidad para generar confianza en tus clientes
                </p>
              </div>
              <div>
                <Users className="h-10 w-10 text-brand-600 mx-auto mb-3" />
                <h4 className="font-semibold text-dark-900 mb-2">Sin comisiones</h4>
                <p className="text-sm text-dark-600">
                  No cobramos comisión por tus servicios, tú recibes el 100%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="mt-20 animate-rise-in [animation-delay:380ms]">
          <div className="glass-panel rounded-3xl p-8 md:flex md:items-center md:justify-between md:p-10">
            <div>
              <h4 className="max-w-xl font-display text-3xl font-semibold text-dark-900">
                ¿Lista para empezar a generar ingresos?
              </h4>
              <p className="mt-3 max-w-xl text-dark-600">
                Únete a LuxProfile MX y publica tu perfil en menos de 5 minutos. Sin permanencia, cancela cuando quieras.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
              <Link href="/register" className="btn-primary gap-2 px-8 py-3">
                Crear mi perfil gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/perfiles" className="btn-secondary px-8 py-3">
                Ver más perfiles
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-dark-200/70 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-dark-700 font-medium mb-4">
              LuxProfile MX - Plataforma profesional para servicios personales verificados en México
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-dark-600 mb-6">
              <Link href="/legal/terminos" className="hover:text-brand-600 transition">
                Términos y Condiciones
              </Link>
              <span>•</span>
              <Link href="/legal/privacidad" className="hover:text-brand-600 transition">
                Política de Privacidad
              </Link>
              <span>•</span>
              <Link href="/legal/faq" className="hover:text-brand-600 transition">
                Preguntas Frecuentes
              </Link>
              <span>•</span>
              <a href="mailto:soporte@luxprofile.mx" className="hover:text-brand-600 transition">
                Contacto
              </a>
            </div>
            <p className="text-xs text-dark-500">
              © {new Date().getFullYear()} LuxProfile MX. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
