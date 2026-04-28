'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  refreshNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  unreadCount: 0,
  refreshNotifications: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true&limit=1');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    // Obtener token de autenticación de las cookies
    const getAuthToken = () => {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const token = getAuthToken();
    
    // Solo conectar si hay token (usuario autenticado)
    if (!token) {
      console.log('No auth token found, skipping WebSocket connection');
      return;
    }

    console.log('Initializing WebSocket connection...');
    
    // Crear conexión Socket.io
    const socketInstance = io({
      path: '/api/socket',
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Eventos de conexión
    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected:', socketInstance.id);
      setIsConnected(true);
      // Cargar contador inicial
      refreshNotifications();
    });

    socketInstance.on('connected', (data) => {
      console.log('Authenticated as user:', data.userId);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      setIsConnected(false);
    });

    // Eventos de notificaciones
    socketInstance.on('new-notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      }
    });

    socketInstance.on('refresh-notifications', () => {
      console.log('🔄 Refresh notifications triggered');
      refreshNotifications();
    });

    socketInstance.on('notification-read', () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socketInstance.on('all-notifications-read', () => {
      setUnreadCount(0);
    });

    // Ping para mantener conexión
    const pingInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('ping');
      }
    }, 30000); // Cada 30 segundos

    setSocket(socketInstance);

    // Solicitar permiso para notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Cleanup
    return () => {
      console.log('Cleaning up WebSocket connection');
      clearInterval(pingInterval);
      socketInstance.disconnect();
    };
  }, []); // Solo ejecutar una vez al montar

  const value = {
    socket,
    isConnected,
    unreadCount,
    refreshNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
