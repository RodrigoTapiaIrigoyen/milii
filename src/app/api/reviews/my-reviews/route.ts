import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { Profile } from '@/models/Profile';
import { createNotification } from '@/lib/shared/notifications';

// GET: Obtener reseñas pendientes de MIS perfiles
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar perfil del usuario
    const profile = await Profile.findOne({ userId: auth.user.id });
    if (!profile) {
      return NextResponse.json({ reviews: [], count: 0 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const reviews = await Review.find({
      profileId: profile._id,
      status,
    })
      .populate('reviewerId', 'email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error al obtener reseñas pendientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    );
  }
}

// PATCH: Aprobar o rechazar una reseña
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { reviewId, action, reason } = await req.json();

    if (!reviewId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Datos inválidos. Se requiere reviewId y action (approve/reject)' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario es dueño del perfil
    const profile = await Profile.findById(review.profileId);
    if (!profile || profile.userId.toString() !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (review.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta reseña ya fue procesada' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      review.status = 'approved';
      await review.save();

      // Notificar al autor
      try {
        await createNotification({
          userId: review.reviewerId.toString(),
          type: 'general',
          title: '✅ Reseña Aprobada',
          message: 'Tu reseña ha sido aprobada y ya es visible en el perfil.',
          link: `/perfiles/${profile._id}`,
        });
      } catch (e) {
        console.error('Error al notificar aprobación:', e);
      }

      return NextResponse.json({
        message: 'Reseña aprobada exitosamente',
        review,
      });
    } else {
      // Rechazar
      review.status = 'rejected';
      await review.save();

      // Contar rechazos del dueño del perfil
      const rejectedCount = await Review.countDocuments({
        profileId: profile._id,
        status: 'rejected',
      });

      // Si el dueño rechaza 3+ reseñas, marcar perfil para revisión admin
      if (rejectedCount >= 3) {
        profile.status = {
          isActive: profile.status.isActive,
          isSuspended: true,
          suspensionReason: 'Perfil bajo revisión: múltiples reseñas rechazadas. Un administrador revisará tu caso.',
        };
        await profile.save();

        try {
          await createNotification({
            userId: auth.user.id,
            type: 'general',
            title: '⚠️ Perfil en Revisión',
            message: 'Tu perfil ha sido suspendido temporalmente por rechazar múltiples reseñas. Un administrador revisará tu caso.',
            link: '/dashboard/perfil',
          });
        } catch (e) {
          console.error('Error al notificar suspensión:', e);
        }
      }

      // Notificar al autor del rechazo
      try {
        await createNotification({
          userId: review.reviewerId.toString(),
          type: 'general',
          title: '❌ Reseña No Aprobada',
          message: reason
            ? `Tu reseña no fue aprobada. Motivo: ${reason}`
            : 'Tu reseña no fue aprobada por el perfil.',
          link: `/perfiles/${profile._id}`,
        });
      } catch (e) {
        console.error('Error al notificar rechazo:', e);
      }

      return NextResponse.json({
        message: 'Reseña rechazada',
        review,
        warning: rejectedCount >= 3
          ? 'Tu perfil ha sido suspendido por rechazar múltiples reseñas.'
          : null,
      });
    }
  } catch (error) {
    console.error('Error al moderar reseña:', error);
    return NextResponse.json(
      { error: 'Error al moderar reseña' },
      { status: 500 }
    );
  }
}
