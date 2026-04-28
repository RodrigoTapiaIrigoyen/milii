import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { Subscription } from '@/models/Subscription';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';
import { runFraudChecks } from '@/lib/shared/fraud-detection';

// =============================================
// POST - Enviar perfil a revisión del admin (requiere suscripción activa)
// =============================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json(
        { error: 'No tienes un perfil creado' },
        { status: 404 }
      );
    }

    // Validar que el perfil esté completo
    if (!profile.name || !profile.age || profile.photos.length === 0) {
      return NextResponse.json(
        { error: 'Completa tu perfil antes de publicar (nombre, edad y al menos 1 foto)' },
        { status: 400 }
      );
    }

    // No permitir re-envío si ya está aprobado o en revisión
    if (profile.approvalStatus === 'approved') {
      return NextResponse.json(
        { error: 'Tu perfil ya está aprobado y publicado' },
        { status: 400 }
      );
    }
    if (profile.approvalStatus === 'pending_review') {
      return NextResponse.json(
        { error: 'Tu perfil ya está en revisión. El admin lo revisará pronto.' },
        { status: 400 }
      );
    }

    // Verificar suscripción activa
    const activeSubscription = await Subscription.findOne({
      userId,
      profileId: profile._id,
      status: 'active',
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'Necesitas una suscripción activa para publicar tu perfil' },
        { status: 403 }
      );
    }

    // Obtener IP del cliente
    const submissionIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Ejecutar chequeos antifraude automáticos
    const fraudFlags = await runFraudChecks(profile, submissionIp);

    // Prioridad de revisión según plan
    const priorityMap: Record<string, 'normal' | 'priority' | 'vip'> = {
      free: 'normal',
      premium: 'priority',
      vip: 'vip',
    };
    const verificationPriority = priorityMap[activeSubscription.plan] || 'normal';

    // Mensajes de tiempo estimado por plan
    const estimatedTimeMsg: Record<string, string> = {
      normal: 'generalmente en 24–48 horas',
      priority: 'generalmente en menos de 24 horas (plan Premium)',
      vip: 'en pocas horas como usuario VIP',
    };

    // Actualizar perfil: enviar a revisión (NO publicar aún)
    profile.approvalStatus = 'pending_review';
    profile.verificationPriority = verificationPriority;
    profile.submittedAt = new Date();
    profile.submissionIp = submissionIp;
    profile.fraudFlags = fraudFlags;
    profile.isPremium = activeSubscription.plan !== 'free';
    profile.expiresAt = activeSubscription.endDate;
    // isPublished permanece false hasta que el admin apruebe

    await profile.save();

    // Notificar al usuario
    await createNotification({
      userId: userId.toString(),
      type: 'general',
      title: 'Perfil enviado a revisión',
      message: `Tu perfil fue enviado al equipo de revisión. Te notificaremos cuando sea aprobado (${estimatedTimeMsg[verificationPriority]}).`,
      link: '/dashboard/perfil',
    });

    return NextResponse.json(
      {
        message:
          'Tu perfil fue enviado a revisión. Recibirás una notificación cuando sea aprobado.',
        approvalStatus: 'pending_review',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /profiles/my-profile/publish:', error);
    return NextResponse.json(
      { error: 'Error al enviar perfil a revisión' },
      { status: 500 }
    );
  }
}
