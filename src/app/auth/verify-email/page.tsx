'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación inválido o faltante');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al verificar email');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Error al verificar email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Verificación de Email
          </h1>
        </div>

        {/* Card de estado */}
        <div className="card-elevated p-8">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-dark-900">
                Verificando tu email...
              </h2>
              <p className="text-dark-600">
                Espera un momento mientras confirmamos tu dirección de correo
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-dark-900">
                ¡Email Verificado!
              </h2>
              <p className="text-dark-600">
                {message || 'Tu dirección de correo ha sido verificada exitosamente.'}
              </p>
              <div className="pt-4 space-y-3">
                <Link
                  href="/dashboard"
                  className="btn-primary w-full justify-center gap-2"
                >
                  Ir al Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/perfil"
                  className="btn-secondary w-full justify-center"
                >
                  Completar mi perfil
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-dark-900">
                Error de Verificación
              </h2>
              <p className="text-dark-600">
                {message || 'No pudimos verificar tu email. El link puede estar expirado o ser inválido.'}
              </p>
              <div className="pt-4 space-y-3">
                <Link
                  href="/dashboard/configuracion"
                  className="btn-primary w-full justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Solicitar nuevo link
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-secondary w-full justify-center"
                >
                  Volver al Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-dark-600">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@placerlux.lat" className="text-brand-600 hover:text-brand-700 font-medium">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
