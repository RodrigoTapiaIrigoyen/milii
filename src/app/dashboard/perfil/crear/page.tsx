'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  User, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Upload,
  Phone
} from 'lucide-react';

interface FormData {
  // Información básica
  name: string;
  age: string;
  gender: string;
  description: string;
  
  // Contacto
  whatsapp: string;
  telegram: string;
  
  // Ubicación
  country: string;
  state: string;
  city: string;
  zone: string;
  
  // Servicios
  services: string[];
  customService: string;
  
  // Precios
  hourlyRate: string;
  serviceRate: string;
  
  // Fotos
  photos: string[];
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

export default function CrearPerfilPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    description: '',
    whatsapp: '',
    telegram: '',
    country: 'México',
    state: '',
    city: '',
    zone: '',
    services: [],
    customService: '',
    hourlyRate: '',
    serviceRate: '',
    photos: [],
  });

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const authData = await res.json();
      if (authData.user.accountType !== 'profesional') {
        router.push('/dashboard');
        return;
      }

      // Si ya tiene perfil, redirigir a la página de perfil
      const profileRes = await fetch('/api/profiles/my-profile');
      if (profileRes.ok) {
        router.push('/dashboard/perfil');
        return;
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const addCustomService = () => {
    if (formData.customService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, prev.customService.trim()],
        customService: ''
      }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataImg,
      });

      if (!res.ok) throw new Error('Error al subir imagen');

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, data.url]
      }));
    } catch (error) {
      alert('Error al subir la foto. Intenta de nuevo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.age && formData.gender && formData.description.length >= 50);
      case 2:
        return formData.photos.length >= 1;
      case 3:
        return !!(formData.whatsapp || formData.telegram);
      case 4:
        return !!(formData.state && formData.city);
      case 5:
        return formData.services.length >= 1;
      case 6:
        return !!(formData.hourlyRate || formData.serviceRate);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 6));
    } else {
      alert('Por favor completa todos los campos requeridos de este paso');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          description: formData.description,
          whatsapp: formData.whatsapp,
          telegram: formData.telegram,
          location: {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zone: formData.zone,
          },
          services: formData.services,
          pricing: {
            hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
            serviceRate: formData.serviceRate ? parseInt(formData.serviceRate) : undefined,
            currency: 'MXN',
          },
          photos: formData.photos,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear perfil');
      }

      alert('¡Perfil creado exitosamente! Ahora puedes publicarlo desde tu dashboard.');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Error al crear perfil');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <User className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Información Básica</h2>
                <p className="text-dark-600">Cuéntanos sobre ti</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Nombre o Nombre Artístico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Ej: María González"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Edad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Ej: 25"
                min="18"
                max="99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Género <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
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
                Descripción Profesional <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-dark-500 mb-2">
                Describe tus servicios, experiencia y qué te hace única/o (mínimo 50 caracteres)
              </p>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                rows={6}
                placeholder="Ej: Terapeuta certificada con 5 años de experiencia en masajes terapéuticos y relajantes. Me especializo en técnicas de descontractura muscular y aromaterapia. Atención personalizada en un ambiente profesional y discreto..."
              />
              <div className="text-right text-xs text-dark-500 mt-1">
                {formData.description.length} / 50 caracteres mínimo
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Fotos de Perfil</h2>
                <p className="text-dark-600">Sube al menos 1 foto profesional (máximo 6)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos para buenas fotos:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Usa buena iluminación natural o profesional</li>
                <li>✓ Muestra tu rostro claramente</li>
                <li>✓ Viste de manera profesional</li>
                <li>✓ Evita fotos borrosas o con filtros excesivos</li>
                <li>✓ Máximo 5MB por foto</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
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

              {formData.photos.length < 6 && (
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
              )}
            </div>

            {formData.photos.length === 0 && (
              <div className="text-center text-red-500 text-sm">
                * Debes subir al menos 1 foto para continuar
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Información de Contacto</h2>
                <p className="text-dark-600">¿Cómo pueden contactarte los clientes?</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Tu número será visible para clientes interesados. 
                Proporciona al menos un método de contacto.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="+52 55 1234 5678"
              />
              <p className="text-xs text-dark-500 mt-1">
                Incluye código de país (Ej: +52 para México)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Telegram (opcional)
                </div>
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => updateField('telegram', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="@usuario"
              />
            </div>

            {!formData.whatsapp && !formData.telegram && (
              <div className="text-center text-red-500 text-sm">
                * Debes proporcionar al menos un método de contacto
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Ubicación</h2>
                <p className="text-dark-600">¿Dónde ofreces tus servicios?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                País <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 bg-dark-50 text-dark-900"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              >
                <option value="">Selecciona un estado</option>
                {ESTADOS_MEXICO.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Ej: Guadalajara"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Zona o Colonia (opcional)
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => updateField('zone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Ej: Polanco, Providencia, etc."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Servicios</h2>
                <p className="text-dark-600">¿Qué servicios ofreces?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-3">
                Selecciona tus servicios <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SERVICIOS_DISPONIBLES.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      formData.services.includes(service)
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-dark-200 hover:border-dark-300 text-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{service}</span>
                      {formData.services.includes(service) && (
                        <Check className="w-5 h-5 text-brand-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                ¿Ofreces otro servicio?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customService}
                  onChange={(e) => updateField('customService', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
                  className="flex-1 px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  placeholder="Escribe el servicio"
                />
                <button
                  onClick={addCustomService}
                  className="btn-secondary px-6"
                >
                  Agregar
                </button>
              </div>
            </div>

            {formData.services.length > 0 && (
              <div>
                <p className="text-sm font-medium text-dark-700 mb-2">
                  Servicios seleccionados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map(service => (
                    <span
                      key={service}
                      className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm flex items-center gap-2"
                    >
                      {service}
                      <button
                        onClick={() => toggleService(service)}
                        className="hover:text-brand-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.services.length === 0 && (
              <div className="text-center text-red-500 text-sm">
                * Debes seleccionar al menos 1 servicio
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900">Precios</h2>
                <p className="text-dark-600">Define tus tarifas</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>Tip:</strong> Sé transparente con tus precios. Los clientes valoran la claridad.
                Proporciona al menos una tarifa.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Tarifa por Hora (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateField('hourlyRate', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  placeholder="800"
                  min="0"
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Precio por hora de servicio
              </p>
            </div>

            <div className="text-center text-dark-500 font-medium">O</div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Tarifa por Servicio (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
                <input
                  type="number"
                  value={formData.serviceRate}
                  onChange={(e) => updateField('serviceRate', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  placeholder="1500"
                  min="0"
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Precio fijo por servicio completo
              </p>
            </div>

            {!formData.hourlyRate && !formData.serviceRate && (
              <div className="text-center text-red-500 text-sm">
                * Debes definir al menos una tarifa
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-dark-900">Crear Perfil Profesional</h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-dark-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    s === step
                      ? 'bg-brand-500 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-200 text-dark-500'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 6 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      s < step ? 'bg-green-500' : 'bg-dark-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-dark-600 text-center">
            Paso {step} de 6
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-200">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-secondary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            {step < 6 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(step)}
                className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !validateStep(6)}
                className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Crear Perfil
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
