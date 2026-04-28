'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Shield,
  AlertTriangle,
  Ban,
  Trash2,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Star,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Activity,
  ClipboardCheck,
  Flag,
  MessageSquare,
  RefreshCw,
  Send,
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'banned';
}

interface Profile {
  _id: string;
  userId: {
    email: string;
  };
  name: string;
  age: number;
  description?: string;
  whatsapp?: string;
  telegram?: string;
  photos: string[];
  services?: string[];
  location: {
    state: string;
    city: string;
  };
  isPublished: boolean;
  approvalStatus: 'draft' | 'pending_review' | 'approved' | 'rejected';
  verificationPriority?: 'normal' | 'priority' | 'vip';
  approvalNotes?: string;
  submittedAt?: string;
  fraudFlags?: string[];
  verification: {
    isVerified: boolean;
  };
  stats: {
    views: number;
    whatsappClicks: number;
  };
  createdAt: string;
}

interface Payment {
  _id: string;
  userId: {
    email: string;
  };
  profileId?: {
    name: string;
  };
  amount: number;
  plan?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method?: string;
  externalId?: string;
  concept?: string;
  metadata?: { plan?: string };
  paidAt?: string;
  createdAt: string;
}

interface Subscription {
  _id: string;
  userId: {
    email: string;
  };
  profileId?: {
    name: string;
  };
  plan: 'free' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  priceAmount: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

interface PaymentSummary {
  totalCompleted: number;
  totalPending: number;
  totalFailed: number;
  totalRevenue: number;
}

interface SubscriptionSummary {
  totalFree: number;
  totalPremium: number;
  totalVip: number;
  totalActive: number;
}

interface Stats {
  totalUsers: number;
  totalProfiles: number;
  totalRevenue: number;
  activeSubscriptions: number;
  verifiedProfiles: number;
  pendingVerifications: number;
  pendingApprovals: number;
}

type TabType = 'overview' | 'users' | 'profiles' | 'payments' | 'moderation' | 'review' | 'support';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null);
  const [paymentSubTab, setPaymentSubTab] = useState<'subscriptions' | 'transactions'>('subscriptions');
  const [searchTerm, setSearchTerm] = useState('');
  // Paginación
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPages, setPaymentPages] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [subsPages, setSubsPages] = useState(1);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [supportFilter, setSupportFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTabData();
    }
  }, [currentTab, loading]);

  const checkAdminAccess = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadTabData = async () => {
    if (currentTab === 'overview') {
      await loadStats();
    } else if (currentTab === 'users') {
      await loadUsers();
    } else if (currentTab === 'profiles') {
      await loadProfiles();
    } else if (currentTab === 'payments') {
      await loadPayments();
    } else if (currentTab === 'review') {
      await loadPendingProfiles();
    } else if (currentTab === 'support') {
      await loadSupportTickets();
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async (page = 1, statusFilter = '') => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserPage(data.pagination.page);
        setUserPages(data.pagination.pages);
        setUserTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const res = await fetch('/api/admin/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadPendingProfiles = async () => {
    try {
      const res = await fetch('/api/admin/profiles?approvalStatus=pending_review&limit=50');
      if (res.ok) {
        const data = await res.json();
        setPendingProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Error loading pending profiles:', error);
    }
  };

  const loadSupportTickets = async () => {
    setSupportLoading(true);
    try {
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    } finally {
      setSupportLoading(false);
    }
  };

  const refreshSelectedTicket = async (ticketId: string) => {
    const res = await fetch(`/api/admin/support/${ticketId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedTicket(data.ticket);
      setSupportTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        await refreshSelectedTicket(selectedTicket._id);
      }
    } finally {
      setSendingReply(false);
    }
  };

  const handleChangeTicketStatus = async (ticketId: string, status: string) => {
    await fetch(`/api/admin/support/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await refreshSelectedTicket(ticketId);
  };

  const handleSaveNote = async () => {
    if (!selectedTicket) return;
    setSavingNote(true);
    try {
      await fetch(`/api/admin/support/${selectedTicket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNote }),
      });
      await refreshSelectedTicket(selectedTicket._id);
    } finally {
      setSavingNote(false);
    }
  };

  const loadPayments = async (payPage = 1, sPage = 1) => {
    try {
      const [paymentsRes, subsRes] = await Promise.all([
        fetch(`/api/admin/payments?page=${payPage}&limit=50`),
        fetch(`/api/admin/subscriptions?page=${sPage}&limit=50`),
      ]);
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments);
        setPaymentSummary(data.summary);
        setPaymentPage(data.pagination.page);
        setPaymentPages(data.pagination.pages);
      }
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscriptions(data.subscriptions);
        setSubscriptionSummary(data.summary);
        setSubsPage(data.pagination.page);
        setSubsPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleApproveProfile = async (profileId: string) => {
    setReviewingId(profileId);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        await loadPendingProfiles();
        await loadStats();
        setSelectedProfile(null);
        alert('Perfil aprobado y publicado. El usuario fue notificado.');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al aprobar perfil');
      }
    } catch (error) {
      alert('Error al aprobar perfil');
    } finally {
      setReviewingId(null);
    }
  };

  const handleRejectProfile = async (profileId: string) => {
    const notes = rejectNotes[profileId] || '';
    if (notes.trim().length < 10) {
      alert('Escribe un motivo de rechazo (mínimo 10 caracteres)');
      return;
    }
    setReviewingId(profileId);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes }),
      });
      if (res.ok) {
        await loadPendingProfiles();
        await loadStats();
        setSelectedProfile(null);
        setRejectNotes((prev) => { const n = { ...prev }; delete n[profileId]; return n; });
        alert('Perfil rechazado. El usuario fue notificado con el motivo.');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al rechazar perfil');
      }
    } catch (error) {
      alert('Error al rechazar perfil');
    } finally {
      setReviewingId(null);
    }
  };

  const handleVerifyProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' })
      });
      if (res.ok) {
        await loadProfiles();
        alert('Perfil verificado exitosamente');
      }
    } catch (error) {
      alert('Error al verificar perfil');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de suspender este usuario?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend' })
      });
      if (res.ok) {
        await loadUsers();
        alert('Usuario suspendido');
      }
    } catch (error) {
      alert('Error al suspender usuario');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de BANEAR permanentemente este usuario?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban' })
      });
      if (res.ok) {
        await loadUsers();
        alert('Usuario baneado');
      }
    } catch (error) {
      alert('Error al banear usuario');
    }
  };

  const handleActivateUser = async (userId: string) => {
    if (!confirm('¿Reactivar este usuario? Podrá acceder de nuevo a la plataforma.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' })
      });
      if (res.ok) {
        await loadUsers();
        alert('Usuario reactivado');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al reactivar usuario');
      }
    } catch (error) {
      alert('Error al reactivar usuario');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('¿Estás seguro de ELIMINAR este perfil? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadProfiles();
        alert('Perfil eliminado');
      }
    } catch (error) {
      alert('Error al eliminar perfil');
    }
  };

  const handleFeatureProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feature' })
      });
      if (res.ok) {
        await loadProfiles();
        alert('Perfil destacado');
      }
    } catch (error) {
      alert('Error al destacar perfil');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-dark-800/50 backdrop-blur-xl border-r border-dark-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-brand-500 to-purple-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Admin Panel</h1>
              <p className="text-xs text-dark-400">LuxProfile MX</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'overview'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Vista General</span>
            </button>

            <button
              onClick={() => setCurrentTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'users'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Usuarios</span>
            </button>

            <button
              onClick={() => setCurrentTab('profiles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'profiles'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">Perfiles</span>
            </button>

            <button
              onClick={() => setCurrentTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'payments'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Pagos</span>
            </button>

            <button
              onClick={() => setCurrentTab('moderation')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'moderation'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Moderación</span>
            </button>

            <button
              onClick={() => setCurrentTab('review')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'review'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="font-medium">Revisión</span>
              {stats && stats.pendingApprovals > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === 'support'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Soporte</span>
            </button>
          </nav>

          <div className="mt-auto pt-8">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:bg-dark-700 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Dashboard Usuario</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Overview Tab */}
        {currentTab === 'overview' && stats && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Vista General</h2>
              <p className="text-slate-400">Estadísticas y métricas de la plataforma</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="admin-card-blue p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-500/25 p-2.5 rounded-xl">
                    <Users className="w-5 h-5 text-blue-300" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-300" />
                </div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Usuarios</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>

              <div className="admin-card-purple p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-500/25 p-2.5 rounded-xl">
                    <UserCheck className="w-5 h-5 text-purple-300" />
                  </div>
                  <Activity className="w-4 h-4 text-purple-300" />
                </div>
                <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide mb-1">Perfiles</p>
                <p className="text-3xl font-bold text-white">{stats.totalProfiles}</p>
              </div>

              <div className="admin-card-green p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-500/25 p-2.5 rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-1">Ingresos</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>

              <div className="admin-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-cyan-500/25 p-2.5 rounded-xl">
                    <CreditCard className="w-5 h-5 text-cyan-300" />
                  </div>
                  <CheckCircle className="w-4 h-4 text-cyan-300" />
                </div>
                <p className="text-cyan-200 text-xs font-semibold uppercase tracking-wide mb-1">Suscripciones</p>
                <p className="text-3xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>

              <div className="admin-card-amber p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-amber-500/25 p-2.5 rounded-xl">
                    <ClipboardCheck className="w-5 h-5 text-amber-300" />
                  </div>
                  {stats.pendingApprovals > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      HOY
                    </span>
                  )}
                </div>
                <p className="text-amber-200 text-xs font-semibold uppercase tracking-wide mb-1">En Revisión</p>
                <p className="text-3xl font-bold text-amber-300">{stats.pendingApprovals}</p>
                <button
                  onClick={() => setCurrentTab('review')}
                  className="text-amber-400 text-xs hover:text-amber-200 mt-2 block underline-offset-2 hover:underline"
                >
                  Revisar ahora →
                </button>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="admin-card p-6">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Verificaciones
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <span className="text-slate-300 font-medium">Perfiles Verificados</span>
                    <span className="text-emerald-400 font-bold text-lg">{stats.verifiedProfiles}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-300 font-medium">Pendientes de verificar</span>
                    <span className="text-amber-400 font-bold text-lg">{stats.pendingVerifications}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card p-6">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-brand-400" />
                  Acciones Rápidas
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentTab('review')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-amber-300 font-semibold transition"
                  >
                    <span>Revisar Perfiles Pendientes</span>
                    <ClipboardCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('profiles')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 rounded-xl text-purple-300 font-semibold transition"
                  >
                    <span>Ver Todos los Perfiles</span>
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('payments')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-xl text-cyan-300 font-semibold transition"
                  >
                    <span>Revisar Pagos</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {currentTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-3xl font-bold text-white">Gestión de Usuarios</h2>
                <p className="text-slate-400">
                  Total: <span className="text-white font-semibold">{userTotal}</span> &nbsp;·&nbsp;
                  Página {userPage}/{userPages}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    const val = e.target.value as 'all' | 'active' | 'suspended' | 'banned';
                    setUserStatusFilter(val);
                    setUserPage(1);
                    loadUsers(1, val);
                  }}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:border-brand-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="suspended">Suspendidos</option>
                  <option value="banned">Baneados</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') loadUsers(1, userStatusFilter);
                    }}
                    placeholder="Buscar usuario y presiona Enter..."
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200/20"
                  />
                </div>
              </div>
            </div>

            <div className="admin-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Registro</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user =>
                      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 text-white font-medium">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                              : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                              : user.status === 'suspended'
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-200 border border-red-500/30'
                          }`}>
                            {user.status === 'active' ? 'Activo'
                              : user.status === 'suspended' ? 'Suspendido' : 'Baneado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/users/${user._id}`)}
                              className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(user.status === 'suspended' || user.status === 'banned') ? (
                              <button
                                onClick={() => handleActivateUser(user._id)}
                                className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition"
                                title="Reactivar usuario"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user._id)}
                                className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 transition"
                                title="Suspender"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                            {user.status !== 'banned' && (
                              <button
                                onClick={() => handleBanUser(user._id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                                title="Banear permanentemente"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Paginación usuarios */}
            {userPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => loadUsers(userPage - 1, userStatusFilter)}
                  disabled={userPage <= 1}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                >
                  ← Anterior
                </button>
                <span className="text-slate-400 text-sm px-3">
                  Página {userPage} de {userPages}
                </span>
                <button
                  onClick={() => loadUsers(userPage + 1, userStatusFilter)}
                  disabled={userPage >= userPages}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
        {currentTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Gestión de Perfiles</h2>
                <p className="text-slate-400">Total: {profiles.length} perfiles</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar perfil..."
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200/20"
                />
              </div>
            </div>

            <div className="admin-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Vistas</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles
                    .filter(profile =>
                      (profile.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((profile) => (
                      <tr key={profile._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-white font-semibold">{profile.name}</p>
                              <p className="text-slate-400 text-sm">{profile.age} años</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">
                          {profile.userId?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">
                          {profile.location?.city}, {profile.location?.state}
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          {profile.stats?.views || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block border ${
                              profile.approvalStatus === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                                : profile.approvalStatus === 'pending_review'
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                                : profile.approvalStatus === 'rejected'
                                ? 'bg-red-500/20 text-red-200 border-red-500/30'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}>
                              {profile.approvalStatus === 'approved' ? 'Aprobado'
                                : profile.approvalStatus === 'pending_review' ? 'En Revisión'
                                : profile.approvalStatus === 'rejected' ? 'Rechazado'
                                : 'Borrador'}
                            </span>
                            {profile.verification?.isVerified && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-500/30 inline-block">
                                Verificado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.open(`/perfiles/${profile._id}`, '_blank')}
                              className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition"
                              title="Ver perfil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!profile.verification?.isVerified && (
                              <button
                                onClick={() => handleVerifyProfile(profile._id)}
                                className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition"
                                title="Verificar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleFeatureProfile(profile._id)}
                              className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition"
                              title="Destacar"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/profiles/${profile._id}`)}
                              className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400 transition"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(profile._id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {currentTab === 'payments' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-white">Gestión de Pagos</h2>
              <p className="text-slate-400">Suscripciones activas y transacciones MercadoPago</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="admin-card p-5">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Plan Gratis</p>
                <p className="text-3xl font-bold text-slate-200">{subscriptionSummary?.totalFree ?? '—'}</p>
                <p className="text-slate-500 text-xs mt-1">suscripciones activas</p>
              </div>
              <div className="admin-card-blue p-5">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Premium $99/mes</p>
                <p className="text-3xl font-bold text-white">{subscriptionSummary?.totalPremium ?? '—'}</p>
                <p className="text-blue-400 text-xs mt-1">suscripciones activas</p>
              </div>
              <div className="admin-card-purple p-5">
                <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">VIP $199/mes</p>
                <p className="text-3xl font-bold text-white">{subscriptionSummary?.totalVip ?? '—'}</p>
                <p className="text-purple-400 text-xs mt-1">suscripciones activas</p>
              </div>
              <div className="admin-card-green p-5">
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-1">Ingresos totales</p>
                <p className="text-2xl font-bold text-white">
                  ${paymentSummary ? paymentSummary.totalRevenue.toLocaleString('es-MX') : '—'}
                </p>
                <p className="text-emerald-400 text-xs mt-1">MXN cobrados</p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-700 pb-0">
              <button
                onClick={() => setPaymentSubTab('subscriptions')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                  paymentSubTab === 'subscriptions'
                    ? 'border-brand-500 text-white bg-brand-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Membresías activas
                <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                  {subscriptionSummary?.totalActive ?? 0}
                </span>
              </button>
              <button
                onClick={() => setPaymentSubTab('transactions')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                  paymentSubTab === 'transactions'
                    ? 'border-brand-500 text-white bg-brand-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Transacciones
                <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                  {payments.length}
                </span>
              </button>
            </div>

            {/* Membresías activas */}
            {paymentSubTab === 'subscriptions' && (
              <>
              <div className="admin-table">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Perfil</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No hay suscripciones registradas
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td className="px-6 py-4 text-white font-medium">
                            {sub.userId?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {sub.profileId?.name || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                              sub.plan === 'vip'
                                ? 'bg-purple-500/25 text-purple-200 border-purple-500/40'
                                : sub.plan === 'premium'
                                ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}>
                              {sub.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-emerald-300 font-semibold">
                            {sub.priceAmount === 0 ? 'Gratis' : `$${sub.priceAmount.toLocaleString('es-MX')}`}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              sub.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                                : sub.status === 'expired'
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                                : 'bg-red-500/20 text-red-200 border-red-500/30'
                            }`}>
                              {sub.status === 'active' ? 'Activa'
                                : sub.status === 'expired' ? 'Vencida' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {sub.endDate
                              ? new Date(sub.endDate).toLocaleDateString('es-MX')
                              : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación suscripciones */}
              {subsPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => loadPayments(paymentPage, subsPage - 1)}
                    disabled={subsPage <= 1}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                  >
                    ← Anterior
                  </button>
                  <span className="text-slate-400 text-sm px-3">Página {subsPage} de {subsPages}</span>
                  <button
                    onClick={() => loadPayments(paymentPage, subsPage + 1)}
                    disabled={subsPage >= subsPages}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              </>
            )}

            {/* Transacciones */}
            {paymentSubTab === 'transactions' && (
              <>
              <div className="admin-table">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado MP</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID MercadoPago</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No hay transacciones registradas
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="px-6 py-4 text-white font-medium">
                            {payment.userId?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                              (payment.metadata?.plan || payment.plan) === 'vip'
                                ? 'bg-purple-500/25 text-purple-200 border-purple-500/40'
                                : (payment.metadata?.plan || payment.plan) === 'premium'
                                ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}>
                              {payment.metadata?.plan || payment.plan || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-emerald-300 font-bold">
                            ${payment.amount.toLocaleString('es-MX')} MXN
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              payment.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                                : payment.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                                : payment.status === 'refunded'
                                ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                                : 'bg-red-500/20 text-red-200 border-red-500/30'
                            }`}>
                              {payment.status === 'completed' ? 'Completado'
                                : payment.status === 'pending' ? 'Pendiente'
                                : payment.status === 'refunded' ? 'Reembolsado'
                                : 'Fallido'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                            {payment.externalId || '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString('es-MX')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación transacciones */}
              {paymentPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => loadPayments(paymentPage - 1, subsPage)}
                    disabled={paymentPage <= 1}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                  >
                    ← Anterior
                  </button>
                  <span className="text-slate-400 text-sm px-3">Página {paymentPage} de {paymentPages}</span>
                  <button
                    onClick={() => loadPayments(paymentPage + 1, subsPage)}
                    disabled={paymentPage >= paymentPages}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {/* Moderation Tab */}
        {currentTab === 'moderation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Centro de Moderación</h2>
              <p className="text-slate-400">Reportes, sanciones y contenido pendiente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="admin-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/20 p-2.5 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-white font-bold">Reportes Pendientes</h3>
                </div>
                <p className="text-4xl font-bold text-amber-400 mb-1">0</p>
                <p className="text-slate-400 text-sm">Sin reportes activos</p>
              </div>

              <div className="admin-card-amber p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/20 p-2.5 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-orange-300" />
                  </div>
                  <h3 className="text-white font-bold">Usuarios Suspendidos</h3>
                </div>
                <p className="text-4xl font-bold text-orange-300 mb-1">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
                <button
                  onClick={() => setCurrentTab('users')}
                  className="text-orange-300 text-sm hover:text-orange-100 hover:underline mt-1"
                >
                  Ver en usuarios →
                </button>
              </div>

              <div className="admin-card-red p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-500/20 p-2.5 rounded-xl">
                    <Ban className="w-5 h-5 text-red-300" />
                  </div>
                  <h3 className="text-white font-bold">Usuarios Baneados</h3>
                </div>
                <p className="text-4xl font-bold text-red-300 mb-1">
                  {users.filter(u => u.status === 'banned').length}
                </p>
                <button
                  onClick={() => setCurrentTab('users')}
                  className="text-red-300 text-sm hover:text-red-100 hover:underline mt-1"
                >
                  Ver en usuarios →
                </button>
              </div>
            </div>

            <div className="admin-card p-6">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-400" />
                Herramientas de Moderación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-start gap-4 p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Ver Reportes</p>
                    <p className="text-xs text-slate-400 mt-1">Revisar contenido reportado por usuarios</p>
                  </div>
                </button>
                <button className="flex items-start gap-4 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition text-left">
                  <Ban className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Gestionar Sanciones</p>
                    <p className="text-xs text-slate-400 mt-1">Administrar suspensiones y baneos activos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Tab - Aprobación de Perfiles */}
        {currentTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Revisión de Perfiles</h2>
                <p className="text-dark-400">
                  {pendingProfiles.length} perfil(es) esperando aprobación
                </p>
              </div>
              <button
                onClick={loadPendingProfiles}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Activity className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {pendingProfiles.length === 0 ? (
              <div className="bg-dark-800/50 border border-dark-700 p-12 rounded-2xl text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">¡Todo al día!</h3>
                <p className="text-dark-400">No hay perfiles pendientes de revisión.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vista detallada de perfil seleccionado */}
                {selectedProfile && (
                  <div className="bg-dark-800/50 border border-amber-500/40 p-6 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-xl">{selectedProfile.name}</h3>
                        <p className="text-dark-400 text-sm">
                          {selectedProfile.age} años · {selectedProfile.location?.city},{' '}
                          {selectedProfile.location?.state}
                        </p>
                        <p className="text-dark-500 text-xs mt-1">
                          Usuario: {selectedProfile.userId?.email || 'N/A'}
                        </p>
                        <p className="text-dark-500 text-xs">
                          Enviado:{' '}
                          {selectedProfile.submittedAt
                            ? new Date(selectedProfile.submittedAt).toLocaleString('es-MX')
                            : 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProfile(null)}
                        className="text-dark-400 hover:text-white transition"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Fotos */}
                    {selectedProfile.photos && selectedProfile.photos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-dark-300 text-xs font-semibold uppercase mb-2">Fotos</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedProfile.photos.map((photo, i) => (
                            <img
                              key={i}
                              src={photo}
                              alt={`foto-${i + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border border-dark-600"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descripción */}
                    <div className="mb-4">
                      <p className="text-dark-300 text-xs font-semibold uppercase mb-1">
                        Descripción
                      </p>
                      <p className="text-white text-sm bg-dark-700/50 rounded-lg p-3">
                        {selectedProfile.description || (
                          <span className="text-dark-400 italic">Sin descripción</span>
                        )}
                      </p>
                    </div>

                    {/* Contacto */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-dark-400 text-xs mb-1">WhatsApp</p>
                        <p className="text-white text-sm font-mono">
                          {selectedProfile.whatsapp || (
                            <span className="text-dark-500 italic">No proporcionado</span>
                          )}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-dark-400 text-xs mb-1">Telegram</p>
                        <p className="text-white text-sm font-mono">
                          {selectedProfile.telegram || (
                            <span className="text-dark-500 italic">No proporcionado</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Alertas de fraude */}
                    {selectedProfile.fraudFlags && selectedProfile.fraudFlags.length > 0 && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 font-semibold text-sm">
                            Alertas Antifraude Detectadas ({selectedProfile.fraudFlags.length})
                          </p>
                        </div>
                        <ul className="space-y-1">
                          {selectedProfile.fraudFlags.map((flag, i) => (
                            <li key={i} className="text-red-300 text-xs flex items-start gap-1">
                              <span className="mt-0.5">⚠</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Acciones de aprobación */}
                    <div className="border-t border-dark-600 pt-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveProfile(selectedProfile._id)}
                          disabled={reviewingId === selectedProfile._id}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition"
                        >
                          {reviewingId === selectedProfile._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Aprobar y Publicar
                        </button>
                        <div className="flex-1 space-y-2">
                          <textarea
                            value={rejectNotes[selectedProfile._id] || ''}
                            onChange={(e) =>
                              setRejectNotes((prev) => ({
                                ...prev,
                                [selectedProfile._id]: e.target.value,
                              }))
                            }
                            placeholder="Motivo de rechazo (obligatorio)..."
                            rows={2}
                            className="w-full bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 text-sm px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200/20 resize-none"
                          />
                          <button
                            onClick={() => handleRejectProfile(selectedProfile._id)}
                            disabled={reviewingId === selectedProfile._id}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-300 font-semibold py-2 px-4 rounded-xl border border-red-500/40 transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de perfiles pendientes */}
                <div className="space-y-3">
                  {pendingProfiles.map((profile) => (
                    <div
                      key={profile._id}
                      className={`bg-dark-800/50 p-4 rounded-2xl border transition cursor-pointer ${
                        selectedProfile?._id === profile._id
                          ? 'border-amber-500/60'
                          : profile.fraudFlags && profile.fraudFlags.length > 0
                          ? 'border-red-500/30 hover:border-red-500/50'
                          : 'border-dark-700 hover:border-amber-500/30'
                      }`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Miniatura */}
                          {profile.photos && profile.photos[0] ? (
                            <img
                              src={profile.photos[0]}
                              alt={profile.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-6 h-6 text-dark-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{profile.name}</p>
                              {/* Badge de prioridad */}
                              {profile.verificationPriority === 'vip' && (
                                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                                  👑 VIP
                                </span>
                              )}
                              {profile.verificationPriority === 'priority' && (
                                <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                                  ⭐ Premium
                                </span>
                              )}
                              {profile.fraudFlags && profile.fraudFlags.length > 0 && (
                                <span className="flex items-center gap-1 bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">
                                  <Flag className="w-3 h-3" />
                                  {profile.fraudFlags.length} alerta(s)
                                </span>
                              )}
                            </div>
                            <p className="text-dark-400 text-sm">
                              {profile.age} años · {profile.location?.city}, {profile.location?.state}
                            </p>
                            <p className="text-dark-500 text-xs">{profile.userId?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-dark-400 text-xs">
                            {profile.submittedAt
                              ? new Date(profile.submittedAt).toLocaleDateString('es-MX')
                              : new Date(profile.createdAt).toLocaleDateString('es-MX')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveProfile(profile._id);
                            }}
                            disabled={reviewingId === profile._id}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition"
                            title="Aprobar"
                          >
                            {reviewingId === profile._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfile(profile);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                            title="Rechazar (con motivo)"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB: SOPORTE === */}
        {currentTab === 'support' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Tickets de Soporte</h2>
              <button
                onClick={loadSupportTickets}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {/* Filtros por estado */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => {
                const labels: Record<string, string> = { all: 'Todos', open: 'Abiertos', in_progress: 'En proceso', resolved: 'Resueltos' };
                const count = f === 'all' ? supportTickets.length : supportTickets.filter(t => t.status === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setSupportFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      supportFilter === f ? 'bg-green-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {labels[f]}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${supportFilter === f ? 'bg-white/20' : 'bg-dark-600'}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {supportLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : (
              <div className="flex gap-4 h-full min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
                {/* Lista de tickets */}
                <div className="w-80 shrink-0 overflow-y-auto space-y-2 pr-1">
                  {supportTickets
                    .filter(t => supportFilter === 'all' || t.status === supportFilter)
                    .length === 0 ? (
                    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8 text-center">
                      <MessageSquare className="w-10 h-10 text-dark-500 mx-auto mb-3" />
                      <p className="text-dark-400 text-sm">Sin tickets</p>
                    </div>
                  ) : (
                    supportTickets
                      .filter(t => supportFilter === 'all' || t.status === supportFilter)
                      .map((ticket: any) => (
                        <button
                          key={ticket._id}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setReplyText('');
                            setAdminNote(ticket.adminNotes || '');
                          }}
                          className={`w-full text-left rounded-xl p-4 border transition ${
                            selectedTicket?._id === ticket._id
                              ? 'border-green-500 bg-green-500/10'
                              : 'bg-dark-800/50 border-dark-700 hover:border-dark-500 hover:bg-dark-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              ticket.plan === 'vip' ? 'bg-yellow-500/20 text-yellow-300'
                                : ticket.plan === 'premium' ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>{ticket.plan?.toUpperCase()}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              ticket.status === 'open' ? 'bg-red-500/20 text-red-300'
                                : ticket.status === 'resolved' ? 'bg-green-500/20 text-green-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {ticket.status === 'open' ? 'Abierto' : ticket.status === 'resolved' ? 'Resuelto' : 'En proceso'}
                            </span>
                            {(ticket.replies?.length ?? 0) > 0 && (
                              <span className="text-xs bg-dark-600 text-dark-300 px-1.5 py-0.5 rounded-full">
                                {ticket.replies.length} resp.
                              </span>
                            )}
                          </div>
                          <p className="text-white text-sm font-semibold line-clamp-1">{ticket.subject}</p>
                          <p className="text-dark-400 text-xs mt-0.5 truncate">{ticket.userEmail}</p>
                          <p className="text-dark-500 text-xs mt-0.5">
                            {new Date(ticket.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </button>
                      ))
                  )}
                </div>

                {/* Panel de detalle */}
                {selectedTicket ? (
                  <div className="flex-1 bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl flex flex-col overflow-hidden">
                    {/* Header del ticket */}
                    <div className="p-5 border-b border-dark-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              selectedTicket.plan === 'vip' ? 'bg-yellow-500/20 text-yellow-300'
                                : selectedTicket.plan === 'premium' ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>{selectedTicket.plan?.toUpperCase()}</span>
                            <span className="text-dark-400 text-xs">{selectedTicket.userEmail}</span>
                            <span className="text-dark-500 text-xs">
                              {new Date(selectedTicket.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="text-white font-bold text-lg leading-tight">{selectedTicket.subject}</h3>
                        </div>
                        {/* Selector de estado */}
                        <select
                          value={selectedTicket.status}
                          onChange={e => handleChangeTicketStatus(selectedTicket._id, e.target.value)}
                          className={`text-sm font-medium rounded-lg px-3 py-1.5 border-0 outline-none cursor-pointer ${
                            selectedTicket.status === 'open' ? 'bg-red-500/20 text-red-300'
                              : selectedTicket.status === 'resolved' ? 'bg-green-500/20 text-green-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          <option value="open">Abierto</option>
                          <option value="in_progress">En proceso</option>
                          <option value="resolved">Resuelto</option>
                          <option value="closed">Cerrado</option>
                        </select>
                      </div>
                    </div>

                    {/* Hilo de conversación */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      {/* Mensaje original */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-xs text-dark-300">U</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-dark-200">{selectedTicket.userEmail}</span>
                            <span className="text-xs text-dark-500">
                              {new Date(selectedTicket.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="bg-dark-700 rounded-2xl rounded-tl-sm p-4">
                            <p className="text-dark-100 text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Respuestas */}
                      {(selectedTicket.replies || []).map((reply: any, i: number) => (
                        <div key={i} className={`flex gap-3 ${reply.from === 'admin' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                            reply.from === 'admin' ? 'bg-green-600' : 'bg-dark-600'
                          }`}>
                            <span className="text-xs text-white">{reply.from === 'admin' ? 'A' : 'U'}</span>
                          </div>
                          <div className={`flex-1 ${reply.from === 'admin' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-dark-200">
                                {reply.from === 'admin' ? 'Admin' : selectedTicket.userEmail}
                              </span>
                              <span className="text-xs text-dark-500">
                                {new Date(reply.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`rounded-2xl p-4 max-w-xl ${
                              reply.from === 'admin'
                                ? 'bg-green-600/20 border border-green-600/30 rounded-tr-sm'
                                : 'bg-dark-700 rounded-tl-sm'
                            }`}>
                              <p className="text-dark-100 text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notas internas */}
                    <div className="px-5 pb-3 border-t border-dark-700 pt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">🔒 Nota interna (solo admin)</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Ej: Usuario ya fue contactado por WhatsApp..."
                          className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={handleSaveNote}
                          disabled={savingNote}
                          className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                        </button>
                      </div>
                    </div>

                    {/* Caja de respuesta */}
                    <div className="p-4 border-t border-dark-600 bg-dark-800/50">
                      <div className="flex gap-3 items-end">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendReply();
                          }}
                          placeholder="Escribe tu respuesta... (Ctrl+Enter para enviar)"
                          rows={3}
                          className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-400 outline-none focus:border-green-500 resize-none"
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                        >
                          {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Enviar
                        </button>
                      </div>
                      <p className="text-dark-500 text-xs mt-1.5">El usuario recibirá una notificación con tu respuesta.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-dark-800/50 border border-dark-700 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                    <MessageSquare className="w-14 h-14 text-dark-600 mb-4" />
                    <p className="text-dark-400 font-medium">Selecciona un ticket</p>
                    <p className="text-dark-500 text-sm mt-1">Haz clic en un ticket de la lista para ver su contenido y responder</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
