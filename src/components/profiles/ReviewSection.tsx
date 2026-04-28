'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Review {
  _id: string;
  reviewerId: {
    email: string;
  };
  rating: number;
  comment: string;
  helpful: number;
  unhelpful: number;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewSectionProps {
  profileId: string;
  profileName: string;
  isOwnProfile?: boolean;
}

export default function ReviewSection({ profileId, profileName, isOwnProfile = false }: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [profileId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?profileId=${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (comment.length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Gracias por tu reseña! Será revisada antes de publicarse.');
        setShowForm(false);
        setRating(0);
        setComment('');
      } else {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        setError(data.error || 'Error al enviar reseña');
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      setError('Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, type: 'helpful' | 'unhelpful') => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        fetchReviews(); // Recargar reseñas
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStarPercentage = (stars: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return (stats.distribution[stars as keyof typeof stats.distribution] / stats.totalReviews) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-luxury-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="card-elevated">
        <div className="bg-gradient-to-br from-dark-900 to-dark-700 p-6 text-white">
          <h3 className="font-bold text-2xl mb-2">Reseñas y Calificaciones</h3>
          <p className="text-sm text-dark-300">Opiniones de clientes verificados</p>
        </div>

        <div className="p-6">
          {stats && stats.totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calificación promedio */}
              <div className="text-center">
                <div className="text-5xl font-bold text-dark-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(stats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-dark-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-dark-600">
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                </p>
              </div>

              {/* Distribución */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm text-dark-700 w-12">{stars} ⭐</span>
                    <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${getStarPercentage(stars)}%` }}
                      />
                    </div>
                    <span className="text-sm text-dark-600 w-12 text-right">
                      {stats.distribution[stars as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-dark-300 mx-auto mb-3" />
              <p className="text-dark-600">Aún no hay reseñas para este perfil</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón para dejar reseña */}
      {!isOwnProfile && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Dejar una Reseña
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="card-elevated p-6 space-y-4">
              <h4 className="font-bold text-lg text-dark-900">Escribe tu reseña</h4>
              
              {/* Estrellas */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Calificación *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-dark-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Comentario (mínimo 10 caracteres) *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-luxury-500"
                  rows={4}
                  maxLength={1000}
                  placeholder="Comparte tu experiencia con este perfil..."
                  required
                />
                <p className="text-xs text-dark-500 mt-1">
                  {comment.length}/1000 caracteres
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
                  onClick={() => {
                    setShowForm(false);
                    setRating(0);
                    setComment('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={submitting || rating === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Publicar Reseña'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="card-elevated p-6">
            {/* Header de la reseña */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-dark-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-dark-600">
                  {review.reviewerId.email.split('@')[0]} • {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Comentario */}
            <p className="text-dark-700 mb-4">{review.comment}</p>

            {/* Respuesta del propietario */}
            {review.response && (
              <div className="bg-luxury-50 border-l-4 border-luxury-500 p-4 mb-4">
                <p className="text-sm font-medium text-luxury-900 mb-1">
                  Respuesta de {profileName}
                </p>
                <p className="text-sm text-dark-700">{review.response}</p>
                <p className="text-xs text-dark-500 mt-2">
                  {formatDate(review.respondedAt!)}
                </p>
              </div>
            )}

            {/* Botones de útil */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-dark-600">¿Fue útil esta reseña?</span>
              <button
                onClick={() => handleVote(review._id, 'helpful')}
                className="flex items-center gap-1 text-dark-600 hover:text-green-600 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.helpful}</span>
              </button>
              <button
                onClick={() => handleVote(review._id, 'unhelpful')}
                className="flex items-center gap-1 text-dark-600 hover:text-red-600 transition"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{review.unhelpful}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
