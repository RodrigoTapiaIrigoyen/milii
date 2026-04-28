'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Save,
  Mail,
  Lock,
  Bell,
  Shield,
  Trash2,
  User as UserIcon,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  // Estado para cambiar email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Estado para cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Estado para eliminar cuenta
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setNewEmail(data.user.email);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !emailPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (newEmail === user?.email) {
      alert('El nuevo email es igual al actual');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Email inválido');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail,
          password: emailPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar email');
      }

      alert('Email actualizado exitosamente');
      setEmailPassword('');
      fetchUser();
    } catch (error: any) {
      alert(error.message || 'Error al cambiar email');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      alert('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert(error.message || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== 'eliminar') {
      alert('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    if (!deletePassword) {
      alert('Debes ingresar tu contraseña');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar cuenta');
      }

      alert('Cuenta eliminada exitosamente');
      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Error al eliminar cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setVerificationMessage('');
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar verificación');
      }

      setVerificationMessage(data.message);
      // Si estamos en desarrollo, mosremos el link
      if (data.verificationUrl) {
        console.log('Link de verificación:', data.verificationUrl);
        alert(`Link de verificación (desarrollo):\n${data.verificationUrl}`);
      }
    } catch (error: any) {
      setVerificationMessage(error.message || 'Error al enviar verificación');
    } finally {
      setSendingVerification(false);
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-dark-600 hover:text-dark-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark-900">Configuración</h1>
            <p className="text-sm text-dark-600">Gestiona tu cuenta y preferencias</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Banner de verificación de email */}
        {user && !user.emailVerified && (
          <div className="card-elevated p-6 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-yellow-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Verifica tu dirección de email
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Para mejorar la seguridad de tu cuenta y tener acceso a todas las funciones, 
                  verifica tu dirección de correo electrónico.
                </p>
                {verificationMessage && (
                  <div className="mb-4 p-3 bg-white border border-yellow-200 rounded-lg">
                    <p className="text-sm text-dark-700">{verificationMessage}</p>
                  </div>
                )}
                <button
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                  className="btn-primary gap-2 disabled:opacity-50"
                >
                  {sendingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar email de verificación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner de email verificado */}
        {user && user.emailVerified && (
          <div className="card-elevated p-4 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Tu email está verificado
              </p>
            </div>
          </div>
        )}

        {/* Información de la cuenta */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900">Información de la Cuenta</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-dark-100">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-dark-500" />
                <span className="text-sm text-dark-600">Email actual</span>
              </div>
              <span className="text-sm font-medium text-dark-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-dark-100">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-dark-500" />
                <span className="text-sm text-dark-600">Rol</span>
              </div>
              <span className="text-sm font-medium text-dark-900 uppercase">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-dark-500" />
                <span className="text-sm text-dark-600">Miembro desde</span>
              </div>
              <span className="text-sm font-medium text-dark-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Cambiar Email */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900">Cambiar Email</h2>
          </div>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Nuevo Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="nuevo@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Contraseña Actual (para confirmar)
              </label>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Tu contraseña actual"
              />
            </div>
            <button
              type="submit"
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
                  Actualizar Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900">Cambiar Contraseña</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  placeholder="Tu contraseña actual"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-sm text-dark-600 hover:text-dark-900 transition"
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar contraseñas
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Mostrar contraseñas
                  </>
                )}
              </button>
            </div>
            <button
              type="submit"
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
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>
        </div>

        {/* Notificaciones */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-dark-100">
              <div>
                <p className="font-medium text-dark-900">Nuevos mensajes</p>
                <p className="text-sm text-dark-600">Recibe notificaciones cuando tengas mensajes nuevos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-dark-100">
              <div>
                <p className="font-medium text-dark-900">Actualizaciones de suscripción</p>
                <p className="text-sm text-dark-600">Notificaciones sobre tu plan y pagos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark-900">Novedades y promociones</p>
                <p className="text-sm text-dark-600">Mantente al día con nuevas funciones</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-dark-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Zona de Peligro - Eliminar Cuenta */}
        <div className="card-elevated p-6 border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-900">Zona de Peligro</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-red-800">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten certeza.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900">Eliminar Cuenta</h3>
                <p className="text-sm text-dark-600">Esta acción es irreversible</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-dark-700">
                Se eliminarán permanentemente:
              </p>
              <ul className="text-sm text-dark-600 space-y-2 ml-4">
                <li>• Tu perfil y todas las fotos</li>
                <li>• Tus estadísticas y datos</li>
                <li>• Tu suscripción actual</li>
                <li>• Todo el historial de la cuenta</li>
              </ul>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Escribe "ELIMINAR" para confirmar
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  placeholder="ELIMINAR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Ingresa tu contraseña
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-dark-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                  setDeletePassword('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving || deleteConfirm.toLowerCase() !== 'eliminar' || !deletePassword}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar Definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
