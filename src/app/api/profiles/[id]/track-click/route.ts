import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { Notification } from '@/models/Notification';
import { createNotification } from '@/lib/shared/notifications';

// Throttle en memoria: evita notificar al dueño más de 1 vez cada 10 min por perfil
const viewNotifyCache = new Map<string, number>();
const VIEW_NOTIFY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { type } = await request.json();

    const updateField: any = {};
    
    if (type === 'whatsapp') {
      updateField['stats.whatsappClicks'] = 1;
    } else if (type === 'telegram') {
      updateField['stats.telegramClicks'] = 1;
    } else if (type === 'favorite') {
      updateField['stats.favorites'] = 1;
    } else if (type === 'view') {
      updateField['stats.views'] = 1;
    }

    const profile = await Profile.findByIdAndUpdate(
      params.id,
      { $inc: updateField },
      { new: true }
    ).select('userId name stats.views');

    // Notificar al dueño del perfil cuando alguien lo visita (throttled)
    if (type === 'view' && profile?.userId) {
      const cacheKey = params.id;
      const lastNotified = viewNotifyCache.get(cacheKey) ?? 0;
      const now = Date.now();

      if (now - lastNotified > VIEW_NOTIFY_INTERVAL_MS) {
        viewNotifyCache.set(cacheKey, now);

        try {
          const totalViews = profile.stats?.views ?? 1;
          await createNotification({
            userId: profile.userId.toString(),
            type: 'general',
            title: '👀 Alguien vio tu perfil',
            message: `Tu perfil tiene ${totalViews} vista${totalViews !== 1 ? 's' : ''} en total. ¡Sigue así!`,
            link: '/dashboard/analiticas',
            metadata: { profileId: params.id, views: totalViews },
          });
        } catch {
          // No bloquear si falla la notificación
        }
      }
    }

    // Notificar al dueño cuando alguien hace clic en WhatsApp
    if (type === 'whatsapp' && profile?.userId) {
      try {
        await createNotification({
          userId: profile.userId.toString(),
          type: 'general',
          title: '📱 ¡Nuevo contacto por WhatsApp!',
          message: `Alguien hizo clic en tu WhatsApp desde tu perfil en PlacerLux.`,
          link: '/dashboard/analiticas',
          metadata: { profileId: params.id },
        });
      } catch {
        // No bloquear si falla la notificación
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Click registrado'
    });
  } catch (error) {
    console.error('Error al registrar click:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar click' },
      { status: 500 }
    );
  }
}
