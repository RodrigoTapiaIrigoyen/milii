'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setEmailNotVerified(true);
        } else {
          throw new Error(data.error || 'Error al ingresar');
        }
        return;
      }

      const data = await res.json();
      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      setResendSent(true);
    } catch {
      // noop
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="card-elevated p-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-dark-900 mb-6">Inicia Sesión</h2>

      {emailNotVerified && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex gap-3 mb-3">
            <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium text-sm">Verifica tu correo electrónico</p>
              <p className="text-amber-700 text-sm mt-1">
                Enviamos un enlace de verificación a <strong>{formData.email}</strong>. Revisa tu bandeja de entrada (y spam).
              </p>
            </div>
          </div>
          {resendSent ? (
            <p className="text-sm text-green-700 font-medium">✓ Correo reenviado correctamente</p>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="text-sm text-amber-700 underline font-medium disabled:opacity-50"
            >
              {resendLoading ? 'Enviando...' : 'Reenviar correo de verificación'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="input-field"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-dark-700">Contraseña</label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-field"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Inicia Sesión'
          )}
        </button>
      </form>

      <p className="text-center text-dark-600 mt-6">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-500 font-semibold hover:text-brand-600">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
