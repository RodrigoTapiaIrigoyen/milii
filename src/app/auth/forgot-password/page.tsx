'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al solicitar recuperación');
      }

      setSuccess(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error: any) {
      setError(error.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-dark-600 hover:text-dark-900 transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-dark-600">
            Ingresa tu email y te enviaremos instrucciones para recuperarla
          </p>
        </div>

        {/* Formulario */}
        <div className="card-elevated p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900">
                ¡Revisa tu email!
              </h3>
              <p className="text-dark-600">
                Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.
              </p>
              
              {/* Modo desarrollo: mostrar link directo */}
              {resetUrl && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    🚧 MODO DESARROLLO
                  </p>
                  <p className="text-xs text-yellow-800 mb-3">
                    En producción, este link se enviará por email
                  </p>
                  <Link
                    href={resetUrl}
                    className="inline-block w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    Ir al link de recuperación
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-block text-brand-600 hover:text-brand-700 font-medium"
              >
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar instrucciones
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-dark-200">
                <Link
                  href="/login"
                  className="text-dark-600 hover:text-dark-900 font-medium transition"
                >
                  Volver al login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Info adicional */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-dark-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
