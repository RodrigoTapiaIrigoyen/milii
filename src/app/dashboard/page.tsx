'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Loader2, User as UserIcon, CreditCard, TrendingUp, Settings, Users, Heart, Search, Bell, MessageSquare, MessageCircle, Phone, Share2 } from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

interface User {
  id: string;
  email: string;
  role: string;
  accountType: 'profesional' | 'cliente';
}

interface Profile {
  _id: string;
  name: string;
  status: {
    isActive: boolean;
  };
  stats: {
    views: number;
    whatsappClicks: number;
    favorites: number;
  };
  isPublished: boolean;
  photos: string[];
}

interface Subscription {
  _id: string;
  plan: 'free' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  endDate: string;
}

interface WeeklyStats {
  totalViews: number;
  totalClicks: number;
  totalFavorites: number;
  conversionRate: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Verificar autenticación
      const resUser = await fetch('/api/auth/me');
      if (!resUser.ok) {
        router.push('/login');
        return;
      }
      const dataUser = await resUser.json();
      setUser(dataUser.user);

      // Solo cargar perfil y suscripción para profesionales
      if (dataUser.user.accountType === 'profesional') {
        // Cargar perfil
        try {
          const resProfile = await fetch('/api/profiles/my-profile');
          if (resProfile.ok) {
            const dataProfile = await resProfile.json();
            setProfile(dataProfile.profile);
          }
        } catch (error) {
          console.log('No tiene perfil creado');
        }

        // Cargar suscripción
        try {
          const resSub = await fetch('/api/subscriptions');
          if (resSub.ok) {
            const dataSub = await resSub.json();
            setSubscription(dataSub.subscription);
          }
        } catch (error) {
          console.log('No tiene suscripción');
        }

        // Cargar analytics de los últimos 7 días
        try {
          const resAnalytics = await fetch('/api/analytics/profile?days=7');
          if (resAnalytics.ok) {
            const dataAnalytics = await resAnalytics.json();
            if (dataAnalytics.summary) {
              setWeeklyStats({
                totalViews: dataAnalytics.summary.totalViews,
                totalClicks: dataAnalytics.summary.totalClicks,
                totalFavorites: dataAnalytics.summary.totalFavorites,
                conversionRate: dataAnalytics.summary.conversionRate,
              });
            }
          }
        } catch (error) {
          console.log('Error al cargar analytics semanales');
        }
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      published: 'Publicado',
      draft: 'Borrador',
      suspended: 'Suspendido',
      active: 'Activa',
      expired: 'Expirada',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Placer<span className="text-brand-500">Lux</span>
          </Link>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition"
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </Link>
            )}
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-dark-600 hover:text-dark-900 transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-dark-600">
            {user?.email}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
              {user?.accountType === 'profesional' ? 'Cuenta Profesional' : 'Cuenta Cliente'}
            </span>
          </p>
        </div>

        {user?.accountType === 'profesional' ? (
          <>
            {/* === DASHBOARD PROFESIONAL === */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Tarjeta de Perfil */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon className="w-6 h-6 text-brand-500" />
                  <h2 className="text-lg font-bold text-dark-900">Mi Perfil</h2>
                </div>
                {profile ? (
                  <div className="space-y-2">
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Nombre:</span> {profile.name}
                    </p>
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Estado:</span>{' '}
                      {getStatusBadge(profile.isPublished ? 'published' : 'draft')}
                    </p>
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Fotos:</span> {profile.photos.length}
                    </p>
                    <Link
                      href="/dashboard/perfil"
                      className="btn-primary w-full mt-4 block text-center"
                    >
                      Editar Perfil
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-dark-600 mb-4">No tienes un perfil creado</p>
                    <Link
                      href="/dashboard/perfil/crear"
                      className="btn-primary w-full block text-center"
                    >
                      Crear Perfil
                    </Link>
                  </div>
                )}
              </div>

              {/* Tarjeta de Suscripción */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-brand-500" />
                  <h2 className="text-lg font-bold text-dark-900">Suscripción</h2>
                </div>
                {subscription ? (
                  <div className="space-y-2">
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Plan:</span>{' '}
                      <span className="uppercase font-bold text-brand-500">{subscription.plan}</span>
                    </p>
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Estado:</span> {getStatusBadge(subscription.status)}
                    </p>
                    <p className="text-sm text-dark-600">
                      <span className="font-medium">Vence:</span>{' '}
                      {new Date(subscription.endDate).toLocaleDateString('es-MX')}
                    </p>
                    <Link
                      href="/dashboard/suscripcion"
                      className="btn-primary w-full mt-4 block text-center"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-dark-600 mb-4">No tienes suscripción activa</p>
                    <Link
                      href="/dashboard/planes"
                      className="btn-primary w-full block text-center"
                    >
                      Ver Planes
                    </Link>
                  </div>
                )}
              </div>

              {/* Tarjeta de Estadísticas */}
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-brand-500" />
                    <h2 className="text-lg font-bold text-dark-900">Esta semana</h2>
                  </div>
                  <Link href="/dashboard/analiticas" className="text-xs text-brand-500 hover:underline font-medium">
                    Ver detalle →
                  </Link>
                </div>
                {profile ? (
                  weeklyStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-600">Vistas</span>
                        <span className="text-xl font-bold text-blue-600">{weeklyStats.totalViews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-sm text-dark-600">Contactos WA</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{weeklyStats.totalClicks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-600">Favoritos</span>
                        <span className="text-xl font-bold text-red-500">{weeklyStats.totalFavorites}</span>
                      </div>
                      {/* Tasa de conversión */}
                      <div className="mt-3 pt-3 border-t border-dark-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-dark-500">Tasa de contacto</span>
                          <span className={`text-sm font-bold ${
                            weeklyStats.conversionRate >= 10 ? 'text-green-600' :
                            weeklyStats.conversionRate >= 5 ? 'text-amber-600' :
                            'text-dark-500'
                          }`}>
                            {weeklyStats.conversionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-dark-100 rounded-full h-1.5 mt-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              weeklyStats.conversionRate >= 10 ? 'bg-green-500' :
                              weeklyStats.conversionRate >= 5 ? 'bg-amber-500' :
                              'bg-dark-300'
                            }`}
                            style={{ width: `${Math.min(weeklyStats.conversionRate * 5, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-dark-500 mt-1.5">
                          {weeklyStats.totalClicks} de {weeklyStats.totalViews} visitas contactaron
                        </p>
                      </div>
                      {/* Upsell para plan Free con actividad */}
                      {(!subscription || subscription.plan === 'free') && weeklyStats.totalViews > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 font-medium">
                            💡 Con Premium aparecerías primero en búsquedas y recibirías más contactos.
                          </p>
                          <Link href="/dashboard/planes" className="text-xs text-amber-700 underline font-semibold">
                            Ver planes →
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-600">Vistas totales</span>
                        <span className="text-xl font-bold text-brand-500">{profile.stats.views}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-600">Clics WhatsApp</span>
                        <span className="text-xl font-bold text-green-600">{profile.stats.whatsappClicks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-600">Favoritos</span>
                        <span className="text-xl font-bold text-red-500">{profile.stats.favorites}</span>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-dark-600">Crea tu perfil para ver estadísticas</p>
                )}
              </div>
            </div>

            {/* Acciones Rápidas - Profesional */}
            <div className="card-elevated p-6">
              <h2 className="text-xl font-bold text-dark-900 mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Link href="/dashboard/perfil" className="card p-4 hover:shadow-lg transition text-center">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Editar Perfil</p>
                </Link>
                <Link href="/dashboard/analiticas" className="card p-4 hover:shadow-lg transition text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-luxury-500" />
                  <p className="font-medium text-dark-900 text-sm">Analíticas</p>
                </Link>
                <Link href="/perfiles" className="card p-4 hover:shadow-lg transition text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Explorar Perfiles</p>
                </Link>
                <Link href="/dashboard/favoritos" className="card p-4 hover:shadow-lg transition text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="font-medium text-dark-900 text-sm">Mis Favoritos</p>
                </Link>
                <Link href="/dashboard/planes" className="card p-4 hover:shadow-lg transition text-center">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Planes</p>
                </Link>
                <Link href="/dashboard/configuracion" className="card p-4 hover:shadow-lg transition text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Configuración</p>
                </Link>
                <Link href="/dashboard/soporte" className="card p-4 hover:shadow-lg transition text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-dark-900 text-sm">Soporte</p>
                </Link>
                <Link href="/dashboard/referidos" className="card p-4 hover:shadow-lg transition text-center">
                  <Share2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium text-dark-900 text-sm">Referidos</p>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* === DASHBOARD CLIENTE === */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Explorar Perfiles */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-6 h-6 text-brand-500" />
                  <h2 className="text-lg font-bold text-dark-900">Explorar</h2>
                </div>
                <p className="text-sm text-dark-600 mb-4">
                  Descubre profesionales y los servicios que ofrecen.
                </p>
                <Link
                  href="/perfiles"
                  className="btn-primary w-full block text-center"
                >
                  Ver Perfiles
                </Link>
              </div>

              {/* Mis Favoritos */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-red-500" />
                  <h2 className="text-lg font-bold text-dark-900">Mis Favoritos</h2>
                </div>
                <p className="text-sm text-dark-600 mb-4">
                  Revisa los perfiles que has guardado como favoritos.
                </p>
                <Link
                  href="/dashboard/favoritos"
                  className="btn-primary w-full block text-center"
                >
                  Ver Favoritos
                </Link>
              </div>

              {/* Mis Reseñas */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-brand-500" />
                  <h2 className="text-lg font-bold text-dark-900">Mis Reseñas</h2>
                </div>
                <p className="text-sm text-dark-600 mb-4">
                  Deja reseñas y calificaciones a los profesionales.
                </p>
                <Link
                  href="/perfiles"
                  className="btn-primary w-full block text-center"
                >
                  Escribir Reseña
                </Link>
              </div>
            </div>

            {/* Acciones Rápidas - Cliente */}
            <div className="card-elevated p-6">
              <h2 className="text-xl font-bold text-dark-900 mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/perfiles" className="card p-4 hover:shadow-lg transition text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Explorar Perfiles</p>
                </Link>
                <Link href="/dashboard/favoritos" className="card p-4 hover:shadow-lg transition text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="font-medium text-dark-900 text-sm">Mis Favoritos</p>
                </Link>
                <Link href="/dashboard/notificaciones" className="card p-4 hover:shadow-lg transition text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-luxury-500" />
                  <p className="font-medium text-dark-900 text-sm">Notificaciones</p>
                </Link>
                <Link href="/dashboard/configuracion" className="card p-4 hover:shadow-lg transition text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-medium text-dark-900 text-sm">Configuración</p>
                </Link>
                <Link href="/dashboard/referidos" className="card p-4 hover:shadow-lg transition text-center">
                  <Share2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium text-dark-900 text-sm">Referidos</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
