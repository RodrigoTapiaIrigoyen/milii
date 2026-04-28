'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function NotificationBell() {
  const { unreadCount, isConnected } = useWebSocket();

  return (
    <Link
      href="/dashboard/notificaciones"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-dark-100 transition"
      title={isConnected ? 'Notificaciones (Tiempo real)' : 'Notificaciones'}
    >
      <Bell className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-dark-700'}`} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {/* Indicador de conexión WebSocket */}
      {isConnected && (
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
      )}
    </Link>
  );
}
