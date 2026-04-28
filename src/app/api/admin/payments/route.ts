import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que es admin
    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sin permisos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (status && ['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    // Obtener pagos con paginación
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('userId', 'email')
        .populate('profileId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    // Totales para resumen
    const [totalCompleted, totalPending, totalFailed, revenueAgg] = await Promise.all([
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;

    return NextResponse.json({
      success: true,
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: { totalCompleted, totalPending, totalFailed, totalRevenue },
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}

