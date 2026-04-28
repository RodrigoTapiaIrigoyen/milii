'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Star,
  Crown,
} from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

interface Subscription {
  _id: string;
  plan: 'free' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

const PLAN_DETAILS = {
  free: {
    label: 'Free',
    price: '$0',
    color: 'gray',
    icon: null,
    features: ['Perfil básico', 'Hasta 3 fotos', 'Duración 7 días', '7 días de analíticas'],
    badgeClass: 'bg-gray-100 text-gray-700',
  },
  premium: {
    label: 'Premium',
    price: '$99/mes',
    color: 'blue',
    icon: Star,
    features: ['Perfil destacado', 'Hasta 10 fotos', 'Duración 30 días', '30 días de analíticas', 'Posición prioritaria'],
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  vip: {
    label: 'VIP',
    price: '$199/mes',
    color: 'yellow',
    icon: Crown,
    features: ['Perfil VIP (primero en resultados)', 'Fotos ilimitadas', 'Duración 30 días', '90 días de analíticas', 'Máxima visibilidad'],
    badgeClass: 'bg-yellow-100 text-yellow-700',
  },
};

export default function SuscripcionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [noSubscription, setNoSubscription] = useState(false);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) { router.push('/login'); return; }
      const authData = await authRes.json();
      if (authData.user.accountType !== 'profesional') { router.push('/dashboard'); return; }
    } catch { router.push('/login'); return; }
    fetchSubscription();
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      if (res.status === 404) {
        setNoSubscription(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error al cargar suscripción:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro que deseas cancelar tu suscripción? El plan seguirá activo hasta la fecha de vencimiento.')) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
      if (res.ok) {
        await fetchSubscription();
      } else {
        alert('Error al cancelar la suscripción');
      }
    } catch {
      alert('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, label: 'Activa', className: 'text-green-600 bg-green-50' };
      case 'expired':
        return { icon: XCircle, label: 'Expirada', className: 'text-red-600 bg-red-50' };
      case 'cancelled':
        return { icon: Clock, label: 'Cancelada', className: 'text-orange-600 bg-orange-50' };
      default:
        return { icon: AlertTriangle, label: status, className: 'text-gray-600 bg-gray-50' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-dark-700 hover:text-dark-900 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Mi Suscripción</span>
          </Link>
          <NotificationBell />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {noSubscription || !subscription ? (
          /* Sin suscripción */
          <div className="card-elevated p-8 text-center">
            <CreditCard className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark-900 mb-2">Sin suscripción activa</h2>
            <p className="text-dark-600 mb-6">
              Activa un plan para destacar tu perfil y acceder a más funciones.
            </p>
            <Link href="/dashboard/planes" className="btn-primary inline-block">
              Ver planes disponibles
            </Link>
          </div>
        ) : (
          <>
            {/* Plan actual */}
            {(() => {
              const plan = PLAN_DETAILS[subscription.plan];
              const status = getStatusInfo(subscription.status);
              const StatusIcon = status.icon;
              const PlanIcon = plan.icon;
              const days = daysRemaining(subscription.endDate);

              return (
                <>
                  <div className="card-elevated p-6">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                          {PlanIcon && <PlanIcon className={`w-6 h-6 ${subscription.plan === 'vip' ? 'text-yellow-500' : 'text-blue-500'}`} />}
                          Plan {plan.label}
                        </h1>
                        <p className="text-dark-500 mt-1">{plan.price}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    {/* Fechas */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-dark-50 rounded-xl p-4">
                        <p className="text-xs text-dark-500 mb-1">Fecha de inicio</p>
                        <p className="font-semibold text-dark-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-500" />
                          {formatDate(subscription.startDate)}
                        </p>
                      </div>
                      <div className="bg-dark-50 rounded-xl p-4">
                        <p className="text-xs text-dark-500 mb-1">
                          {subscription.status === 'cancelled' ? 'Acceso hasta' : 'Fecha de vencimiento'}
                        </p>
                        <p className="font-semibold text-dark-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-500" />
                          {formatDate(subscription.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* Días restantes */}
                    {subscription.status !== 'expired' && (
                      <div className={`rounded-xl p-4 mb-6 ${days <= 3 ? 'bg-red-50 border border-red-200' : days <= 7 ? 'bg-amber-50 border border-amber-200' : 'bg-brand-50 border border-brand-200'}`}>
                        <p className={`text-sm font-medium ${days <= 3 ? 'text-red-700' : days <= 7 ? 'text-amber-700' : 'text-brand-700'}`}>
                          {days === 0
                            ? 'Tu suscripción vence hoy'
                            : `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
                          {days <= 7 && days > 0 && ' — renueva pronto para no perder tu posición'}
                        </p>
                        {/* Barra de progreso */}
                        {subscription.plan !== 'free' && (
                          <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${days <= 3 ? 'bg-red-500' : days <= 7 ? 'bg-amber-500' : 'bg-brand-500'}`}
                              style={{ width: `${Math.min(100, (days / 30) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Características del plan */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-dark-700 mb-3">Incluye tu plan:</p>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-dark-700">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {subscription.plan !== 'vip' && subscription.status === 'active' && (
                        <Link
                          href="/dashboard/planes"
                          className="btn-primary flex-1 text-center flex items-center justify-center gap-2"
                        >
                          <Crown className="w-4 h-4" />
                          Mejorar plan
                        </Link>
                      )}
                      {subscription.status === 'active' && subscription.plan !== 'free' && (
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                        >
                          {cancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cancelar suscripción'}
                        </button>
                      )}
                      {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
                        <Link
                          href="/dashboard/planes"
                          className="btn-primary flex-1 text-center"
                        >
                          Renovar plan
                        </Link>
                      )}
                    </div>

                    {subscription.status === 'cancelled' && (
                      <p className="text-xs text-dark-500 mt-3 text-center">
                        Tu suscripción fue cancelada pero tendrás acceso hasta el {formatDate(subscription.endDate)}.
                      </p>
                    )}
                  </div>

                  {/* Upgrade cards si no es VIP */}
                  {subscription.plan !== 'vip' && (
                    <div>
                      <p className="text-sm font-semibold text-dark-600 mb-3">Planes disponibles</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {subscription.plan === 'free' && (
                          <Link href="/dashboard/planes" className="card-elevated p-5 flex items-center justify-between hover:shadow-lg transition group">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-dark-900">Premium</span>
                              </div>
                              <p className="text-sm text-dark-500">10 fotos · 30 días · $99/mes</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-brand-500 transition" />
                          </Link>
                        )}
                        <Link href="/dashboard/planes" className="card-elevated p-5 flex items-center justify-between hover:shadow-lg transition group border border-yellow-200">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold text-dark-900">VIP</span>
                            </div>
                            <p className="text-sm text-dark-500">∞ fotos · 90 días analíticas · $199/mes</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-yellow-500 transition" />
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
