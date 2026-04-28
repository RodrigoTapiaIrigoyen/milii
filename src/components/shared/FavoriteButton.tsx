'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  profileId: string;
  className?: string;
  showLabel?: boolean;
}

export default function FavoriteButton({ profileId, className = '', showLabel = false }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [profileId]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch(`/api/favorites/check/${profileId}`);
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    } finally {
      setChecking(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (isFavorite) {
        // Quitar de favoritos
        const res = await fetch(`/api/favorites?profileId=${profileId}`, {
          method: 'DELETE',
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Error al quitar de favoritos');
        }

        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al agregar a favoritos');
        }

        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar favorito');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin text-dark-400" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 transition-all ${
        isFavorite
          ? 'text-red-600'
          : 'text-dark-400 hover:text-red-600'
      } disabled:opacity-50 ${className}`}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart
          className={`w-5 h-5 transition-all ${
            isFavorite ? 'fill-red-600 scale-110' : 'hover:scale-110'
          }`}
        />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  );
}
