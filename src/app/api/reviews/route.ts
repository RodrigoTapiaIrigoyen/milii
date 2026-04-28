import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Review from '@/models/Review';
import { Profile } from '@/models/Profile';
import { createNotification } from '@/lib/shared/notifications';
import mongoose from 'mongoose';

// POST: Crear una nueva reseña
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

    const { profileId, rating, comment } = await req.json();

    // Validación
    if (!profileId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json(
        { error: 'El comentario debe tener entre 10 y 1000 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // No permitir reseñar su propio perfil
    if (profile.userId.toString() === userId) {
      return NextResponse.json(
        { error: 'No puedes reseñar tu propio perfil' },
        { status: 400 }
      );
    }

    // Verificar si ya dejó una reseña
    const existingReview = await Review.findOne({
      profileId,
      reviewerId: userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has dejado una reseña para este perfil' },
        { status: 409 }
      );
    }

    // Crear reseña
    const review = await Review.create({
      profileId,
      reviewerId: userId,
      rating,
      comment,
      status: 'pending', // Requiere aprobación del dueño del perfil
    });

    // Notificar al dueño del perfil para que apruebe o rechace
    try {
      await createNotification({
        userId: profile.userId.toString(),
        type: 'general',
        title: '⭐ Nueva Reseña Pendiente',
        message: `Tienes una nueva reseña de ${rating} estrellas pendiente de aprobación.`,
        link: '/dashboard/perfil?tab=reviews',
      });
    } catch (notifError) {
      console.error('Error al notificar nueva reseña:', notifError);
    }

    return NextResponse.json(
      {
        message: 'Reseña enviada. Será revisada antes de publicarse.',
        review: {
          id: review._id,
          rating: review.rating,
          status: review.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear reseña:', error);
    
    // Manejar error de duplicado (por si acaso el índice único falla)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya has dejado una reseña para este perfil' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear reseña' },
      { status: 500 }
    );
  }
}

// GET: Obtener reseñas de un perfil
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId requerido' },
        { status: 400 }
      );
    }

    // Obtener reseñas aprobadas
    const reviews = await Review.find({
      profileId,
      status: 'approved',
    })
      .populate('reviewerId', 'email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calcular estadísticas
    const stats = await Review.aggregate([
      {
        $match: {
          profileId: new mongoose.Types.ObjectId(profileId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating',
          },
        },
      },
    ]);

    // Calcular distribución por estrellas
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratings.forEach((rating: number) => {
        distribution[rating as keyof typeof distribution]++;
      });
    }

    return NextResponse.json({
      reviews,
      stats: stats.length > 0
        ? {
            averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
            totalReviews: stats[0].totalReviews,
            distribution,
          }
        : {
            averageRating: 0,
            totalReviews: 0,
            distribution,
          },
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    );
  }
}
