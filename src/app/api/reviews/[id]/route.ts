import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { Profile } from '@/models/Profile';
import { createNotification } from '@/lib/shared/notifications';

interface Params {
  params: {
    id: string;
  };
}

// PUT: Responder a una reseña (dueño del perfil)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { response } = await req.json();

    if (!response || response.length < 5 || response.length > 500) {
      return NextResponse.json(
        { error: 'La respuesta debe tener entre 5 y 500 caracteres' },
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

    // Verificar que sea el dueño del perfil
    const profile = review.profileId as any;
    if (profile.userId.toString() !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Actualizar respuesta
    review.response = response;
    review.respondedAt = new Date();
    await review.save();

    // Notificar al autor de la reseña
    try {
      await createNotification({
        userId: review.reviewerId.toString(),
        type: 'general',
        title: '💬 Respuesta a tu Reseña',
        message: `El perfil respondió a tu reseña.`,
        link: `/perfiles/${profile._id}`,
      });
    } catch (notifError) {
      console.error('Error al notificar respuesta:', notifError);
    }

    return NextResponse.json({
      message: 'Respuesta publicada exitosamente',
      review,
    });
  } catch (error) {
    console.error('Error al responder reseña:', error);
    return NextResponse.json(
      { error: 'Error al responder reseña' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una reseña (solo admin o el autor)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Solo el autor o un admin pueden eliminar
    if (review.reviewerId.toString() !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await review.deleteOne();

    return NextResponse.json({
      message: 'Reseña eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reseña' },
      { status: 500 }
    );
  }
}

// POST: Marcar reseña como útil/no útil
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { type } = await req.json(); // 'helpful' or 'unhelpful'

    if (!type || !['helpful', 'unhelpful'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    const userId = auth.user.id;

    // Remover votos previos
    const wasHelpful = review.helpfulBy.includes(userId as any);
    const wasUnhelpful = review.unhelpfulBy.includes(userId as any);

    if (wasHelpful) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    }

    if (wasUnhelpful) {
      review.unhelpfulBy = review.unhelpfulBy.filter(id => id.toString() !== userId);
      review.unhelpful = Math.max(0, review.unhelpful - 1);
    }

    // Agregar nuevo voto si es diferente al anterior
    if (type === 'helpful' && !wasHelpful) {
      review.helpfulBy.push(userId as any);
      review.helpful++;
    } else if (type === 'unhelpful' && !wasUnhelpful) {
      review.unhelpfulBy.push(userId as any);
      review.unhelpful++;
    }

    await review.save();

    return NextResponse.json({
      message: 'Voto registrado',
      helpful: review.helpful,
      unhelpful: review.unhelpful,
    });
  } catch (error) {
    console.error('Error al votar reseña:', error);
    return NextResponse.json(
      { error: 'Error al votar reseña' },
      { status: 500 }
    );
  }
}
