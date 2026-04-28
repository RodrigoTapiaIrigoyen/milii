'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/shared/FavoriteButton';
import {
    Search,
    MapPin,
    DollarSign,
    Filter,
    Loader2,
    Star,
    BadgeCheck,
    Users,
    X,
    ArrowLeft
} from 'lucide-react';

interface Profile {
    _id: string;
    name: string;
    age: number;
    gender: string;
    description: string;
    whatsapp: string;
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
    };
    isPremium: boolean;
    isFeatured: boolean;
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

export default function ExplorarPerfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [onlyVerified, setOnlyVerified] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        fetchProfiles();
    }, [searchQuery, selectedState, selectedService, selectedGender, minPrice, maxPrice, sortBy, onlyVerified, currentPage]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // Construir URL con parámetros
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedState) params.append('state', selectedState);
            if (selectedService) params.append('service', selectedService);
            if (selectedGender) params.append('gender', selectedGender);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sortBy) params.append('sortBy', sortBy);
            if (onlyVerified) params.append('verified', 'true');
            params.append('page', currentPage.toString());

            const res = await fetch(`/api/profiles/public?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles || []);
                setTotalPages(data.pagination?.pages || 1);
                setTotalResults(data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Error al cargar perfiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedState('');
        setSelectedService('');
        setSelectedGender('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('popular');
        setOnlyVerified(false);
        setCurrentPage(1);
    };

    const activeFiltersCount = [
        selectedState,
        selectedService,
        selectedGender,
        minPrice,
        maxPrice,
        onlyVerified
    ].filter(Boolean).length;

    if (loading && currentPage === 1) {
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
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/"
                            className="text-dark-600 hover:text-dark-900 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-dark-900">Explorar Profesionales</h1>
                            <p className="text-sm text-dark-600">
                                {totalResults} profesionales disponibles
                            </p>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-dark-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                        >
                            <option value="popular">Más populares</option>
                            <option value="recent">Más recientes</option>
                            <option value="priceAsc">Precio: bajo a alto</option>
                            <option value="priceDesc">Precio: alto a bajo</option>
                        </select>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre o descripción..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition font-medium ${showFilters || activeFiltersCount > 0
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-dark-200 hover:border-dark-300 text-dark-700'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Panel de filtros */}
                {showFilters && (
                    <div className="border-t border-dark-200 bg-dark-50">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 mb-2">
                                        Género
                                    </label>
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                                    >
                                        <option value="">Todos</option>
                                        {GENEROS_DISPONIBLES.map(genero => (
                                            <option key={genero} value={genero}>{genero}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                                    >
                                        <option value="">Todos los estados</option>
                                        {ESTADOS_MEXICO.map(estado => (
                                            <option key={estado} value={estado}>{estado}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 mb-2">
                                        Servicio
                                    </label>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                                    >
                                        <option value="">Todos los servicios</option>
                                        {SERVICIOS_DISPONIBLES.map(servicio => (
                                            <option key={servicio} value={servicio}>{servicio}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 mb-2">
                                        Precio mínimo
                                    </label>
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="$0"
                                        className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-700 mb-2">
                                        Precio máximo
                                    </label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="$5000"
                                        className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyVerified}
                                        onChange={(e) => setOnlyVerified(e.target.checked)}
                                        className="w-4 h-4 rounded border-dark-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-dark-700 flex items-center gap-1">
                                        <BadgeCheck className="w-4 h-4 text-green-600" />
                                        Solo perfiles verificados
                                    </span>
                                </label>
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid de perfiles */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                        <h2 className="text-xl font-bold text-dark-900 mb-2">
                            No se encontraron perfiles
                        </h2>
                        <p className="text-dark-600 mb-4">
                            Intenta ajustar tus filtros de búsqueda
                        </p>
                        <button
                            onClick={clearFilters}
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <Link
                                key={profile._id}
                                href={`/perfiles/${profile._id}`}
                                className={`card group overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl relative ${
                                    profile.isFeatured
                                        ? 'ring-2 ring-yellow-400 shadow-yellow-400/20 shadow-lg'
                                        : profile.isPremium
                                        ? 'ring-2 ring-blue-400 shadow-blue-400/10 shadow-md'
                                        : ''
                                }`}
                            >
                                {/* Imagen del perfil */}
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
                                {/* Marca de agua para perfiles Free */}
                                    {!profile.isPremium && !profile.isFeatured && (
                                        <div className="absolute inset-0 pointer-events-none flex items-end justify-end p-2">
                                            <span className="text-white/40 text-xs font-semibold tracking-widest select-none rotate-[-20deg] origin-bottom-right">
                                                LuxProfile
                                            </span>
                                        </div>
                                    )}
                                    {/* Badge de verificado */}
                                    {profile.verification?.isVerified && (
                                        <div className="absolute left-3 top-3 rounded-full bg-green-500 p-2">
                                            <BadgeCheck className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    {/* Badge VIP / Premium */}
                                    {profile.isFeatured ? (
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            <span>👑</span> VIP
                                        </div>
                                    ) : profile.isPremium ? (
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            <Star className="h-3 w-3 fill-current" /> Premium
                                        </div>
                                    ) : null}
                                    {/* Botón de favorito */}
                                    <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
                                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition">
                                            <FavoriteButton profileId={profile._id} />
                                        </div>
                                    </div>
                                </div>

                                {/* Información del perfil */}
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
                                                        {profile.gender && <span>•</span>}
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
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl border border-dark-200 font-medium text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Anterior
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-medium transition ${
                                                currentPage === pageNum
                                                    ? 'bg-brand-600 text-white'
                                                    : 'border border-dark-200 text-dark-700 hover:bg-dark-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl border border-dark-200 font-medium text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
}
