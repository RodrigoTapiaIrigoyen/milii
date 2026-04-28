'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Phone,
  MessageCircle,
  BadgeCheck,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import ReportButton from '@/components/shared/ReportButton';
import ReviewSection from '@/components/profiles/ReviewSection';

export interface ProfileData {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  whatsapp: string;
  telegram?: string;
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
    whatsappClicks: number;
    favorites: number;
  };
  isPremium: boolean;
  isFeatured: boolean;
}

interface Props {
  initialProfile: ProfileData;
  isPreview?: boolean;
}

export default function PerfilClientPage({ initialProfile, isPreview = false }: Props) {
  const router = useRouter();
  const profile = initialProfile;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Registrar vista solo en el navegador (no bots / SSR / preview)
  useEffect(() => {
    if (isPreview) return;
    fetch(`/api/profiles/${profile._id}/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch(() => {});
  }, [profile._id]);

  const handleWhatsAppClick = () => {
    fetch(`/api/profiles/${profile._id}/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'whatsapp' }),
    }).catch(() => {});

    const message = encodeURIComponent(
      `Hola ${profile.name}, vi tu perfil en LuxProfile y me gustaría contratar tus servicios.`
    );
    window.open(`https://wa.me/${profile.whatsapp}?text=${message}`, '_blank');
  };

  const handleTelegramClick = () => {
    if (!profile.telegram) return;

    fetch(`/api/profiles/${profile._id}/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'telegram' }),
    }).catch(() => {});

    window.open(`https://t.me/${profile.telegram}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.name} - LuxProfile`,
      text: profile.description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const nextPhoto = () =>
    setCurrentPhotoIndex((prev) =>
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );

  const prevPhoto = () =>
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-brand-50/30 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-20 hidden sm:block" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl animate-float-slow hidden lg:block" />
      <div className="pointer-events-none absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl animate-float-slow hidden lg:block" />

      {/* Header */}
      <div className="glass-panel border-b border-dark-200/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-dark-50/80 hover:bg-dark-100 text-dark-700 hover:text-dark-900 transition-all font-medium shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <p className="sm:hidden text-sm font-semibold text-dark-900 truncate max-w-[140px]">
              {profile.name}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 sm:p-3 rounded-xl transition-all shadow-sm ${
                  isFavorite
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-105'
                    : 'bg-white hover:bg-red-50 text-dark-600 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-brand-50 text-dark-600 hover:text-brand-600 transition-all shadow-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <ReportButton profileId={profile._id} profileName={profile.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* Galería */}
            <div className="card-elevated overflow-hidden group">
              <div className="relative h-64 sm:h-96 lg:h-[500px] bg-gradient-to-br from-dark-100 to-dark-200">
                {profile.photos && profile.photos.length > 0 ? (
                  <>
                    <Image
                      src={profile.photos[currentPhotoIndex]}
                      alt={`${profile.name} - Foto ${currentPhotoIndex + 1}`}
                      fill
                      className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setShowGallery(true)}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {!profile.isPremium && !profile.isFeatured && (
                      <div className="absolute inset-0 pointer-events-none flex items-end justify-end p-4">
                        <span className="text-white/30 text-sm font-semibold tracking-[0.25em] select-none rotate-[-15deg] origin-bottom-right">
                          LuxProfile
                        </span>
                      </div>
                    )}

                    {profile.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full transition-all lg:opacity-0 lg:group-hover:opacity-100 shadow-xl backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full transition-all lg:opacity-0 lg:group-hover:opacity-100 shadow-xl backdrop-blur-sm"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium">
                          {currentPhotoIndex + 1} / {profile.photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-dark-400 text-sm">
                    Sin fotos
                  </div>
                )}
              </div>

              {profile.photos && profile.photos.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2 p-2.5 sm:p-4 bg-dark-50/50">
                  {profile.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`relative h-14 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === currentPhotoIndex
                          ? 'border-brand-500 shadow-md ring-1 ring-brand-300'
                          : 'border-transparent hover:border-brand-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info del perfil */}
            <div className="card-elevated p-4 sm:p-6 lg:p-8">
              <div className="mb-5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-dark-900 via-dark-700 to-brand-600 bg-clip-text text-transparent leading-tight">
                    {profile.name}
                  </h1>
                  {profile.isFeatured ? (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2.5 py-1 rounded-full text-xs font-bold shadow shrink-0">
                      👑 VIP
                    </span>
                  ) : profile.isPremium ? (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow shrink-0">
                      <BadgeCheck className="w-3 h-3" /> Premium
                    </span>
                  ) : null}
                  {profile.verification?.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow shrink-0">
                      <BadgeCheck className="w-3 h-3" /> Verificada
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-dark-600">
                  {profile.gender && <span className="font-semibold text-brand-700">{profile.gender}</span>}
                  {profile.age && (
                    <>
                      {profile.gender && <span className="text-dark-300">•</span>}
                      <span className="font-medium">{profile.age} años</span>
                    </>
                  )}
                </div>
              </div>

              {/* Precio móvil */}
              {profile.pricing && (profile.pricing.hourlyRate || profile.pricing.serviceRate) && (
                <div className="lg:hidden flex items-center justify-between mb-5 p-4 bg-gradient-to-r from-brand-50 to-purple-50 rounded-2xl border border-brand-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-500 p-2 rounded-xl">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 font-medium">
                        {profile.pricing.hourlyRate ? 'Por hora' : 'Por servicio'}
                      </p>
                      <p className="font-display text-2xl font-bold text-dark-900">
                        ${profile.pricing.hourlyRate || profile.pricing.serviceRate}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-dark-500 text-right max-w-[120px]">💳 Sin cargos ocultos</p>
                </div>
              )}

              {/* Ubicación */}
              {profile.location && (
                <div className="flex items-start gap-3 mb-5 p-3.5 sm:p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl border border-brand-100">
                  <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm mt-0.5">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-dark-900 text-sm mb-0.5">Ubicación</p>
                    <p className="text-dark-700 text-sm break-words leading-relaxed">
                      {[profile.location.zone, profile.location.city, profile.location.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Descripción */}
              {profile.description && (
                <div className="mb-5">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-dark-900 mb-2.5">
                    Sobre mí
                  </h2>
                  <p className="text-dark-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                    {profile.description}
                  </p>
                </div>
              )}

              {/* Servicios */}
              {profile.services && profile.services.length > 0 && (
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-dark-900 mb-3">
                    Servicios Ofrecidos
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estadísticas móvil */}
            <div className="lg:hidden card-elevated overflow-hidden">
              <div className="bg-gradient-to-r from-dark-900 to-dark-700 px-4 py-3 text-white">
                <h3 className="font-bold text-base">Estadísticas del perfil</h3>
              </div>
              <div className="grid grid-cols-3 divide-x divide-dark-100">
                <div className="flex flex-col items-center py-4 px-2">
                  <Eye className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="font-bold text-xl text-dark-900">{profile.stats?.views || 0}</span>
                  <span className="text-xs text-dark-500 text-center mt-0.5">Vistas</span>
                </div>
                <div className="flex flex-col items-center py-4 px-2">
                  <Phone className="w-5 h-5 text-green-500 mb-1" />
                  <span className="font-bold text-xl text-dark-900">{profile.stats?.whatsappClicks || 0}</span>
                  <span className="text-xs text-dark-500 text-center mt-0.5">Contactos</span>
                </div>
                <div className="flex flex-col items-center py-4 px-2">
                  <Heart className="w-5 h-5 text-red-500 mb-1" />
                  <span className="font-bold text-xl text-dark-900">{profile.stats?.favorites || 0}</span>
                  <span className="text-xs text-dark-500 text-center mt-0.5">Favoritos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden lg:block space-y-6">
            {/* Tarifa */}
            {profile.pricing && (
              <div className="card-elevated overflow-hidden">
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <DollarSign className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-brand-100 text-sm font-medium">Tarifa</p>
                      <p className="font-display text-4xl font-bold">
                        ${profile.pricing.hourlyRate || profile.pricing.serviceRate}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-brand-100 font-medium">
                    {profile.pricing.hourlyRate ? 'Por hora' : 'Por servicio'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-brand-50 to-purple-50">
                  <p className="text-xs text-dark-600 text-center">💳 Precio transparente • Sin cargos ocultos</p>
                </div>
              </div>
            )}

            {/* Contacto */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-bold text-dark-900 text-xl mb-4">Contactar Ahora</h3>
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                Contactar por WhatsApp
              </button>
              {profile.telegram && (
                <button
                  onClick={handleTelegramClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group"
                >
                  <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  Contactar por Telegram
                </button>
              )}
              <div className="p-3 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl border border-brand-100">
                <p className="text-xs text-dark-700 text-center font-medium">
                  💬 Menciona que viste este perfil en LuxProfile
                </p>
              </div>
            </div>

            {/* Estadísticas desktop */}
            <div className="card-elevated overflow-hidden">
              <div className="bg-gradient-to-br from-dark-900 to-dark-700 p-5 text-white">
                <h3 className="font-bold text-xl mb-1">Estadísticas</h3>
                <p className="text-sm text-dark-300">Rendimiento del perfil</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-dark-700">Visualizaciones</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-blue-600">{profile.stats?.views || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-dark-700">Contactos</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-green-600">{profile.stats?.whatsappClicks || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-dark-700">Favoritos</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-red-600">{profile.stats?.favorites || 0}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Barra de contacto fija móvil */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-dark-200/60 shadow-2xl px-4 py-3 safe-bottom">
        <div className={`grid gap-2 ${profile.telegram ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 active:from-green-700 active:to-green-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all"
          >
            <Phone className="w-5 h-5 shrink-0" />
            <span className="text-sm sm:text-base">WhatsApp</span>
          </button>
          {profile.telegram && (
            <button
              onClick={handleTelegramClick}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 active:from-blue-700 active:to-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm sm:text-base">Telegram</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal galería */}
      {showGallery && profile.photos && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={prevPhoto}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] px-14 sm:px-20 py-10">
            <Image
              src={profile.photos[currentPhotoIndex]}
              alt={`${profile.name} - Foto ${currentPhotoIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 px-5 py-2 rounded-full text-white text-sm">
            {currentPhotoIndex + 1} / {profile.photos.length}
          </div>
        </div>
      )}

      {/* Reseñas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 sm:pb-12">
        <ReviewSection profileId={profile._id} profileName={profile.name} />
      </div>
    </div>
  );
}
