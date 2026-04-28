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

    const data = await req.json();
    const { subscriptionId } = data;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

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
