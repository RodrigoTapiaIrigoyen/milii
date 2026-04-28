'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  status: string;
  reviewerId: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

export default function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch('/api/reviews/my-reviews?status=pending');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessing(reviewId);
    try {
      const res = await fetch('/api/reviews/my-reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action, reason }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        setShowRejectModal(null);
        setRejectReason('');

        if (data.warning) {
          alert(data.warning);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Error al procesar');
      }
    } catch (error) {
      alert('Error al procesar la reseña');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-dark-500">
        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
        <p>No tienes reseñas pendientes de aprobación</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <p className="text-sm text-dark-600">
          <strong>{reviews.length}</strong> reseña{reviews.length !== 1 ? 's' : ''} pendiente{reviews.length !== 1 ? 's' : ''} de aprobación.
          Las reseñas aprobadas serán visibles en tu perfil público.
        </p>
      </div>

      {reviews.map((review) => (
        <div key={review._id} className="border border-dark-200 rounded-xl p-5 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-dark-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-dark-500">
                  {review.rating}/5
                </span>
              </div>
              <p className="text-xs text-dark-400">
                {review.reviewerId?.email || 'Usuario anónimo'} •{' '}
                {new Date(review.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>

          <p className="text-dark-700 mb-4 text-sm leading-relaxed">
            {review.comment}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction(review._id, 'approve')}
              disabled={processing === review._id}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {processing === review._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Aprobar
            </button>

            <button
              onClick={() => setShowRejectModal(review._id)}
              disabled={processing === review._id}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </button>
          </div>

          {/* Modal de rechazo */}
          {showRejectModal === review._id && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 mb-2 font-medium">
                Motivo del rechazo (opcional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Contenido ofensivo, información falsa..."
                className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 mb-3"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(review._id, 'reject', rejectReason)}
                  disabled={processing === review._id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-white border border-dark-200 text-dark-700 rounded-lg text-sm font-medium transition hover:bg-dark-50"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Rechazar 3 o más reseñas suspenderá tu perfil para revisión administrativa.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
