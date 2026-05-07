'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, Tag, X, CheckCircle } from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

export default function PlanesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponValid, setCouponValid] = useState<null | { plan: string; months: number; description: string }>(null);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

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
    fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        fetch('/api/profiles/my-profile'),
        fetch('/api/subscriptions/trial-status'),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileId(data.profile._id);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setTrialUsed(subData.trialUsed);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const planes = [
    {
      id: 'free',
      nombre: 'Free',
      precio: 0,
      duracion: '7 días',
      caracteristicas: [
        'Perfil básico',
        'Hasta 3 fotos',
        'Duración 7 días',
        'Soporte por email',
      ],
      color: 'gray',
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: 99,
      duracion: 'mensual',
      caracteristicas: [
        'Perfil destacado',
        'Hasta 10 fotos',
        'Sin marca de agua',
        'Verificación rápida',
        'Estadísticas detalladas',
        'Soporte prioritario',
      ],
      color: 'purple',
      recomendado: true,
    },
    {
      id: 'vip',
      nombre: 'VIP',
      precio: 199,
      duracion: 'mensual',
      caracteristicas: [
        'Todo lo de Premium',
        'Perfil ultra destacado',
        'Fotos ilimitadas',
        'Verificación inmediata',
        'Aparece primero',
        'Soporte 24/7',
        'Badge VIP',
      ],
      color: 'yellow',
    },
  ];

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponValid(null);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponValid(data);
      } else {
        setCouponError(data.error || 'Cupón inválido');
      }
    } catch {
      setCouponError('Error al validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!profileId || !couponValid) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, action: 'apply', profileId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponApplied(true);
        setTimeout(() => router.push('/dashboard?subscription=success'), 2000);
      } else {
        setCouponError(data.error || 'Error al aplicar el cupón');
      }
    } catch {
      setCouponError('Error al aplicar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, precio: number) => {
    if (!profileId) {
      alert('Primero debes crear tu perfil antes de suscribirte');
      router.push('/dashboard/perfil/crear');
      return;
    }

    if (precio === 0) {
      // Plan gratuito - crear suscripción directamente
      try {
        setLoading(true);
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId, profileId }),
        });

        if (res.ok) {
          router.push('/dashboard?subscription=success');
        } else {
          const err = await res.json();
          alert(err.error || 'Error al crear suscripción');
        }
      } catch (error) {
        alert('Error al procesar suscripción');
      } finally {
        setLoading(false);
      }
    } else {
      // Plan de pago - ir a MercadoPago
      try {
        setLoading(true);
        setSelectedPlan(planId);
        const res = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId, profileId }),
        });

        if (res.ok) {
          const data = await res.json();
          window.location.href = data.initPoint;
        } else {
          alert('Error al crear preferencia de pago');
        }
      } catch (error) {
        alert('Error al procesar pago');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            Placer<span className="text-brand-500">Lux</span>
          </Link>
          <NotificationBell />
        </div>
      </nav>

      {pageLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : !profileId ? (
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Crea tu perfil primero</h2>
          <p className="text-dark-600 mb-6">Necesitas tener un perfil creado antes de elegir un plan.</p>
          <Link href="/dashboard/perfil/crear" className="btn-primary">
            Crear Perfil
          </Link>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-900 mb-4">
            Elige tu Plan
          </h1>
          <p className="text-lg text-dark-600">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>

          {/* Sección de cupón */}
          {couponApplied ? (
            <div className="mt-6 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-xl font-medium">
              <CheckCircle className="w-5 h-5" />
              ¡Cupón aplicado! Redirigiendo...
            </div>
          ) : (
            <div className="mt-8 max-w-md mx-auto">
              <p className="text-sm text-dark-500 mb-3">¿Tienes un código promocional?</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponValid(null); setCouponError(''); }}
                    placeholder="FUNDADOR"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition text-sm uppercase"
                  />
                </div>
                <button
                  onClick={handleValidateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-dark-900 text-white text-sm font-medium hover:bg-dark-700 disabled:opacity-50 transition"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validar'}
                </button>
              </div>

              {couponError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <X className="w-4 h-4" />{couponError}
                </div>
              )}

              {couponValid && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 font-medium text-sm mb-1">✓ {couponValid.description}</p>
                  <p className="text-green-600 text-sm mb-3">
                    {couponValid.months} meses de {couponValid.plan.toUpperCase()} gratis
                  </p>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-50"
                  >
                    {couponLoading ? 'Aplicando...' : '🎉 Activar cupón'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`card-elevated p-8 relative ${
                plan.recomendado ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              {plan.recomendado && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recomendado
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">
                  {plan.nombre}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-dark-900">
                    ${plan.precio}
                  </span>
                  <span className="text-dark-600 ml-2">MXN</span>
                </div>
                <p className="text-dark-600">{plan.duracion}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.caracteristicas.map((caracteristica, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-dark-700">{caracteristica}</span>
                  </li>
                ))}
              </ul>

              {plan.precio === 0 && trialUsed ? (
                <div className="w-full text-center py-3 px-4 rounded-xl bg-dark-100 text-dark-500 text-sm font-medium">
                  Prueba ya utilizada
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id, plan.precio)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`btn-primary w-full ${
                    loading && selectedPlan === plan.id ? 'opacity-50' : ''
                  }`}
                >
                  {loading && selectedPlan === plan.id
                    ? 'Procesando...'
                    : plan.precio === 0
                    ? 'Comenzar Gratis'
                    : 'Suscribirse'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
      )}
    </div>
  );
}
