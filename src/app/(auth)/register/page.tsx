'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Loader2, Briefcase, Star } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accountType: '' as 'profesional' | 'cliente' | '',
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

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.accountType) {
      setError('Selecciona un tipo de cuenta');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in-up">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark-900 mb-2">¡Registro Exitoso!</h2>
        <p className="text-dark-600 mb-4">Redirigiendo a tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-dark-900 mb-6">Crea tu Cuenta</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Selección de tipo de cuenta */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-dark-700 mb-3">
          ¿Qué tipo de cuenta deseas?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, accountType: 'profesional' })}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              formData.accountType === 'profesional'
                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                : 'border-dark-200 hover:border-brand-300'
            }`}
          >
            <Briefcase className={`w-6 h-6 mb-2 ${formData.accountType === 'profesional' ? 'text-brand-600' : 'text-dark-400'}`} />
            <p className="font-bold text-dark-900 text-sm">Profesional</p>
            <p className="text-xs text-dark-500 mt-1">Quiero publicar mi perfil y ofrecer mis servicios</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, accountType: 'cliente' })}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              formData.accountType === 'cliente'
                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                : 'border-dark-200 hover:border-brand-300'
            }`}
          >
            <Star className={`w-6 h-6 mb-2 ${formData.accountType === 'cliente' ? 'text-brand-600' : 'text-dark-400'}`} />
            <p className="font-bold text-dark-900 text-sm">Cliente</p>
            <p className="text-xs text-dark-500 mt-1">Quiero explorar perfiles y dejar reseñas</p>
          </button>
        </div>
      </div>

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
          <label className="block text-sm font-medium text-dark-700 mb-2">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 mb-2">Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
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
              Registrando...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <p className="text-center text-dark-600 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}
