import { Notification } from '@/models/Notification';
import { connectDB } from '@/lib/db';

export type NotificationType = 
  | 'welcome'
  | 'subscription'
  | 'profile_approved'
  | 'profile_rejected'
  | 'profile_verified'
  | 'payment'
  | 'favorite'
  | 'reminder'
  | 'general';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Crea una nueva notificación para un usuario
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB();
    
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
    });

    // Emitir evento de WebSocket si la función global está disponible
    if (typeof global.emitNotificationToUser === 'function') {
      global.emitNotificationToUser(params.userId, {
        _id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        read: false,
        createdAt: notification.createdAt.toISOString(),
      });
    }

    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Crea múltiples notificaciones (útil para notificaciones masivas)
 */
export async function createBulkNotifications(notifications: CreateNotificationParams[]) {
  try {
    await connectDB();
    
    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Error al crear notificaciones masivas:', error);
    throw error;
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function markAllAsRead(userId: string) {
  try {
    await connectDB();
    
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    return result;
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    throw error;
  }
}

/**
 * Obtiene el conteo de notificaciones no leídas de un usuario
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    await connectDB();
    
    const count = await Notification.countDocuments({
      userId,
      read: false,
    });
    
    return count;
  } catch (error) {
    console.error('Error al obtener conteo de no leídas:', error);
    return 0;
  }
}

/**
 * Elimina notificaciones antiguas (más de 90 días)
 * Se puede ejecutar periódicamente para limpiar la base de datos
 */
export async function cleanOldNotifications() {
  try {
    await connectDB();
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: ninetyDaysAgo },
      read: true,
    });
    
    console.log(`Eliminadas ${result.deletedCount} notificaciones antiguas`);
    return result;
  } catch (error) {
    console.error('Error al limpiar notificaciones antiguas:', error);
    throw error;
  }
}

// Templates de notificaciones comunes
export const NotificationTemplates = {
  welcome: (name: string) => ({
    type: 'welcome' as NotificationType,
    title: '¡Bienvenido a LuxProfile MX!',
    message: `Hola ${name}, gracias por unirte a nuestra plataforma. Comienza creando tu perfil profesional.`,
    link: '/dashboard/perfil/crear',
  }),

  profileApproved: (profileName: string, profileId: string) => ({
    type: 'profile_approved' as NotificationType,
    title: '✅ Perfil Aprobado',
    message: `Tu perfil "${profileName}" ha sido aprobado y ahora es visible públicamente.`,
    link: `/perfiles/${profileId}`,
  }),

  profileRejected: (profileName: string, reason: string) => ({
    type: 'profile_rejected' as NotificationType,
    title: '❌ Perfil Rechazado',
    message: `Tu perfil "${profileName}" fue rechazado. Motivo: ${reason}`,
    link: '/dashboard/perfil',
  }),

  subscriptionExpiring: (daysLeft: number) => ({
    type: 'reminder' as NotificationType,
    title: '⏰ Suscripción por Vencer',
    message: `Tu suscripción vence en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}. Renueva para seguir disfrutando de los beneficios.`,
    link: '/dashboard/planes',
  }),

  subscriptionExpired: () => ({
    type: 'subscription' as NotificationType,
    title: '⚠️ Suscripción Vencida',
    message: 'Tu suscripción ha vencido. Renueva tu plan para seguir promocionando tu perfil.',
    link: '/dashboard/planes',
  }),

  paymentReceived: (amount: number, plan: string) => ({
    type: 'payment' as NotificationType,
    title: '💳 Pago Recibido',
    message: `Se ha procesado tu pago de $${amount} MXN por el plan ${plan.toUpperCase()}.`,
    link: '/dashboard',
  }),

  profileFavorited: (userName: string) => ({
    type: 'favorite' as NotificationType,
    title: '❤️ Nuevo Favorito',
    message: `A ${userName} le gustó tu perfil y lo agregó a favoritos.`,
    link: '/dashboard/perfil',
  }),

  profileVerified: (profileName: string) => ({
    type: 'profile_verified' as NotificationType,
    title: '🔵 Perfil Verificado',
    message: `¡Felicidades! Tu perfil "${profileName}" ha sido verificado.`,
    link: '/dashboard/perfil',
  }),
};
