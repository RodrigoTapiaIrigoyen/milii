import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { createNotification } from '@/lib/shared/notifications';

// GET: Obtener reseñas pendientes de moderación
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const reviews = await Review.find({ status })
      .populate('reviewerId', 'email')
      .populate('profileId', 'name category photos')
      .sort({ createdAt: -1 })
      .limit(50);

    // Estadísticas
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      reviews,
      stats: {
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        approved: stats.find(s => s._id === 'approved')?.count || 0,
        rejected: stats.find(s => s._id === 'rejected')?.count || 0,
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
