import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/models/Subscription';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// POST - Cancelar suscripción
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

    let subscriptionId: string | undefined;
    try {
      const data = await req.json();
      subscriptionId = data?.subscriptionId;
    } catch {
      // body vacío, buscar por userId
    }

    const query: Record<string, unknown> = { userId, status: 'active' };
    if (subscriptionId) query._id = subscriptionId;

    const subscription = await Subscription.findOne(query);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    return NextResponse.json(
      {
        message: 'Suscripción cancelada exitosamente',
        subscription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}
