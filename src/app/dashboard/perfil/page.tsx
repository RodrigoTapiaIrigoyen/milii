'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Camera, 
  User, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Briefcase,
  Loader2,
  X,
  Upload,
  Phone,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  ExternalLink,
  Star,
  CheckCircle,
} from 'lucide-react';
import ReviewModeration from '@/components/profiles/ReviewModeration';

interface Profile {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  whatsapp: string;
  telegram: string;
  location: {
    country: string;
    state: string;
    city: string;
    zone: string;
  };
  services: string[];
  pricing: {
    hourlyRate?: number;
    serviceRate?: number;
    currency: string;
  };
  photos: string[];
  isPublished: boolean;
  approvalStatus: 'draft' | 'pending_review' | 'approved' | 'rejected';
  approvalNotes?: string;
  verification: {
    isVerified: boolean;
  };
  stats: {
    views: number;
    whatsappClicks: number;
    favorites: number;
  };
}

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const SERVICIOS_DISPONIBLES = [
  'Masaje Terapéutico',
  'Masaje Relajante',
  'Masaje Deportivo',
  'Masaje Thai',
  'Reflexología',
  'Aromaterapia',
  'Acompañamiento a Eventos',
  'Eventos Corporativos',
  'Bodas y Celebraciones',
  'Cenas de Negocios',
  'Viajes de Negocios',
  'Eventos Sociales',
];

const GENEROS_DISPONIBLES = [
  'Mujer',
  'Hombre',
  'Trans Femenina',
  'Trans Masculino',
  'No binario'
];

const PHOTO_LIMITS: Record<string, number> = { free: 3, premium: 10, vip: Infinity };

export default function EditarPerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customService, setCustomService] = useState('');
  const [plan, setPlan] = useState<'free' | 'premium' | 'vip'>('free');

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) { router.push('/login'); return; }
      const authData = await authRes.json();
      if (authData.user.accountType !== 'profesional') { router.push('/dashboard'); return; }
    } catch { router.push('/login'); return; }
    fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        fetch('/api/profiles/my-profile'),
        fetch('/api/subscriptions'),
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          router.push('/dashboard/perfil/crear');
          return;
        }
        throw new Error('Error al cargar perfil');
      }

      const data = await profileRes.json();
      setProfile(data.profile);

      if (subRes.ok) {
        const subData = await subRes.json();
        setPlan(subData.subscription?.plan || 'free');
      }
    } catch (error) {
      alert('Error al cargar el perfil');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!profile) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...(profile as any)[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
  };

  const toggleService = (service: string) => {
    if (!profile) return;
    
    const services = profile.services.includes(service)
      ? profile.services.filter(s => s !== service)
      : [...profile.services, service];
    
    setProfile({ ...profile, services });
  };

  const addCustomService = () => {
    if (!profile || !customService.trim()) return;
    
    setProfile({
      ...profile,
      services: [...profile.services, customService.trim()]
    });
    setCustomService('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const photoLimit = PHOTO_LIMITS[plan];
    if (profile.photos.length >= photoLimit) {
      const msg = plan === 'free'
        ? 'El plan Free permite máximo 3 fotos. Actualiza a Premium para subir hasta 10.'
        : 'El plan Premium permite máximo 10 fotos. Actualiza a VIP para fotos ilimitadas.';
      alert(msg);
      router.push('/dashboard/planes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al subir la foto');
        return;
      }

      setProfile({
        ...profile,
        photos: [...profile.photos, data.url]
      });
    } catch (error) {
      alert('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async (index: number) => {
    if (!profile) return;
    // Actualiza el estado local
    const newPhotos = profile.photos.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      photos: newPhotos
    });
    // Llama al endpoint para limpiar el array en backend
    try {
      await fetch('/api/profiles/my-profile/clean-photos', { method: 'PATCH' });
      // Fetch del perfil actualizado para sincronizar el array real
      const res = await fetch('/api/profiles/my-profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (e) {
      // Silenciar error, solo para asegurar limpieza
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validaciones
    if (!profile.name || !profile.age) {
      alert('Nombre y edad son obligatorios');
      return;
    }

    if (!profile.whatsapp && !profile.telegram) {
      alert('Debes proporcionar al menos un método de contacto');
      return;
    }

    if (profile.photos.length === 0) {
      alert('Debes tener al menos una foto');
      return;
    }

    if (profile.services.length === 0) {
      alert('Debes seleccionar al menos un servicio');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          description: profile.description,
          whatsapp: profile.whatsapp,
          telegram: profile.telegram,
          location: profile.location,
          services: profile.services,
          pricing: profile.pricing,
          photos: profile.photos,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      alert('Perfil actualizado exitosamente');
      router.push('/dashboard');
    } catch (error) {
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;

    // Si ya está en revisión o aprobado no hacer nada
    if (profile.approvalStatus === 'pending_review') {
      alert('Tu perfil ya está en revisión. El equipo lo aprobará pronto.');
      return;
    }
    if (profile.approvalStatus === 'approved') {
      alert('Tu perfil ya está aprobado y publicado.');
      return;
    }

    if (!window.confirm('¿Enviar tu perfil a revisión para que sea publicado?')) return;

    try {
      const res = await fetch('/api/profiles/my-profile/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          if (window.confirm('Necesitas una suscripción activa para publicar. ¿Ir a planes?')) {
            router.push('/dashboard/planes');
          }
          return;
        }
        alert(data.error || 'Error al enviar perfil a revisión');
        return;
      }

      setProfile({ ...profile, approvalStatus: 'pending_review' });
      alert('¡Perfil enviado a revisión! Te notificaremos cuando sea aprobado.');
    } catch (error) {
      alert('Error al enviar el perfil a revisión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-dark-600 hover:text-dark-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-dark-900">Editar Perfil</h1>
              <p className="text-sm text-dark-600">{profile.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={profile.approvalStatus === 'pending_review' || profile.approvalStatus === 'approved'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
                profile.approvalStatus === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : profile.approvalStatus === 'pending_review'
                  ? 'bg-amber-100 text-amber-700'
                  : profile.approvalStatus === 'rejected'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {profile.approvalStatus === 'approved' ? (
                <><CheckCircle className="w-4 h-4" />Aprobado</>
              ) : profile.approvalStatus === 'pending_review' ? (
                <><Loader2 className="w-4 h-4 animate-spin" />En Revisión</>
              ) : profile.approvalStatus === 'rejected' ? (
                <><Eye className="w-4 h-4" />Reenviar a Revisión</>
              ) : (
                <><Eye className="w-4 h-4" />Enviar a Revisión</>
              )}
            </button>
            <Link
              href={`/perfiles/${profile._id}/preview`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition bg-brand-100 text-brand-700 hover:bg-brand-200"
            >
              <ExternalLink className="w-4 h-4" />
              Vista previa
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Stats */}
          <div className="space-y-6">
            <div className="card-elevated p-6">
              <h2 className="font-bold text-dark-900 mb-4">Estadísticas</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-dark-600">Vistas</p>
                  <p className="text-2xl font-bold text-dark-900">{profile.stats.views}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-600">Clicks en WhatsApp</p>
                  <p className="text-2xl font-bold text-dark-900">{profile.stats.whatsappClicks}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-600">Favoritos</p>
                  <p className="text-2xl font-bold text-dark-900">{profile.stats.favorites}</p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <h2 className="font-bold text-dark-900 mb-4">Estado del Perfil</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-600">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : profile.approvalStatus === 'pending_review'
                      ? 'bg-amber-100 text-amber-800'
                      : profile.approvalStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.approvalStatus === 'approved' ? 'Publicado'
                      : profile.approvalStatus === 'pending_review' ? 'En Revisión'
                      : profile.approvalStatus === 'rejected' ? 'Rechazado'
                      : 'Borrador'}
                  </span>
                </div>
                {profile.approvalStatus === 'rejected' && profile.approvalNotes && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo:</p>
                    <p className="text-xs text-red-600">{profile.approvalNotes}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-600">Verificado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.verification.isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.verification.isVerified ? 'Sí' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Información Básica</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Nombre o Nombre Artístico *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => updateField('age', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    min="18"
                    max="99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Género *
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  >
                    <option value="">Selecciona tu género</option>
                    {GENEROS_DISPONIBLES.map((genero) => (
                      <option key={genero} value={genero}>
                        {genero}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Descripción Profesional *
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    rows={5}
                  />
                  <p className="text-xs text-dark-500 mt-1">
                    {profile.description.length} caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Fotos */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-dark-900">Fotos</h2>
                </div>
                {/* Contador de fotos según plan */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    profile.photos.length >= PHOTO_LIMITS[plan]
                      ? 'text-red-600'
                      : 'text-dark-500'
                  }`}>
                    {profile.photos.length} / {PHOTO_LIMITS[plan] === Infinity ? '∞' : PHOTO_LIMITS[plan]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    plan === 'vip'
                      ? 'bg-yellow-100 text-yellow-700'
                      : plan === 'premium'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Barra de progreso de fotos */}
              {PHOTO_LIMITS[plan] !== Infinity && (
                <div className="mb-4">
                  <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.photos.length >= PHOTO_LIMITS[plan]
                          ? 'bg-red-500'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(100, (profile.photos.length / PHOTO_LIMITS[plan]) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}

                {profile.photos.length < PHOTO_LIMITS[plan] ? (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-dark-300 hover:border-brand-500 transition cursor-pointer flex flex-col items-center justify-center gap-2 bg-dark-50 hover:bg-brand-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-dark-400" />
                        <span className="text-sm text-dark-600">Subir foto</span>
                      </>
                    )}
                  </label>
                ) : (
                  <Link
                    href="/dashboard/planes"
                    className="aspect-square rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 flex flex-col items-center justify-center gap-2 hover:bg-amber-100 transition"
                  >
                    <span className="text-2xl">🔒</span>
                    <span className="text-xs text-amber-700 font-medium text-center px-2">
                      {plan === 'free' ? 'Sube a Premium' : 'Sube a VIP'}
                    </span>
                    <span className="text-xs text-amber-600 text-center px-2">
                      para más fotos
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Contacto</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp *
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={profile.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Telegram (opcional)
                  </label>
                  <input
                    type="text"
                    value={profile.telegram}
                    onChange={(e) => updateField('telegram', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    placeholder="@usuario"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Ubicación</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={profile.location.state}
                    onChange={(e) => updateField('location.state', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  >
                    <option value="">Selecciona</option>
                    {ESTADOS_MEXICO.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={profile.location.city}
                    onChange={(e) => updateField('location.city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Zona o Colonia
                  </label>
                  <input
                    type="text"
                    value={profile.location.zone}
                    onChange={(e) => updateField('location.zone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  />
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Servicios</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {SERVICIOS_DISPONIBLES.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-3 rounded-xl border-2 transition text-left text-sm ${
                      profile.services.includes(service)
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-dark-200 hover:border-dark-300'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
                  className="flex-1 px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition text-sm"
                  placeholder="Agregar servicio personalizado"
                />
                <button onClick={addCustomService} className="btn-secondary px-4 text-sm">
                  Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.services.map(service => (
                  <span
                    key={service}
                    className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center gap-2"
                  >
                    {service}
                    <button onClick={() => toggleService(service)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Reseñas Pendientes */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Reseñas Pendientes</h2>
              </div>
              <ReviewModeration />
            </div>

            {/* Precios */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-dark-900">Precios</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tarifa por Hora (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
                    <input
                      type="number"
                      value={profile.pricing.hourlyRate || ''}
                      onChange={(e) => updateField('pricing.hourlyRate', parseInt(e.target.value) || undefined)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tarifa por Servicio (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
                    <input
                      type="number"
                      value={profile.pricing.serviceRate || ''}
                      onChange={(e) => updateField('pricing.serviceRate', parseInt(e.target.value) || undefined)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
