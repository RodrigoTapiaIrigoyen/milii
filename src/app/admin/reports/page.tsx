'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Flag, 
  Loader2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

interface Report {
  _id: string;
  reporterId: { email: string };
  reportedUserId: { email: string };
  reportedProfileId: {
    _id: string;
    name: string;
    category: string;
    city: string;
    photos: string[];
    status: { isActive: boolean };
  };
  category: string;
  reason: string;
  status: string;
  actionTaken?: string;
  reviewedBy?: { email: string };
  reviewedAt?: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionData, setActionData] = useState({
    status: 'resolved',
    actionTaken: '',
    banProfile: false,
    banDays: 0,
  });

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/reports'
        : `/api/admin/reports?status=${filter}`;
      
      const res = await fetch(url);
      
      if (res.status === 403) {
        router.push('/dashboard');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedReport || !actionData.actionTaken) {
      alert('Por favor describe la acción tomada');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });

      if (res.ok) {
        alert('Reporte actualizado exitosamente');
        setSelectedReport(null);
        setActionData({
          status: 'resolved',
          actionTaken: '',
          banProfile: false,
          banDays: 0,
        });
        fetchReports();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar reporte');
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      alert('Error al actualizar reporte');
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Contenido inapropiado',
      fake_profile: 'Perfil falso',
      spam: 'Spam',
      harassment: 'Acoso',
      other: 'Otro',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
      reviewing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Eye },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      dismissed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/admin" className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Admin / <span className="text-luxury-500">Reportes</span></span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
              <Flag className="w-8 h-8" />
              Gestión de Reportes
            </h1>
            <p className="text-dark-600 mt-2">
              Modera reportes de la comunidad
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-4">
              <p className="text-sm text-dark-600 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-dark-600 mb-1">En Revisión</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewing}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-dark-600 mb-1">Resueltos</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-dark-600 mb-1">Desestimados</p>
              <p className="text-2xl font-bold text-gray-600">{stats.dismissed}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'reviewing', label: 'En Revisión' },
            { value: 'resolved', label: 'Resueltos' },
            { value: 'dismissed', label: 'Desestimados' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                filter === f.value
                  ? 'bg-luxury-500 text-white'
                  : 'bg-white text-dark-700 hover:bg-dark-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de reportes */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card-elevated text-center py-12">
            <Flag className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 mb-2">
              No hay reportes en esta categoría
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="card-elevated p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Info del reporte */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Imagen del perfil */}
                      {report.reportedProfileId.photos[0] && (
                        <img
                          src={report.reportedProfileId.photos[0]}
                          alt={report.reportedProfileId.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-dark-900">
                            {report.reportedProfileId.name}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-dark-600 mb-1">
                          <strong>Categoría:</strong> {getCategoryLabel(report.category)}
                        </p>
                        <p className="text-sm text-dark-600 mb-2">
                          <strong>Perfil reportado:</strong> {report.reportedUserId.email}
                        </p>
                        <p className="text-sm text-dark-700 bg-dark-50 p-3 rounded-lg">
                          {report.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-dark-500">
                      <span>Reportado: {formatDate(report.createdAt)}</span>
                      <span>Por: {report.reporterId.email}</span>
                      {report.reviewedBy && (
                        <span>Revisado por: {report.reviewedBy.email}</span>
                      )}
                    </div>

                    {report.actionTaken && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Acción tomada:</strong> {report.actionTaken}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {report.status === 'pending' && (
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="btn-primary whitespace-nowrap"
                    >
                      Revisar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Acción */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-dark-900 mb-4">
              Tomar Acción sobre Reporte
            </h3>

            <div className="space-y-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Estado del reporte
                </label>
                <select
                  value={actionData.status}
                  onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                >
                  <option value="reviewing">En Revisión</option>
                  <option value="resolved">Resuelto</option>
                  <option value="dismissed">Desestimado</option>
                </select>
              </div>

              {/* Acción tomada */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Describe la acción tomada *
                </label>
                <textarea
                  value={actionData.actionTaken}
                  onChange={(e) => setActionData({ ...actionData, actionTaken: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                  rows={3}
                  placeholder="Ej: Se verificó el contenido y se confirmó violación de políticas..."
                  required
                />
              </div>

              {/* Opciones de sanción */}
              {actionData.status === 'resolved' && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="banProfile"
                      checked={actionData.banProfile}
                      onChange={(e) => setActionData({ ...actionData, banProfile: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="banProfile" className="text-sm font-medium text-dark-700">
                      Desactivar perfil y aplicar sanción
                    </label>
                  </div>

                  {actionData.banProfile && (
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Duración del baneo (días, 0 = advertencia)
                      </label>
                      <input
                        type="number"
                        value={actionData.banDays}
                        onChange={(e) => setActionData({ ...actionData, banDays: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                        min="0"
                        max="365"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 px-4 py-2 border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  className="flex-1 btn-primary"
                  disabled={actionLoading || !actionData.actionTaken}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Acción'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
