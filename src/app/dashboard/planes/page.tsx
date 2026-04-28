'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

export default function PlanesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

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
      const res = await fetch('/api/profiles/my-profile');
      if (res.ok) {
        const data = await res.json();
        setProfileId(data.profile._id);
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
            Lux<span className="text-brand-500">Profile</span>
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
