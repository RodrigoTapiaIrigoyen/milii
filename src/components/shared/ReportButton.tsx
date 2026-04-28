'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, X, Loader2 } from 'lucide-react';

interface ReportButtonProps {
  profileId: string;
  profileName: string;
}

export default function ReportButton({ profileId, profileName }: ReportButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'inappropriate_content', label: 'Contenido inapropiado' },
    { value: 'fake_profile', label: 'Perfil falso' },
    { value: 'spam', label: 'Spam o publicidad' },
    { value: 'harassment', label: 'Acoso' },
    { value: 'other', label: 'Otro' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!category || !reason || reason.length < 10) {
      setError('Por favor completa todos los campos correctamente');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          category,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setCategory('');
          setReason('');
        }, 2000);
      } else {
        if (res.status === 401) {
          // No autenticado, redirigir a login
          router.push('/login');
          return;
        }
        setError(data.error || 'Error al enviar el reporte');
      }
    } catch (error) {
      console.error('Error al reportar:', error);
      setError('Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
        title="Reportar perfil"
      >
        <Flag className="w-4 h-4" />
        Reportar
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                Reportar Perfil
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-dark-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-dark-900 mb-2">
                  Reporte Enviado
                </h4>
                <p className="text-dark-600">
                  Gracias por ayudarnos a mantener la comunidad segura
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-dark-600">
                  Estás reportando el perfil: <strong>{profileName}</strong>
                </p>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Motivo del reporte *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-luxury-500 focus:border-luxury-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Razón */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Descripción (mínimo 10 caracteres) *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-luxury-500 focus:border-luxury-500"
                    rows={4}
                    minLength={10}
                    maxLength={1000}
                    placeholder="Explica detalladamente el motivo de tu reporte..."
                    required
                  />
                  <p className="text-xs text-dark-500 mt-1">
                    {reason.length}/1000 caracteres
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50 transition"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Reporte'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
