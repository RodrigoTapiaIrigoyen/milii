'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  Heart,
  MapPin,
  DollarSign,
  Users,
  BadgeCheck,
  Star,
  Trash2
} from 'lucide-react';

interface Profile {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  location: {
    state: string;
    city: string;
    zone: string;
  };
  services: string[];
  pricing: {
    hourlyRate?: number;
    serviceRate?: number;
  };
  photos: string[];
  verification: {
    isVerified: boolean;
  };
  stats: {
    views: number;
    favorites: number;
  };
}

interface Favorite {
  _id: string;
  profileId: Profile;
  createdAt: string;
}

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Error al cargar favoritos');
      }
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (profileId: string) => {
    if (!confirm('¿Quitar este perfil de favoritos?')) return;

    setRemoving(profileId);
    try {
      const res = await fetch(`/api/favorites?profileId=${profileId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar favorito');
      }

      // Actualizar lista local
      setFavorites(favorites.filter(fav => fav.profileId._id !== profileId));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar favorito');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-dark-600 hover:text-dark-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                Mis Favoritos
              </h1>
              <p className="text-sm text-dark-600">
                {favorites.length} {favorites.length === 1 ? 'perfil guardado' : 'perfiles guardados'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              No tienes favoritos aún
            </h2>
            <p className="text-dark-600 mb-6">
              Explora perfiles y guarda tus favoritos para encontrarlos fácilmente
            </p>
            <Link href="/perfiles" className="btn-primary inline-flex items-center gap-2">
              Explorar Perfiles
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const profile = favorite.profileId;
              return (
                <div key={favorite._id} className="card group overflow-hidden relative">
                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleRemoveFavorite(profile._id)}
                    disabled={removing === profile._id}
                    className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 transition group/btn"
                    title="Quitar de favoritos"
                  >
                    {removing === profile._id ? (
                      <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                    ) : (
                      <Heart className="w-5 h-5 text-red-600 fill-red-600 group-hover/btn:scale-110 transition" />
                    )}
                  </button>

                  {/* Link al perfil */}
                  <Link href={`/perfiles/${profile._id}`} className="block">
                    {/* Imagen */}
                    <div className="relative h-64 w-full overflow-hidden rounded-t-2xl bg-dark-100">
                      {profile.photos && profile.photos.length > 0 ? (
                        <Image
                          src={profile.photos[0]}
                          alt={profile.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                          <Users className="h-16 w-16 text-brand-400" />
                        </div>
                      )}
                      {profile.verification?.isVerified && (
                        <div className="absolute left-3 top-3 rounded-full bg-green-500 p-2">
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-display text-xl font-semibold text-dark-900">
                            {profile.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-dark-600">
                            {profile.gender && (
                              <span className="font-medium">{profile.gender}</span>
                            )}
                            {profile.age && (
                              <>
                                <span>•</span>
                                <span>{profile.age} años</span>
                              </>
                            )}
                          </div>
                        </div>
                        {profile.stats?.views > 0 && (
                          <div className="flex items-center gap-1 text-sm text-dark-500">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{profile.stats.views}</span>
                          </div>
                        )}
                      </div>

                      {profile.description && (
                        <p className="text-sm text-dark-600 line-clamp-2 mb-3">
                          {profile.description}
                        </p>
                      )}

                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-dark-600 mb-3">
                          <MapPin className="h-4 w-4 text-brand-600" />
                          <span>
                            {profile.location.city}, {profile.location.state}
                          </span>
                        </div>
                      )}

                      {profile.services && profile.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.services.slice(0, 2).map((service, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                            >
                              {service}
                            </span>
                          ))}
                          {profile.services.length > 2 && (
                            <span className="rounded-full bg-dark-100 px-3 py-1 text-xs font-medium text-dark-600">
                              +{profile.services.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {profile.pricing && (
                        <div className="flex items-center justify-between border-t border-dark-100 pt-4">
                          <div className="flex items-center gap-2 text-dark-700">
                            <DollarSign className="h-4 w-4 text-brand-600" />
                            <span className="text-sm">Desde</span>
                          </div>
                          <span className="font-display text-lg font-semibold text-dark-900">
                            ${profile.pricing.hourlyRate || profile.pricing.serviceRate}
                          </span>
                        </div>
                      )}

                      <div className="mt-4">
                        <span className="text-sm font-medium text-brand-600 group-hover:underline">
                          Ver perfil completo →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
