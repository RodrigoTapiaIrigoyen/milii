'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Trash2, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { socket, isConnected, refreshNotifications: refreshUnreadCount } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // Escuchar eventos de WebSocket
  useEffect(() => {
    if (!socket) return;

    // Nueva notificación recibida
    socket.on('new-notification', (notification) => {
      console.log('Nueva notificación en tiempo real:', notification);
      // Si estamos viendo todas o no leídas, agregar al inicio
      if (filter === 'all' || filter === 'unread') {
        setNotifications(prev => [notification, ...prev]);
      }
    });

    // Solicitud de refresco
    socket.on('refresh-notifications', () => {
      fetchNotifications();
    });

    return () => {
      socket.off('new-notification');
      socket.off('refresh-notifications');
    };
  }, [socket, filter]);

  const fetchNotifications = async () => {
    try {
      const url = filter === 'unread' 
        ? '/api/notifications?unreadOnly=true&limit=50'
        : '/api/notifications?limit=50';
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
        // Actualizar contador en el bell icon
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        // Actualizar contador en el bell icon
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'welcome':
        return '👋';
      case 'subscription':
        return '⭐';
      case 'profile_approved':
        return '✅';
      case 'profile_rejected':
        return '❌';
      case 'profile_verified':
        return '🔵';
      case 'payment':
        return '💳';
      case 'favorite':
        return '❤️';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notificaciones
            {/* Indicador de conexión WebSocket */}
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Wifi className="w-3 h-3" />
                En tiempo real
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-normal text-dark-600 bg-dark-100 px-3 py-1 rounded-full">
                <WifiOff className="w-3 h-3" />
                Sin conexión
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <p className="text-dark-600 mt-2">
              Tienes {unreadCount} {unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-500 text-white rounded-lg hover:bg-luxury-600 transition disabled:opacity-50"
          >
            {markingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-luxury-500 text-white'
              : 'bg-dark-50 text-dark-700 hover:bg-dark-100'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unread'
              ? 'bg-luxury-500 text-white'
              : 'bg-dark-50 text-dark-700 hover:bg-dark-100'
          }`}
        >
          No leídas {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Lista de notificaciones */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-dark-50 rounded-xl">
          <Bell className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-900 mb-2">
            {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
          </h3>
          <p className="text-dark-600">
            {filter === 'unread'
              ? 'Estás al día con todas tus notificaciones'
              : 'Cuando recibas notificaciones aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-xl border transition group ${
                notification.read
                  ? 'bg-white border-dark-100'
                  : 'bg-luxury-50 border-luxury-200'
              } ${notification.link ? 'cursor-pointer hover:border-luxury-400' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold ${
                      notification.read ? 'text-dark-900' : 'text-luxury-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-dark-500 whitespace-nowrap">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-dark-600 text-sm leading-relaxed">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <span className="text-xs text-luxury-600 mt-2 inline-block">
                      Ver más →
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-2 hover:bg-dark-100 rounded-lg transition"
                      title="Marcar como leída"
                    >
                      <Check className="w-4 h-4 text-dark-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('¿Eliminar esta notificación?')) {
                        deleteNotification(notification._id);
                      }
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
