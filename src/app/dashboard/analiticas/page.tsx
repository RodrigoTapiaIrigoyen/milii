'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Eye,
  MousePointer,
  Heart,
  Users,
  ArrowLeft,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ChartData {
  date: string;
  views: number;
  clicks: number;
  favorites: number;
}

interface Summary {
  totalViews: number;
  totalClicks: number;
  totalFavorites: number;
  uniqueViews: number;
  conversionRate: number;
  period: string;
}

interface ProfileInfo {
  name: string;
  category: string;
  isPublished: boolean;
}

interface PlanInfo {
  plan: string;
  maxDays: number;
  daysUsed: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) { router.push('/login'); return; }
        const authData = await authRes.json();
        if (authData.user.accountType !== 'profesional') { router.push('/dashboard'); return; }
        setAuthorized(true);
      } catch { router.push('/login'); }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    if (authorized) fetchAnalytics();
  }, [period, authorized]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/profile?days=${period}`);
      
      if (res.status === 404) {
        // No hay perfil
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setChartData(data.chartData);
        setSummary(data.summary);
        setProfile(data.profile);
        if (data.planInfo) setPlanInfo(data.planInfo);
      }
    } catch (error) {
      console.error('Error al cargar analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard / <span className="text-luxury-500">Analíticas</span></span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Analíticas de tu Perfil
            </h1>
            {profile && (
              <p className="text-dark-600 mt-2">
                {profile.name} • {profile.category}
              </p>
            )}
          </div>

          {/* Selector de período */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dark-600" />
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-luxury-500"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
                <option value={365}>Último año</option>
              </select>
            </div>
            {planInfo && planInfo.plan === 'free' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                Plan Free: historial limitado a 7 días.{' '}
                <Link href="/dashboard/planes" className="font-semibold underline">
                  Actualiza tu plan →
                </Link>
              </p>
            )}
            {planInfo && planInfo.plan === 'premium' && (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                Plan Premium: hasta 30 días de historial. VIP tiene hasta 90 días.
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-500" />
          </div>
        ) : !profile ? (
          <div className="card-elevated text-center py-12">
            <TrendingUp className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 mb-2">
              No tienes un perfil creado
            </h3>
            <p className="text-dark-600 mb-6">
              Crea tu perfil para empezar a ver estadísticas
            </p>
            <Link href="/dashboard/perfil/crear" className="btn-primary inline-block">
              Crear Perfil
            </Link>
          </div>
        ) : (
          <>
            {/* Cards de Resumen */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-dark-500">{summary.period}</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-900">
                    {formatNumber(summary.totalViews)}
                  </p>
                  <p className="text-sm text-dark-600">Vistas Totales</p>
                  <p className="text-xs text-dark-500 mt-1">
                    {formatNumber(summary.uniqueViews)} únicas
                  </p>
                </div>

                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-dark-500">{summary.period}</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-900">
                    {formatNumber(summary.totalClicks)}
                  </p>
                  <p className="text-sm text-dark-600">Clics a WhatsApp</p>
                </div>

                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="text-xs text-dark-500">{summary.period}</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-900">
                    {formatNumber(summary.totalFavorites)}
                  </p>
                  <p className="text-sm text-dark-600">Nuevos Favoritos</p>
                </div>

                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-luxury-600" />
                    <span className="text-xs text-dark-500">Conversión</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-900">
                    {summary.conversionRate}%
                  </p>
                  <p className="text-sm text-dark-600">Clics / Vistas</p>
                </div>
              </div>
            )}

            {/* Gráfica de Líneas - Vistas, Clics, Favoritos */}
            <div className="card-elevated p-6 mb-8">
              <h3 className="text-xl font-bold text-dark-900 mb-6">
                Actividad en el Tiempo
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    name="Vistas"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#10b981"
                    name="Clics"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="favorites"
                    stroke="#ef4444"
                    name="Favoritos"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Barras - Comparación */}
            <div className="card-elevated p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-6">
                Comparación Diaria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#3b82f6" name="Vistas" />
                  <Bar dataKey="clicks" fill="#10b981" name="Clics" />
                  <Bar dataKey="favorites" fill="#ef4444" name="Favoritos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-luxury-50 border border-luxury-200 rounded-xl p-6">
              <h4 className="font-semibold text-luxury-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tips para mejorar tu rendimiento
              </h4>
              <ul className="space-y-2 text-sm text-luxury-800">
                <li>• Actualiza tus fotos regularmente para mantener el interés</li>
                <li>• Responde rápido a los mensajes para aumentar la tasa de conversión</li>
                <li>• Completa toda la información de tu perfil para aparecer en más búsquedas</li>
                <li>• Considera actualizar a un plan premium para mayor visibilidad</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
