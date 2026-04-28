import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { createNotification } from '@/lib/shared/notifications';

interface Params {
  params: {
    id: string;
  };
}

// PUT: Aprobar o rechazar una reseña
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { status, reason } = await req.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id).populate('profileId');
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    review.status = status;
    await review.save();

    // Notificar al autor
    try {
      const profile = review.profileId as any;
      await createNotification({
        userId: review.reviewerId.toString(),
        type: 'general',
        title: status === 'approved' ? '✅ Reseña Aprobada' : '❌ Reseña Rechazada',
        message: status === 'approved' 
          ? 'Tu reseña ha sido aprobada y ahora es visible públicamente.'
          : `Tu reseña fue rechazada. ${reason || 'No cumple con nuestras políticas.'}`,
        link: status === 'approved' ? `/perfiles/${profile._id}` : undefined,
      });
    } catch (notifError) {
      console.error('Error al notificar moderación:', notifError);
    }

    return NextResponse.json({
      message: `Reseña ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`,
      review,
    });
  } catch (error) {
    console.error('Error al moderar reseña:', error);
    return NextResponse.json(
      { error: 'Error al moderar reseña' },
      { status: 500 }
    );
  }
}
