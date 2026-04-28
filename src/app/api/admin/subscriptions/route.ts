import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Subscription } from '@/models/Subscription';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const plan   = searchParams.get('plan');
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (plan   && ['free', 'premium', 'vip'].includes(plan))           filter.plan = plan;
    if (status && ['active', 'expired', 'cancelled'].includes(status)) filter.status = status;

    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('userId', 'email')
        .populate('profileId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    // Totales por plan
    const [totalFree, totalPremium, totalVip, totalActive] = await Promise.all([
      Subscription.countDocuments({ plan: 'free', status: 'active' }),
      Subscription.countDocuments({ plan: 'premium', status: 'active' }),
      Subscription.countDocuments({ plan: 'vip', status: 'active' }),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    return NextResponse.json({
      success: true,
      subscriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: { totalFree, totalPremium, totalVip, totalActive },
    });
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener suscripciones' },
      { status: 500 }
    );
  }
}
